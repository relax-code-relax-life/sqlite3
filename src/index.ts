import sqlite3, {Database, RunResult} from 'sqlite3';
import {execSync} from 'child_process';
import utils, {Defer} from 'relax-utils';
import crypto from 'crypto';

const randomBytes = utils.promisify(crypto.randomBytes);


// schema结构:
//  {
//      [tableName:string]: string[]  // column名称数组
//  }

type TableSchemaType = { [tableName: string]: string[] };
type LoggerType = { error: Function, info: Function, debug: Function };
type RowType = { [columnName: string]: any };
type EachCallbackType = (error: Error | null, row: RowType) => void;
type SqlParam = { [$paramName: string]: any };

interface IDbParam {
    dbFilePath: string,
    initSqlFiles: string[],
    tableSchema: TableSchemaType,
    isDev: boolean,
    logger?: LoggerType
}

class DB {
    dbFilePath: string
    initSqlFiles: string[]
    tableSchema: TableSchemaType
    isDev: boolean
    logger: LoggerType
    db: Database;

    constructor({
                    dbFilePath,
                    initSqlFiles = [],
                    tableSchema,
                    isDev = false,
                    logger = undefined
                }: IDbParam) {
        this.dbFilePath = dbFilePath;
        this.tableSchema = tableSchema;
        this.initSqlFiles = initSqlFiles;
        // @ts-ignore
        this.db = null;
        this.isDev = isDev;
        this.logger = logger || {
            error: console.error,
            info: console.log,
            debug: console.log
        }
    }


    async init() {
        const sqlite = this.isDev ? sqlite3.verbose() : sqlite3;
        const dbFilePath = this.dbFilePath;
        const logger = this.logger;
        logger.info('[init] file:' + dbFilePath)
        const defer = utils.defer();
        try {
            this.initSqlFiles.forEach((sqlFilePath) => {
                const cmd = `sqlite3 ${dbFilePath} < ${sqlFilePath}`;
                logger.info('[init] exec init file:', sqlFilePath);
                execSync(cmd);
            })
            logger.info('[init] exec init file success');
            this.db = new sqlite.Database(dbFilePath, sqlite.OPEN_READWRITE, (err: Error | null) => {
                if (err) {
                    logger.error('[init] new sqlite3 error/', err.message, '/json:', JSON.stringify(err));
                    defer.reject(err);
                } else defer.resolve();
            });

            // process.on('SIGINT', () => { // pm2退出事件
            //
            // });

        } catch (e) {
            logger.error('[init] error', e.message, 'json:', JSON.stringify(e));
            defer.reject(e);

        }
        return defer.promise;
    }

    modifySchema(schema: TableSchemaType) {
        Object.assign(this.tableSchema, schema);
    }

    // param: { columnName: '123' }
    // pattern matching: 模糊查询。 pattern参数为string[]，模糊查询的列。
    // excludeColumns: string[], select排除的列
    // suffix: 添加在where从句之后的内容，如果没有where从句就是直接添加在from从句之后，例如group by/ order/ limit
    generateSelectSql(tbName: string,
                      param?: RowType,
                      excludeColumns: string[] = [],
                      pattern: string[] = [],
                      suffix = '') {
        const logger = this.logger;
        // param 传入null或undefined，视为搜索全部
        const tbColumns = this.tableSchema[tbName];
        const selectColumns = excludeColumns.length ?
            tbColumns.filter(name => !excludeColumns.includes(name)) : tbColumns;

        let values: SqlParam = {};
        let sql = `select ${selectColumns.join(',')} from ${tbName}`;
        if (param) {

            /** @type {String[]} **/
            let paramColumns = tbColumns.filter(key => param[key] != null); // 筛选paramColumns为同时在tbColumns和param中的列。
            if (param.rowid) paramColumns.push('rowid');

            if (paramColumns.length === 0) {
                logger.error('[select] has no valid prop in param:', param, ';table:', tbName);
                throw new Error('SQL ERROR: has no valid prop in param');
            }
            sql += ' where ' + paramColumns.map(key => {
                let operator = ' = ';
                if (pattern.includes(key)) {
                    operator = ' like ';
                }
                return key + operator + '$' + key
            }).join(' and ');
            paramColumns.forEach((key) => {
                values['$' + key] = param[key];
            })
        }
        sql += ' ' + suffix;
        return {
            sql,
            param: values
        }
    }

    async select(tbName: string,
                 param?: RowType,
                 excludeColumns: string[] = [],
                 pattern: string[] = [],
                 suffix = '') {

        let sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern, suffix);

        return this.selectBySql(sqlObj.sql, sqlObj.param);
    }

    /***
     * @param sql
     * @param param - { [$paramName: string]: any } 这里param是直接传给sqlite.run的，是sql的参数，需要添加$前缀
     */
    async selectBySql(sql: string, param: SqlParam) {
        const logger = this.logger;
        logger.debug('[selectBySql] sql:', sql, `,sqlValues:`, param);
        const defer = utils.defer() as Defer<RowType[]>;
        this.db.all(sql, param, wrapNodeCb(defer));
        return defer.promise;
    }

    /**
     *
     * @param tbName
     * @param eachCallback
     * @param param
     * @param excludeColumns
     * @param pattern
     * @return Promise<number> - 返回retrieveLength
     */
    async each(tbName: string,
               eachCallback: EachCallbackType,
               param?: RowType,
               excludeColumns: string[] = [],
               pattern: string[] = [],
               suffix = '') {
        let sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern, suffix);
        return this.eachBySql(sqlObj.sql, sqlObj.param, eachCallback);
    }

    async eachBySql(sql: string, param: SqlParam, eachCallback: EachCallbackType) {
        const logger = this.logger;
        logger.debug('[each] sql:', sql, ',sqlValues:', param);
        const defer = utils.defer() as Defer<number>;
        this.db.each(sql, param, eachCallback, (error: Error | null, retrieveLength: number) => {
            if (error) defer.reject(error);
            else defer.resolve(retrieveLength);
        })
        return defer.promise;
    }


    // param: {columnName:123}
    insert(tbName: string, param: RowType, needId = false) {
        const logger = this.logger;
        logger.debug('[insert]', tbName, param, `needId:${needId}`);
        const paramColumns = this.tableSchema[tbName].filter(c => param[c] != null);
        const sqlColumnsStr = paramColumns.join(',');
        const sqlValuesStr = paramColumns.map(c => '$' + c).join(',');
        let sql = `insert into ${tbName}(${sqlColumnsStr}) values(${sqlValuesStr})`;
        const sqlParam: SqlParam = {};
        paramColumns.forEach((c) => sqlParam['$' + c] = param[c]);
        return this.insertBySql(tbName, sql, sqlParam, needId);
    }

    /**
     *
     * @param tbName
     * @param sql
     * @param param - {$columnName:123} 这里param是直接传给sqlite的，是sql的参数，需要添加$前缀
     * @param needId
     * @return Promise<number> - 如果needId为true，返回id字段，如果needId为false,返回rowid字段
     */
    insertBySql(tbName: string, sql: string, param: SqlParam, needId?: boolean) {
        const logger = this.logger;
        logger.debug('[insertBySql]', tbName, sql, param, `needId:${needId}`);
        const defer = utils.defer() as Defer<number>;
        const db = this.db;
        db.run(sql, param, function (this: RunResult, error: Error | null) {
            if (error) {
                logger.error('[insert] run error', sql, error.message, 'json:', JSON.stringify(error));
                return defer.reject(error);
            }
            const lastID = this.lastID;
            if (!lastID) return defer.reject(new Error('SQL ERROR: the insert count is 0.'))
            if (needId) {
                db.get(`select id from ${tbName} where rowid=$rowid`, {$rowid: lastID}, function (error: Error | null, row: RowType) {
                    //todo 和insert错误区分
                    if (error) {
                        logger.error('[insert] select error', error.message, 'json:', JSON.stringify(error));
                        return defer.reject(error);
                    }
                    defer.resolve(row.id);
                })
            } else defer.resolve(lastID);
        })
        return defer.promise;
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err: Error | null) => {
                if (err) reject(err);
                else resolve(undefined);
            })
        })
    }

    genRandom() {
        return randomBytes(8).then((buffer: Buffer) => buffer.toString('hex'));
    }
}

function wrapNodeCb<T>(defer: Defer<T>) {
    return (err: Error | null, ...args: any[]) => {
        if (err) defer.reject(err);
        else defer.resolve(args.length > 1 ? args : args[0]);
    }
}

export = DB;