[relax-sqlite3](README.md) / Exports

# relax-sqlite3

## Table of contents

### Namespaces

- [export&#x3D;](modules/export_.md)

### Classes

- [export&#x3D;](classes/export_-1.md)

### Interfaces

- [IDbParam](interfaces/IDbParam.md)

### Type Aliases

- [TEachCallback](modules.md#teachcallback)
- [TLogger](modules.md#tlogger)
- [TRowObj](modules.md#trowobj)
- [TTableSchema](modules.md#ttableschema)

## Type Aliases

### TEachCallback

Ƭ **TEachCallback**: (`row`: [`TRowObj`](modules/export_.md#trowobj)) => `any` \| `Promise`<`any`\>

#### Type declaration

▸ (`row`): `any` \| `Promise`<`any`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`TRowObj`](modules/export_.md#trowobj) |

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
