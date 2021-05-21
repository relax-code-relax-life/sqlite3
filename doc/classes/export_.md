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

Defined in: [index.ts:50](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L50)

## Methods

### close

▸ **close**(): *void*

**Returns:** *void*

Defined in: [index.ts:245](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L245)

___

### each

▸ **each**(`tbName`: *string*, `eachCallback`: EachCallbackType, `param?`: RowType, `excludeColumns?`: *string*[], `pattern?`: *string*[], `suffix?`: *string*): *Promise*<void\>

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tbName` | *string* | - |
| `eachCallback` | EachCallbackType | - |
| `param?` | RowType | - |
| `excludeColumns` | *string*[] | [] |
| `pattern` | *string*[] | [] |
| `suffix` | *string* | '' |

**Returns:** *Promise*<void\>

Promise<number> - 返回retrieveLength

Defined in: [index.ts:171](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L171)

___

### eachBySql

▸ **eachBySql**(`sql`: *string*, `param`: *undefined* \| RowType, `eachCallback`: EachCallbackType): *Promise*<void\>

报错会导致遍历不继续进行，并返回rejected promise.

#### Parameters:

| Name | Type |
| :------ | :------ |
| `sql` | *string* |
| `param` | *undefined* \| RowType |
| `eachCallback` | EachCallbackType |

**Returns:** *Promise*<void\>

Defined in: [index.ts:187](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L187)

___

### genRandom

▸ **genRandom**(): *Promise*<string\>

**Returns:** *Promise*<string\>

Defined in: [index.ts:249](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L249)

___

### insert

▸ **insert**(`tbName`: *string*, `param`: RowType, `needId?`: *boolean*): *any*

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tbName` | *string* | - |
| `param` | RowType | - |
| `needId` | *boolean* | false |

**Returns:** *any*

Defined in: [index.ts:200](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L200)

___

### insertBySql

▸ **insertBySql**(`tbName`: *string*, `sql`: *string*, `param`: RowType, `needId?`: *boolean*): *any*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `tbName` | *string* |
| `sql` | *string* |
| `param` | RowType |
| `needId?` | *boolean* |

**Returns:** *any*

- 如果needId为true，返回id字段，如果needId为false,返回rowid字段

Defined in: [index.ts:219](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L219)

___

### modifySchema

▸ **modifySchema**(`schema`: TableSchemaType): *void*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `schema` | TableSchemaType |

**Returns:** *void*

Defined in: [index.ts:91](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L91)

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

Defined in: [index.ts:140](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L140)

___

### selectBySql

▸ **selectBySql**(`sql`: *string*, `param?`: RowType): *Promise*<RowType[]\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `sql` | *string* |
| `param?` | RowType |

**Returns:** *Promise*<RowType[]\>

Defined in: [index.ts:155](https://github.com/relax-code-relax-life/sqlite3/blob/ecf1b8e/src/index.ts#L155)
