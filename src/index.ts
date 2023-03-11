import Database from 'better-sqlite3';
import {execSync} from 'child_process';
import utils from 'relax-utils';
import crypto from 'crypto';

const randomBytes = utils.promisify(crypto.randomBytes);

// better-sqlite3有个坑，可以理解为，在better-sqlite3中，优先把number视为real,然后再存到sqlite
// 假设: create table topic(id text);
// 则，db.prepare('insert topic(id) values($id)').run({id:666})，
// 实际保存的值是 "666.0"
// 所以需要额外注意表中每个字段的类型。
// https://github.com/JoshuaWise/better-sqlite3/issues/627

// 还有一个参数坑:
// 当sql中没有参数时，statement相关的方法也不能传参数，否则会报错： RangeError: Too many parameter values were provided
// 例如：db.prepare('select * from topic').iterate(undefined) 会报错
// 要么不穿任何参数，要么写成： db.prepare('select * from topic').iterate({})

// 还有一个天坑
// better-sqlite3，参数不会做自动转换，只允许下面这些类型:
// SQLite3 can only bind numbers, strings, bigints, buffers, and null


namespace DB {
    export type TLogger = {
        error: (...args: any[]) => void,
        info: (...args: any[]) => void,
        debug: (...args: any[]) => void
    };
// schema结构:
//  {
//      [tableName:string]: string[]  // column名称数组
//  }
    export type TTableSchema = { [tableName: string]: string[] };
    export type TRowObj = { [columnName: string]: any };
    export type TEachCallback = (row: TRowObj) => any | Promise<any>;

    export interface IDbParam {
        dbFilePath: string,
        initSqlFiles: string[],
        tableSchema: TTableSchema,
        verbose: boolean,
        logger?: TLogger
    }
}


class DB {
    /** @internal */
    tableSchema: DB.TTableSchema
    /** @internal */
    logger: DB.TLogger
    /** @internal */
    db: Database.Database;

    constructor({
                    dbFilePath,
                    initSqlFiles = [],
                    tableSchema,
                    verbose = false,
                    logger = undefined
                }: DB.IDbParam) {

        this.tableSchema = tableSchema;
        this.logger = logger || {
            error: console.error,
            info: console.log,
            debug: console.log
        }

        this.logger.debug('[init] file:' + dbFilePath)

        try {
            initSqlFiles.forEach((sqlFilePath) => {
                const cmd = `sqlite3 ${dbFilePath} < ${sqlFilePath}`;
                this.logger.info('[init] exec init file:', sqlFilePath);
                execSync(cmd);
            })
            this.logger.info('[init] exec init file success');

            this.db = new Database(dbFilePath, {
                verbose: verbose ? this.logger.info : undefined,
                fileMustExist: false
            });

            this.logger.info('[init] new Database success');

            // process.on('SIGINT', () => { // pm2退出事件
            //
            // });

        } catch (e) {
            this.logger.error('[init] sqlite3 error', e.message, ',json:', JSON.stringify(e));
            throw e;
        }

    }

    modifySchema(schema: DB.TTableSchema) {
        Object.assign(this.tableSchema, schema);
    }

    pragma(cmd: string) {
        return this.db.pragma(cmd);
    }

    /** @internal */
    generateWhereClause(tbName: string,
                        param: DB.TRowObj,
                        pattern: string[] = []) {
        const logger = this.logger;
        const tbColumns = this.tableSchema[tbName];

        // 筛选paramColumns为同时在tbColumns和param中的列。
        let paramColumns = tbColumns.filter(key => param[key] != null);
        if (param.rowid) paramColumns.push('rowid');
        if (paramColumns.length === 0) {
            logger.error('[select] has no valid prop in param:', param, ';table:', tbName);
            throw new Error('SQL ERROR: has no valid prop in param');
        }

        let clause = 'where ';
        clause += paramColumns.map(key => {
            let operator = ' = ';
            if (pattern.includes(key)) {
                operator = ' like ';
            }
            return key + operator + '$' + key
        }).join(' and ');

        const validParam = utils.pick(param, paramColumns);
        return {
            clause,
            validParam
        }
    }

    // param: { columnName: '123' }
    // pattern matching: 模糊查询。 pattern参数为string[]，模糊查询的列。
    // excludeColumns: string[], select排除的列
    // suffix: 添加在where从句之后的内容，如果没有where从句就是直接添加在from从句之后，例如group by/ order/ limit
    /** @internal */
    generateSelectSql(tbName: string,
                      param?: DB.TRowObj,  // 通过param生成where从句，传入null或undefined，视为搜索全部
                      excludeColumns: string[] = [],
                      pattern: string[] = [],
                      suffix = '') {

        const logger = this.logger;
        const tbColumns = this.tableSchema[tbName];
        const selectColumns = excludeColumns?.length ?
            tbColumns.filter(name => !excludeColumns.includes(name)) : tbColumns;

        let validParam = {};
        let sql = `select ${selectColumns.join(',')} from ${tbName}`;
        if (param) {
            const whereClauseResult = this.generateWhereClause(tbName, param, pattern);
            sql += ' ' + whereClauseResult.clause;
            validParam = whereClauseResult.validParam;
        }
        sql += ' ' + suffix;
        return {
            sql,
            param: validParam
        }
    }

    select(tbName: string,
           param?: DB.TRowObj,
           excludeColumns: string[] = [],
           pattern: string[] = [],
           suffix = '') {

        let sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern, suffix);

        return this.selectBySql(sqlObj.sql, sqlObj.param);
    }

    selectBySql(sql: string, param?: DB.TRowObj): DB.TRowObj[] {
        const logger = this.logger;
        logger.debug('[selectBySql] sql:', sql, `,sqlValues:`, param);
        return this.db.prepare(sql).all(param)
    }

    /**
     * @return Promise<number> - 返回retrieveLength
     */
    async each(tbName: string,
               eachCallback: DB.TEachCallback,
               param?: DB.TRowObj,
               excludeColumns: string[] = [],
               pattern: string[] = [],
               suffix = '') {
        let sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern, suffix);
        return this.eachBySql(sqlObj.sql, sqlObj.param, eachCallback);
    }

    /**
     * 报错会导致遍历不继续进行，并返回rejected promise.
     */
    async eachBySql(sql: string, param: DB.TRowObj | undefined, eachCallback: DB.TEachCallback) {
        const logger = this.logger;
        logger.debug('[each] sql:', sql, ',sqlValues:', param);

        const iterator = this.db.prepare(sql).iterate(param);

        for (const row of iterator) {
            await eachCallback(row);
        }
    }


    /**
     * param参数 示例: `{columnName:123}`
     */
    insert<T extends boolean>(tbName: string, param: DB.TRowObj, needId?: T) {
        const logger = this.logger;
        logger.debug('[insert]', tbName, param, `needId:${needId}`);
        const paramColumns = this.tableSchema[tbName].filter(c => param[c] != null);
        const sqlColumnsStr = paramColumns.join(',');
        const sqlValuesStr = paramColumns.map(c => '$' + c).join(',');
        let sql = `insert into ${tbName}(${sqlColumnsStr}) values(${sqlValuesStr})`;
        const sqlParam = utils.pick(param, paramColumns);
        return this.insertBySql(tbName, sql, sqlParam, needId);
    }

    /**
     * 如果needId为true，返回id字段，如果needId为false,返回rowid字段
     */
    insertBySql<T extends boolean>(tbName: string, sql: string, param: DB.TRowObj, needId?: T):
        T extends true ? any : number | bigint {
        const logger = this.logger;
        logger.debug('[insertBySql]', tbName, sql, param, `needId:${needId}`);
        let info;
        try {
            info = this.db.prepare(sql).run(param);
        } catch (e) {
            logger.error('[insert] run error', sql, e.message, 'json:', JSON.stringify(e));
            throw e;
        }
        let lastId = info.lastInsertRowid;
        if (!lastId) throw new Error('SQL ERROR: the insert count is 0.');

        if (needId) {
            try {
                const row = this.db.prepare(`select id from ${tbName} where rowid=$rowid`).get({rowid: lastId})
                lastId = row.id;
            } catch (e) {
                logger.error('[insert] select error', e.message, 'json:', JSON.stringify(e));
                throw e;
            }
        }
        return lastId;
    }

    update(tbName: string, setValues: DB.TRowObj, whereParam?: DB.TRowObj | string, suffix: string = '', pattern: string[] = []) {
        const logger = this.logger;
        logger.debug('[update]', tbName, whereParam, setValues, suffix, pattern);

        let param: DB.TRowObj = {};

        const tbSchema = this.tableSchema[tbName];
        let sql = 'update ' + tbName + ' set ';

        const validSetColumns = tbSchema.filter(c => setValues[c] != null);
        if (validSetColumns.length === 0) {
            logger.error('[update] has no valid column in setValues:', setValues, ';table:', tbName);
            throw new Error('SQL ERROR: has no valid column in setValues');
        }

        sql += validSetColumns.map(c => c + ' = $set' + c).join(', ');
        validSetColumns.forEach(c => {
            param['set' + c] = setValues[c];
        })

        if (!whereParam) {

        } else if (typeof whereParam === 'string') {
            sql += ' ' + whereParam;
        } else {
            const whereClauseResult = this.generateWhereClause(tbName, whereParam, pattern);
            sql += ' ' + whereClauseResult.clause;
            Object.assign(param, whereClauseResult.validParam);
        }

        if (suffix) {
            sql += ' ' + suffix;
        }

        logger.debug('[update] sql:', sql, 'param:', param);
        try {
            return this.db.prepare(sql).run(param);
        } catch (e) {
            logger.error('[update] run error', sql, e.message, 'json:', JSON.stringify(e));
            throw e;
        }
    }

    delete(tbName: string, whereParam?: DB.TRowObj | string, suffix: string = '', pattern: string[] = []) {
        const logger = this.logger;
        logger.debug('[delete]', tbName, whereParam, suffix, pattern);

        let param = {};

        let sql = 'delete from ' + tbName;
        if (!whereParam) {

        } else if (typeof whereParam === 'string') {
            sql += ' ' + whereParam;
        } else {
            const whereClauseResult = this.generateWhereClause(tbName, whereParam, pattern);
            sql += ' ' + whereClauseResult.clause;
            Object.assign(param, whereClauseResult.validParam);
        }

        if (suffix) sql += ' ' + suffix;

        logger.debug('[delete] sql:', sql, 'param:', param);
        try {
            return this.db.prepare(sql).run(param);
        } catch (e) {
            logger.error('[delete] run error', sql, e.message, 'json:', JSON.stringify(e));
            throw e;
        }
    }

    close() {
        this.db.close();
    }

    /**
     * 默认8字节。即生成16(8*2)个字符
     */
    genRandom(byteSize = 8) {
        return randomBytes(8).then((buffer: Buffer) => buffer.toString('hex'));
    }
}

export = DB;
