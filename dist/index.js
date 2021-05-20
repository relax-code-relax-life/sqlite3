"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// import sqlite3, {Database, RunResult} from 'sqlite3';
const Database = require('better-sqlite3');
const child_process_1 = require("child_process");
const relax_utils_1 = __importDefault(require("relax-utils"));
const crypto_1 = __importDefault(require("crypto"));
const randomBytes = relax_utils_1.default.promisify(crypto_1.default.randomBytes);
class DB {
    constructor({ dbFilePath, initSqlFiles = [], tableSchema, verbose = false, logger = undefined }) {
        this.tableSchema = tableSchema;
        this.logger = logger || {
            error: console.error,
            info: console.log,
            debug: console.log
        };
        this.logger.debug('[init] file:' + dbFilePath);
        try {
            initSqlFiles.forEach((sqlFilePath) => {
                const cmd = `sqlite3 ${dbFilePath} < ${sqlFilePath}`;
                this.logger.info('[init] exec init file:', sqlFilePath);
                child_process_1.execSync(cmd);
            });
            this.logger.info('[init] exec init file success');
            this.db = new Database(dbFilePath, { verbose: verbose ? this.logger.info : null, fileMustExist: false });
            this.logger.info('[init] new Database success');
            // process.on('SIGINT', () => { // pm2退出事件
            //
            // });
        }
        catch (e) {
            this.logger.error('[init] sqlite3 error', e.message, ',json:', JSON.stringify(e));
        }
    }
    modifySchema(schema) {
        Object.assign(this.tableSchema, schema);
    }
    // param: { columnName: '123' }
    // pattern matching: 模糊查询。 pattern参数为string[]，模糊查询的列。
    // excludeColumns: string[], select排除的列
    // suffix: 添加在where从句之后的内容，如果没有where从句就是直接添加在from从句之后，例如group by/ order/ limit
    /** @internal */
    generateSelectSql(tbName, param, // 通过param生成where从句，传入null或undefined，视为搜索全部
    excludeColumns = [], pattern = [], suffix = '') {
        const logger = this.logger;
        const tbColumns = this.tableSchema[tbName];
        const selectColumns = excludeColumns.length ?
            tbColumns.filter(name => !excludeColumns.includes(name)) : tbColumns;
        let validParam = {};
        let sql = `select ${selectColumns.join(',')} from ${tbName}`;
        if (param) {
            // 筛选paramColumns为同时在tbColumns和param中的列。
            /** @type {String[]} **/
            let paramColumns = tbColumns.filter(key => param[key] != null);
            if (param.rowid)
                paramColumns.push('rowid');
            validParam = relax_utils_1.default.pick(param, paramColumns);
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
        }
        sql += ' ' + suffix;
        return {
            sql,
            param: validParam
        };
    }
    select(tbName, param, excludeColumns = [], pattern = [], suffix = '') {
        let sqlObj = this.generateSelectSql(tbName, param, excludeColumns, pattern, suffix);
        return this.selectBySql(sqlObj.sql, sqlObj.param);
    }
    /***
     * @param sql
     * @param param
     */
    selectBySql(sql, param) {
        const logger = this.logger;
        logger.debug('[selectBySql] sql:', sql, `,sqlValues:`, param);
        return this.db.prepare(sql).all(param);
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
    /**
     * 报错会导致遍历不继续进行，并返回rejected promise.
     * @param sql
     * @param param
     * @param eachCallback
     */
    async eachBySql(sql, param, eachCallback) {
        const logger = this.logger;
        logger.debug('[each] sql:', sql, ',sqlValues:', param);
        const iterator = this.db.prepare(sql).iterate(param);
        for (const row of iterator) {
            await eachCallback(row);
        }
    }
    // param: {columnName:123}
    insert(tbName, param, needId = false) {
        const logger = this.logger;
        logger.debug('[insert]', tbName, param, `needId:${needId}`);
        const paramColumns = this.tableSchema[tbName].filter(c => param[c] != null);
        const sqlColumnsStr = paramColumns.join(',');
        const sqlValuesStr = paramColumns.map(c => '$' + c).join(',');
        let sql = `insert into ${tbName}(${sqlColumnsStr}) values(${sqlValuesStr})`;
        const sqlParam = relax_utils_1.default.pick(param, paramColumns);
        return this.insertBySql(tbName, sql, sqlParam, needId);
    }
    /**
     *
     * @param tbName
     * @param sql
     * @param param
     * @param needId
     * @return {number} - 如果needId为true，返回id字段，如果needId为false,返回rowid字段
     */
    insertBySql(tbName, sql, param, needId) {
        const logger = this.logger;
        logger.debug('[insertBySql]', tbName, sql, param, `needId:${needId}`);
        let info;
        try {
            info = this.db.prepare(sql).run(param);
        }
        catch (e) {
            logger.error('[insert] run error', sql, e.message, 'json:', JSON.stringify(e));
            throw e;
        }
        let lastId = info.lastInsertRowid;
        if (!lastId)
            throw new Error('SQL ERROR: the insert count is 0.');
        if (needId) {
            try {
                const row = this.db.prepare(`select id from ${tbName} where rowid=$rowid`).get({ rowid: lastId });
                lastId = row.id;
            }
            catch (e) {
                logger.error('[insert] select error', e.message, 'json:', JSON.stringify(e));
                throw e;
            }
        }
        return lastId;
    }
    close() {
        this.db.close();
    }
    genRandom() {
        return randomBytes(8).then((buffer) => buffer.toString('hex'));
    }
}
module.exports = DB;
