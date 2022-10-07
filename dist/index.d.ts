import Database from 'better-sqlite3';
declare namespace DB {
    type TLogger = {
        error: (...args: any[]) => void;
        info: (...args: any[]) => void;
        debug: (...args: any[]) => void;
    };
    type TTableSchema = {
        [tableName: string]: string[];
    };
    type TRowObj = {
        [columnName: string]: any;
    };
    type TEachCallback = (row: TRowObj) => any | Promise<any>;
    interface IDbParam {
        dbFilePath: string;
        initSqlFiles: string[];
        tableSchema: TTableSchema;
        verbose: boolean;
        logger?: TLogger;
    }
}
declare class DB {
    /** @internal */
    tableSchema: DB.TTableSchema;
    /** @internal */
    logger: DB.TLogger;
    /** @internal */
    db: Database.Database;
    constructor({ dbFilePath, initSqlFiles, tableSchema, verbose, logger }: DB.IDbParam);
    modifySchema(schema: DB.TTableSchema): void;
    pragma(cmd: string): any;
    /** @internal */
    generateSelectSql(tbName: string, param?: DB.TRowObj, // 通过param生成where从句，传入null或undefined，视为搜索全部
    excludeColumns?: string[], pattern?: string[], suffix?: string): {
        sql: string;
        param: {};
    };
    select(tbName: string, param?: DB.TRowObj, excludeColumns?: string[], pattern?: string[], suffix?: string): DB.TRowObj[];
    selectBySql(sql: string, param?: DB.TRowObj): DB.TRowObj[];
    /**
     * @return Promise<number> - 返回retrieveLength
     */
    each(tbName: string, eachCallback: DB.TEachCallback, param?: DB.TRowObj, excludeColumns?: string[], pattern?: string[], suffix?: string): Promise<void>;
    /**
     * 报错会导致遍历不继续进行，并返回rejected promise.
     */
    eachBySql(sql: string, param: DB.TRowObj | undefined, eachCallback: DB.TEachCallback): Promise<void>;
    /**
     * param参数 示例: `{columnName:123}`
     */
    insert<T extends boolean>(tbName: string, param: DB.TRowObj, needId?: T): T extends true ? any : number | bigint;
    /**
     * 如果needId为true，返回id字段，如果needId为false,返回rowid字段
     */
    insertBySql<T extends boolean>(tbName: string, sql: string, param: DB.TRowObj, needId?: T): T extends true ? any : number | bigint;
    close(): void;
    /**
     * 默认8字节。即生成16(8*2)个字符
     */
    genRandom(byteSize?: number): Promise<string>;
}
export = DB;
