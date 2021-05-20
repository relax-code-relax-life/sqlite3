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

Defined in: [index.ts:46](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L46)

## Methods

### close

▸ **close**(): *void*

**Returns:** *void*

Defined in: [index.ts:241](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L241)

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

Defined in: [index.ts:167](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L167)

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

Defined in: [index.ts:183](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L183)

___

### genRandom

▸ **genRandom**(): *Promise*<string\>

**Returns:** *Promise*<string\>

Defined in: [index.ts:245](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L245)

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

Defined in: [index.ts:196](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L196)

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

Defined in: [index.ts:215](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L215)

___

### modifySchema

▸ **modifySchema**(`schema`: TableSchemaType): *void*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `schema` | TableSchemaType |

**Returns:** *void*

Defined in: [index.ts:87](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L87)

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

Defined in: [index.ts:136](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L136)

___

### selectBySql

▸ **selectBySql**(`sql`: *string*, `param?`: RowType): *Promise*<RowType[]\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `sql` | *string* |
| `param?` | RowType |

**Returns:** *Promise*<RowType[]\>

Defined in: [index.ts:151](https://github.com/relax-code-relax-life/sqlite3/blob/b563366/src/index.ts#L151)
