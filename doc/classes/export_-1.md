[relax-sqlite3](../README.md) / [Exports](../modules.md) / export=

# Class: export=

## Table of contents

### Constructors

- [constructor](export_-1.md#constructor)

### Methods

- [close](export_-1.md#close)
- [each](export_-1.md#each)
- [eachBySql](export_-1.md#eachbysql)
- [genRandom](export_-1.md#genrandom)
- [insert](export_-1.md#insert)
- [insertBySql](export_-1.md#insertbysql)
- [modifySchema](export_-1.md#modifyschema)
- [pragma](export_-1.md#pragma)
- [select](export_-1.md#select)
- [selectBySql](export_-1.md#selectbysql)

## Constructors

### constructor

• **new export=**(`__namedParameters`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`IDbParam`](../interfaces/export_.IDbParam.md) |

#### Defined in

[index.ts:58](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L58)

## Methods

### close

▸ **close**(): `void`

#### Returns

`void`

#### Defined in

[index.ts:244](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L244)

___

### each

▸ **each**(`tbName`, `eachCallback`, `param?`, `excludeColumns?`, `pattern?`, `suffix?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tbName` | `string` | `undefined` |
| `eachCallback` | [`TEachCallback`](../modules/export_.md#teachcallback) | `undefined` |
| `param?` | [`TRowObj`](../modules/export_.md#trowobj) | `undefined` |
| `excludeColumns` | `string`[] | `[]` |
| `pattern` | `string`[] | `[]` |
| `suffix` | `string` | `''` |

#### Returns

`Promise`<`void`\>

Promise<number> - 返回retrieveLength

#### Defined in

[index.ts:175](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L175)

___

### eachBySql

▸ **eachBySql**(`sql`, `param`, `eachCallback`): `Promise`<`void`\>

报错会导致遍历不继续进行，并返回rejected promise.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |
| `param` | `undefined` \| [`TRowObj`](../modules/export_.md#trowobj) |
| `eachCallback` | [`TEachCallback`](../modules/export_.md#teachcallback) |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:188](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L188)

___

### genRandom

▸ **genRandom**(`byteSize?`): `Promise`<`string`\>

默认8字节。即生成16(8*2)个字符

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `byteSize` | `number` | `8` |

#### Returns

`Promise`<`string`\>

#### Defined in

[index.ts:251](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L251)

___

### insert

▸ **insert**<`T`\>(`tbName`, `param`, `needId?`): `T` extends ``true`` ? `any` : `number` \| `bigint`

param参数 示例: `{columnName:123}`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `boolean` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `tbName` | `string` |
| `param` | [`TRowObj`](../modules/export_.md#trowobj) |
| `needId?` | `T` |

#### Returns

`T` extends ``true`` ? `any` : `number` \| `bigint`

#### Defined in

[index.ts:203](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L203)

___

### insertBySql

▸ **insertBySql**<`T`\>(`tbName`, `sql`, `param`, `needId?`): `T` extends ``true`` ? `any` : `number` \| `bigint`

如果needId为true，返回id字段，如果needId为false,返回rowid字段

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `boolean` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `tbName` | `string` |
| `sql` | `string` |
| `param` | [`TRowObj`](../modules/export_.md#trowobj) |
| `needId?` | `T` |

#### Returns

`T` extends ``true`` ? `any` : `number` \| `bigint`

#### Defined in

[index.ts:217](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L217)

___

### modifySchema

▸ **modifySchema**(`schema`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`TTableSchema`](../modules/export_.md#ttableschema) |

#### Returns

`void`

#### Defined in

[index.ts:101](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L101)

___

### pragma

▸ **pragma**(`cmd`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `cmd` | `string` |

#### Returns

`any`

#### Defined in

[index.ts:105](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L105)

___

### select

▸ **select**(`tbName`, `param?`, `excludeColumns?`, `pattern?`, `suffix?`): [`TRowObj`](../modules/export_.md#trowobj)[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tbName` | `string` | `undefined` |
| `param?` | [`TRowObj`](../modules/export_.md#trowobj) | `undefined` |
| `excludeColumns` | `string`[] | `[]` |
| `pattern` | `string`[] | `[]` |
| `suffix` | `string` | `''` |

#### Returns

[`TRowObj`](../modules/export_.md#trowobj)[]

#### Defined in

[index.ts:155](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L155)

___

### selectBySql

▸ **selectBySql**(`sql`, `param?`): [`TRowObj`](../modules/export_.md#trowobj)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |
| `param?` | [`TRowObj`](../modules/export_.md#trowobj) |

#### Returns

[`TRowObj`](../modules/export_.md#trowobj)[]

#### Defined in

[index.ts:166](https://github.com/relax-code-relax-life/sqlite3/blob/08533a5/src/index.ts#L166)
