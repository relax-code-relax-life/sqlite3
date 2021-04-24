[relax-sqlite3](../README.md) / [Exports](../modules.md) / export%3D

# Class: export=

## Table of contents

### Constructors

- [constructor](export_.md#constructor)

### Methods

- [close](export_.md#close)
- [each](export_.md#each)
- [eachBySql](export_.md#eachbysql)
- [genRandom](export_.md#genrandom)
- [init](export_.md#init)
- [insert](export_.md#insert)
- [insertBySql](export_.md#insertbysql)
- [modifySchema](export_.md#modifyschema)
- [select](export_.md#select)
- [selectBySql](export_.md#selectbysql)

## Constructors

### constructor

\+ **new export=**(`__namedParameters`: IDbParam): [*export=*](export_.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `__namedParameters` | IDbParam |

**Returns:** [*export=*](export_.md)

Defined in: [index.ts:40](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L40)

## Methods

### close

▸ **close**(): *Promise*<unknown\>

**Returns:** *Promise*<unknown\>

Defined in: [index.ts:247](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L247)

___

### each

▸ **each**(`tbName`: *string*, `eachCallback`: EachCallbackType, `param?`: RowType, `excludeColumns?`: *string*[], `pattern?`: *string*[], `suffix?`: *string*): *Promise*<number\>

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tbName` | *string* | - |
| `eachCallback` | EachCallbackType | - |
| `param?` | RowType | - |
| `excludeColumns` | *string*[] | [] |
| `pattern` | *string*[] | [] |
| `suffix` | *string* | '' |

**Returns:** *Promise*<number\>

Promise<number> - 返回retrieveLength

Defined in: [index.ts:178](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L178)

___

### eachBySql

▸ **eachBySql**(`sql`: *string*, `param`: SqlParam, `eachCallback`: EachCallbackType): *Promise*<number\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `sql` | *string* |
| `param` | SqlParam |
| `eachCallback` | EachCallbackType |

**Returns:** *Promise*<number\>

Defined in: [index.ts:188](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L188)

___

### genRandom

▸ **genRandom**(): *Promise*<string\>

**Returns:** *Promise*<string\>

Defined in: [index.ts:256](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L256)

___

### init

▸ **init**(): *Promise*<unknown\>

**Returns:** *Promise*<unknown\>

Defined in: [index.ts:63](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L63)

___

### insert

▸ **insert**(`tbName`: *string*, `param`: RowType, `needId?`: *boolean*): *Promise*<number\>

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tbName` | *string* | - |
| `param` | RowType | - |
| `needId` | *boolean* | false |

**Returns:** *Promise*<number\>

Defined in: [index.ts:201](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L201)

___

### insertBySql

▸ **insertBySql**(`tbName`: *string*, `sql`: *string*, `param`: SqlParam, `needId?`: *boolean*): *Promise*<number\>

#### Parameters:

| Name | Type | Description |
| :------ | :------ | :------ |
| `tbName` | *string* |  |
| `sql` | *string* |  |
| `param` | SqlParam | {$columnName:123} 这里param是直接传给sqlite的，是sql的参数，需要添加$前缀 |
| `needId?` | *boolean* |  |

**Returns:** *Promise*<number\>

Promise<number> - 如果needId为true，返回id字段，如果needId为false,返回rowid字段

Defined in: [index.ts:221](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L221)

___

### modifySchema

▸ **modifySchema**(`schema`: TableSchemaType): *void*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `schema` | TableSchemaType |

**Returns:** *void*

Defined in: [index.ts:95](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L95)

___

### select

▸ **select**(`tbName`: *string*, `param?`: RowType, `excludeColumns?`: *string*[], `pattern?`: *string*[], `suffix?`: *string*): *Promise*<RowType[]\>

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tbName` | *string* | - |
| `param?` | RowType | - |
| `excludeColumns` | *string*[] | [] |
| `pattern` | *string*[] | [] |
| `suffix` | *string* | '' |

**Returns:** *Promise*<RowType[]\>

Defined in: [index.ts:145](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L145)

___

### selectBySql

▸ **selectBySql**(`sql`: *string*, `param`: SqlParam): *Promise*<RowType[]\>

#### Parameters:

| Name | Type | Description |
| :------ | :------ | :------ |
| `sql` | *string* |  |
| `param` | SqlParam | { [$paramName: string]: any } 这里param是直接传给sqlite.run的，是sql的参数，需要添加$前缀 |

**Returns:** *Promise*<RowType[]\>

Defined in: [index.ts:160](https://github.com/relax-code-relax-life/sqlite3/blob/9313873/src/index.ts#L160)
