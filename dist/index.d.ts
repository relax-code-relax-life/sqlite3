import { Database } from 'sqlite3';
declare type TableSchemaType = {
    [tableName: string]: string[];
};
declare type LoggerType = {
    error: Function;
    info: Function;
    debug: Function;
};
declare type RowType = {
    [columnName: string]: any;
};
declare type EachCallbackType = (error: Error | null, row: RowType) => void;
declare type SqlParam = {
    [$paramName: string]: any;
};
interface IDbParam {
    dbFilePath: string;
    initSqlFiles: string[];
    tableSchema: TableSchemaType;
    isDev: boolean;
    logger?: LoggerType;
}
declare class DB {
    /** @internal */
    dbFilePath: string;
    /** @internal */
    initSqlFiles: string[];
    /** @internal */
    tableSchema: TableSchemaType;
    /** @internal */
    isDev: boolean;
    /** @internal */
    logger: LoggerType;
    /** @internal */
    db: Database;
    constructor({ dbFilePath, initSqlFiles, tableSchema, isDev, logger }: IDbParam);
    init(): Promise<unknown>;
    modifySchema(schema: TableSchemaType): void;
    /** @internal */
    generateSelectSql(tbName: string, param?: RowType, excludeColumns?: string[], pattern?: string[], suffix?: string): {
        sql: string;
        param: SqlParam;
    };
    select(tbName: string, param?: RowType, excludeColumns?: string[], pattern?: string[], suffix?: string): Promise<RowType[]>;
    /***
     * @param sql
     * @param param - { [$paramName: string]: any } 这里param是直接传给sqlite.run的，是sql的参数，需要添加$前缀
     */
    selectBySql(sql: string, param: SqlParam): Promise<RowType[]>;
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
    each(tbName: string, eachCallback: EachCallbackType, param?: RowType, excludeColumns?: string[], pattern?: string[], suffix?: string): Promise<number>;
    eachBySql(sql: string, param: SqlParam, eachCallback: EachCallbackType): Promise<number>;
    insert(tbName: string, param: RowType, needId?: boolean): Promise<number>;
    /**
     *
     * @param tbName
     * @param sql
     * @param param - {$columnName:123} 这里param是直接传给sqlite的，是sql的参数，需要添加$前缀
     * @param needId
     * @return Promise<number> - 如果needId为true，返回id字段，如果needId为false,返回rowid字段
     */
    insertBySql(tbName: string, sql: string, param: SqlParam, needId?: boolean): Promise<number>;
    close(): Promise<unknown>;
    genRandom(): Promise<string>;
}
export = DB;
