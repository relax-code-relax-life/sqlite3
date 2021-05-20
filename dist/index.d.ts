declare const Database: any;
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
declare type EachCallbackType = (row: RowType) => any | Promise<any>;
interface IDbParam {
    dbFilePath: string;
    initSqlFiles: string[];
    tableSchema: TableSchemaType;
    verbose: boolean;
    logger?: LoggerType;
}
declare class DB {
    /** @internal */
    tableSchema: TableSchemaType;
    /** @internal */
    logger: LoggerType;
    /** @internal */
    db: typeof Database;
    constructor({ dbFilePath, initSqlFiles, tableSchema, verbose, logger }: IDbParam);
    modifySchema(schema: TableSchemaType): void;
    /** @internal */
    generateSelectSql(tbName: string, param?: RowType, // 通过param生成where从句，传入null或undefined，视为搜索全部
    excludeColumns?: string[], pattern?: string[], suffix?: string): {
        sql: string;
        param: {};
    };
    select(tbName: string, param?: RowType, excludeColumns?: string[], pattern?: string[], suffix?: string): Promise<RowType[]>;
    /***
     * @param sql
     * @param param
     */
    selectBySql(sql: string, param?: RowType): Promise<RowType[]>;
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
    each(tbName: string, eachCallback: EachCallbackType, param?: RowType, excludeColumns?: string[], pattern?: string[], suffix?: string): Promise<void>;
    /**
     * 报错会导致遍历不继续进行，并返回rejected promise.
     * @param sql
     * @param param
     * @param eachCallback
     */
    eachBySql(sql: string, param: RowType | undefined, eachCallback: EachCallbackType): Promise<void>;
    insert(tbName: string, param: RowType, needId?: boolean): any;
    /**
     *
     * @param tbName
     * @param sql
     * @param param
     * @param needId
     * @return {number} - 如果needId为true，返回id字段，如果needId为false,返回rowid字段
     */
    insertBySql(tbName: string, sql: string, param: RowType, needId?: boolean): any;
    close(): void;
    genRandom(): Promise<string>;
}
export = DB;
