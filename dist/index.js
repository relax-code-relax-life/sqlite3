"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const sqlite3_1 = __importDefault(require("sqlite3"));
const child_process_1 = require("child_process");
const relax_utils_1 = __importDefault(require("relax-utils"));
const crypto_1 = __importDefault(require("crypto"));
const randomBytes = relax_utils_1.default.promisify(crypto_1.default.randomBytes);
class DB {
    constructor({ dbFilePath, initSqlFiles = [], tableSchema, isDev = false, logger = undefined }) {
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
        };
    }
    async init() {
        const sqlite = this.isDev ? sqlite3_1.default.verbose() : sqlite3_1.default;
        const dbFilePath = this.dbFilePath;
        const logger = this.logger;
        logger.info('[init] file:' + dbFilePath);
        const defer = relax_utils_1.default.defer();
        try {
            this.initSqlFiles.forEach((sqlFilePath) => {
                const cmd = `sqlite3 ${dbFilePath} < ${sqlFilePath}`;
                logger.info('[init] exec init file:', sqlFilePath);
                child_process_1.execSync(cmd);
            });
            logger.info('[init] exec init file success');
            this.db = new sqlite.Database(dbFilePath, sqlite.OPEN_READWRITE, (err) => {
                if (err) {
                    logger.error('[init] new sqlite3 error/', err.message, '/json:', JSON.stringify(err));
                    defer.reject(err);
                }
                else
                    defer.resolve();
            });
            // process.on('SIGINT', () => { // pm2退出事件
            //
            // });
        }
        catch (e) {
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
    // suffix: 添加在where从句之后的内容，如果没有where从句就是直接添加在from从句之后，例如group by/ order/ limit
    /** @internal */
    generateSelectSql(tbName, param, excludeColumns = [], pattern = [], suffix = '') {
        const logger = this.logger;
        // param 传入null或undefined，视为搜索全部
        const tbColumns = this.tableSchema[tbName];
        const selectColumns = excludeColumns.length ?
            tbColumns.filter(name => !excludeColumns.includes(name)) : tbColumns;
        let values = {};
        let sql = `select ${selectColumns.join(',')} from ${tbName}`;
        if (param) {
            /** @type {String[]} **/
            let paramColumns = tbColumns.filter(key => param[key] != null); // 筛选paramColumns为同时在tbColumns和param中的列。
            if (param.rowid)
                paramColumns.push('rowid');
            if (paramColumns.length === 0) {
                logger.error('[select] has no valid prop in param:', param, ';table:', tbName);
                throw new Error('SQL ERROR: has no valid prop in param');
            }
            sql += ' where ' + paramColumns.map(key => {
                let operator = ' = ';
                if (pattern.includes(key)) {
                    operator = ' like ';
                }
                return key + operator + '$' + key;
            }).join(' and ');
            paramColumns.forEach((key) => {
                values['$' + key] = param[key];
            });
        }
        sql += ' ' + suffix;
        return {
            sql,
            param: values
        };
    }
    async select(tbName, param, excludeColumns = [], pattern = [], suffix = '') {
        let sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern, suffix);
        return this.selectBySql(sqlObj.sql, sqlObj.param);
    }
    /***
     * @param sql
     * @param param - { [$paramName: string]: any } 这里param是直接传给sqlite.run的，是sql的参数，需要添加$前缀
     */
    async selectBySql(sql, param) {
        const logger = this.logger;
        logger.debug('[selectBySql] sql:', sql, `,sqlValues:`, param);
        const defer = relax_utils_1.default.defer();
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
     * @param suffix
     * @return Promise<number> - 返回retrieveLength
     */
    async each(tbName, eachCallback, param, excludeColumns = [], pattern = [], suffix = '') {
        let sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern, suffix);
        return this.eachBySql(sqlObj.sql, sqlObj.param, eachCallback);
    }
    async eachBySql(sql, param, eachCallback) {
        const logger = this.logger;
        logger.debug('[each] sql:', sql, ',sqlValues:', param);
        const defer = relax_utils_1.default.defer();
        this.db.each(sql, param, eachCallback, (error, retrieveLength) => {
            if (error)
                defer.reject(error);
            else
                defer.resolve(retrieveLength);
        });
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
    /**
     *
     * @param tbName
     * @param sql
     * @param param - {$columnName:123} 这里param是直接传给sqlite的，是sql的参数，需要添加$前缀
     * @param needId
     * @return Promise<number> - 如果needId为true，返回id字段，如果needId为false,返回rowid字段
     */
    insertBySql(tbName, sql, param, needId) {
        const logger = this.logger;
        logger.debug('[insertBySql]', tbName, sql, param, `needId:${needId}`);
        const defer = relax_utils_1.default.defer();
        const db = this.db;
        db.run(sql, param, function (error) {
            if (error) {
                logger.error('[insert] run error', sql, error.message, 'json:', JSON.stringify(error));
                return defer.reject(error);
            }
            const lastID = this.lastID;
            if (!lastID)
                return defer.reject(new Error('SQL ERROR: the insert count is 0.'));
            if (needId) {
                db.get(`select id from ${tbName} where rowid=$rowid`, { $rowid: lastID }, function (error, row) {
                    //todo 和insert错误区分
                    if (error) {
                        logger.error('[insert] select error', error.message, 'json:', JSON.stringify(error));
                        return defer.reject(error);
                    }
                    defer.resolve(row.id);
                });
            }
            else
                defer.resolve(lastID);
        });
        return defer.promise;
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve(undefined);
            });
        });
    }
    genRandom() {
        return randomBytes(8).then((buffer) => buffer.toString('hex'));
    }
}
function wrapNodeCb(defer) {
    return (err, ...args) => {
        if (err)
            defer.reject(err);
        else
            defer.resolve(args.length > 1 ? args : args[0]);
    };
}
module.exports = DB;
