let sqlite3 = require('sqlite3')
const {execSync} = require('child_process');
const utils = require('relax-utils');
const crypto = require('crypto');

const randomBytes = utils.promisify(crypto.randomBytes);


// schema结构:
//  {
//      [tableName:string]: string[]  // column名称数组
//  }
class DB {
    constructor({
                    dbFilePath,
                    initSqlFiles = [],
                    tableSchema,
                    isDev = false,
                    logger = null
                }) {
        this.dbFilePath = dbFilePath;
        this.tableSchema = tableSchema;
        this.initSqlFiles = initSqlFiles;
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
            this.db = new sqlite.Database(dbFilePath, sqlite.OPEN_READWRITE, (err) => {
                if (err) {
                    logger.error('[init] new sqlite3 error/', err.message, '/json:', JSON.stringify(err));
                    defer.reject();
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

    modifySchema(schema) {
        Object.assign(this.tableSchema, schema);
    }

    // param: { columnName: '123' }
    // pattern matching: 模糊查询。 pattern参数为string[]，模糊查询的列。
    // excludeColumns: string[], select排除的列
    generateSelectSql(tbName, param, excludeColumns = [], pattern = []) {
        const logger = this.logger;
        // param 传入null或undefined，视为搜索全部
        const tbColumns = this.tableSchema[tbName];
        const selectColumns = excludeColumns.length ?
            tbColumns.filter(name => !excludeColumns.includes(name)) : tbColumns;

        let values = {};
        let sql = `select ${selectColumns.join(',')} from ${tbName}`;
        if (param) {

            /** @type {String[]} **/
            let paramColumns = tbColumns.filter(key => param[key] != null);
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
        return {
            sql,
            param: values
        }
    }

    select(tbName, param, excludeColumns = [], pattern = []) {
        const logger = this.logger;

        const defer = utils.defer();

        let sqlObj;
        try {
            sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern);
        } catch (e) {
            return defer.reject(e);
        }

        logger.debug('[select] sql:', sqlObj.sql, `,sqlValues:`, sqlObj.param);
        this.db.all(sqlObj.sql, sqlObj.param, wrapNodeCb(defer));
        return defer.promise;
    }

    // param: {columnName:123}
    insert(tbName, param, needId = false) {
        const logger = this.logger;
        logger.debug('[insert]', tbName, param, `needId:${needId}`);
        const paramColumns = this.tableSchema[tbName].filter(c => param[c] != null);
        const sqlColumnsStr = paramColumns.join(',');
        const sqlValuesStr = paramColumns.map(c => '$' + c).join(',');
        let sql = `insert into ${tbName}(${sqlColumnsStr}) values(${sqlValuesStr})`;
        const sqlParam = {};
        paramColumns.forEach((c) => sqlParam['$' + c] = param[c]);
        return this.insertBySql(tbName, sql, sqlParam, needId);
    }

    // param: {$columnName:123} 这里param是直接传给sqlite的，是sql的参数，需要添加$前缀
    insertBySql(tbName, sql, param, needId) {
        const logger = this.logger;
        logger.debug('[insertBySql]', tbName, sql, param, `needId:${needId}`);
        const defer = utils.defer();
        const db = this.db;
        db.run(sql, param, function (error) {
            if (error) {
                logger.error('[insert] run error', sql, error.message, 'json:', JSON.stringify(error));
                return defer.reject(error);
            }
            const lastID = this.lastID;
            if (!lastID) return defer.reject(new Error('SQL ERROR: the insert count is 0.'))
            if (needId) {
                db.get(`select id from ${tbName} where rowid=$rowid`, {$rowid: lastID}, function (error, row) {
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

    each(tbName, eachCallback, param, excludeColumns = [], pattern = []) {
        const logger = this.logger;
        const defer = utils.defer();
        let sqlObj;
        try {
            sqlObj = this.generateSelectSql(tbName, eachCallback, param, excludeColumns, pattern);
        } catch (e) {
            defer.reject(e);
            return defer.promise;
        }
        logger.debug('[each] sql:', sqlObj.sql, ',sqlValues:', sqlObj.param);
        this.db.each(sqlObj.sql, sqlObj.param, eachCallback, (error, retrieveLength) => {
            if (error) defer.reject(error);
            else defer.resolve(retrieveLength);
        })
        return defer.promise;
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            })
        })
    }

    genRandom() {
        return randomBytes(8).then((buffer) => buffer.toString('hex'));
    }
}

function wrapNodeCb(defer) {
    return (err, ...args) => {
        if (err) defer.reject(err);
        else defer.resolve(args.length > 1 ? args : args[0]);
    }
}

module.exports = DB;