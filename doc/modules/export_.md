[relax-sqlite3](../README.md) / [Exports](../modules.md) / export=

# Namespace: export=

## Table of contents

### Interfaces

- [IDbParam](../interfaces/export_.IDbParam.md)

### Type Aliases

- [TEachCallback](export_.md#teachcallback)
- [TLogger](export_.md#tlogger)
- [TRowObj](export_.md#trowobj)
- [TTableSchema](export_.md#ttableschema)

## Type Aliases

### TEachCallback

Ƭ **TEachCallback**: (`row`: [`TRowObj`](export_.md#trowobj)) => `any` \| `Promise`<`any`\>

#### Type declaration

▸ (`row`): `any` \| `Promise`<`any`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`TRowObj`](export_.md#trowobj) |

##### Returns

`any` \| `Promise`<`any`\>

#### Defined in

[index.ts:37](https://github.com/relax-code-relax-life/sqlite3/blob/c5d69b1/src/index.ts#L37)

___

### TLogger

Ƭ **TLogger**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `debug` | (...`args`: `any`[]) => `void` |
| `error` | (...`args`: `any`[]) => `void` |
| `info` | (...`args`: `any`[]) => `void` |

#### Defined in

[index.ts:26](https://github.com/relax-code-relax-life/sqlite3/blob/c5d69b1/src/index.ts#L26)

___

### TRowObj

Ƭ **TRowObj**: `Object`

#### Index signature

▪ [columnName: `string`]: `any`

#### Defined in

[index.ts:36](https://github.com/relax-code-relax-life/sqlite3/blob/c5d69b1/src/index.ts#L36)

___

### TTableSchema

Ƭ **TTableSchema**: `Object`

#### Index signature

▪ [tableName: `string`]: `string`[]

#### Defined in

[index.ts:35](https://github.com/relax-code-relax-life/sqlite3/blob/c5d69b1/src/index.ts#L35)
