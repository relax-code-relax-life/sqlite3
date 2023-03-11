const fs = require('fs');
const assert = require('assert');
const DB = require('../dist/index');
const utils = require('relax-utils');

const dbFilePath = __dirname + '/test.db';

if (fs.existsSync(dbFilePath)) {
    fs.rmSync(dbFilePath);
}


const isShowLog = false;
const db = new DB({
    dbFilePath: dbFilePath,
    initSqlFiles: [__dirname + '/init.sql'],
    tableSchema: {
        topic: ['id', 'name', 'note']
    },
    isDev: false,
    logger: isShowLog ? null : {
        error: utils.noop,
        info: utils.noop,
        debug: utils.noop
    }
});

(async function () {
    assert.ok(fs.existsSync(dbFilePath), 'db init error');

    const tableInfo = db.pragma('table_info(topic)');
    assert.deepStrictEqual(tableInfo, [
        {cid: 0, name: 'id', type: 'TEXT', notnull: 1, dflt_value: 'hex(randomblob(8))', pk: 1},
        {cid: 1, name: 'name', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0},
        {cid: 2, name: 'note', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0},
    ], 'pragma table_info(topic) error');

    const insert1 = db.insert('topic', {id: '666', name: 'wwl', note: 'no.1'});
    assert.strictEqual(insert1, 1, 'insert1 error');

    const insert2 = db.insert('topic', {id: '6', name: 'wwl', note: 'no.1'}, true);
    assert.strictEqual(insert2, '6', 'insert1 error');

    /*
    * number 到 text转换问题, 如果列声明为text，传入number，则 number -> real -> string
    * https://github.com/JoshuaWise/better-sqlite3/issues/627
    * */
    const insert3 = db.insert('topic', {id: 5, name: 'wwl', note: 'no.1'}, true);
    assert.strictEqual(insert3, '5.0', 'insert1 error');

    const row = db.select('topic', {id: 6});
    assert.ok(Array.isArray(row), 'select return not array');
    assert.strictEqual(row.length, 0, 'check select: number->text');

    const row2 = db.select('topic', {id: '6'});
    assert.deepStrictEqual(row2, [{id: '6', name: 'wwl', note: 'no.1'}], 'check select, normal');
////////////////////////////////////////////////////////////

    const rows = db.select('topic');
    assert.deepStrictEqual(rows,
        [
            {id: '666', name: 'wwl', note: 'no.1'},
            {id: '6', name: 'wwl', note: 'no.1'},
            {id: '5.0', name: 'wwl', note: 'no.1'}
        ]
        , 'check select all, normal');

    const now = Date.now();
    let index = 0;
    let expectedId = ['666', '6', '5.0']
    await db.each('topic', async (row) => {
        assert.strictEqual(row.id, expectedId[index], 'check each id,' + index);
        index++;
        await utils.timeout(200);
    }).then(() => {
        assert.ok(Date.now() - now >= 600, 'check each async');
    })

    /*
    * boolean
    * */
    assert.throws(() => {
        db.insert('topic', {id: '11', name: 'boolean test', note: true});
    }, TypeError, 'check boolean convert');

    // region update/delete
    const rowId = db.insert('topic', {id: 'testInsert', name: 'test_insert_name', note: ''});
    const updateInfo = db.update('topic', {id: 'testUpdate'}, {rowid: rowId});

    assert.deepStrictEqual(updateInfo, {
        changes: 1,
        lastInsertRowid: rowId
    }, 'update return info error');

    const updateRow = db.select('topic', {rowid: rowId});
    assert.strictEqual(updateRow[0].id, 'testUpdate', 'update set value error');

    const delInfo = db.delete('topic', {id: 'testUpdate'});
    assert.deepStrictEqual(delInfo, {
        changes: 1,
        lastInsertRowid: rowId
    }, 'delete return info error');

    const selectDelRows = db.select('topic', {id: 'testUpdate'});
    assert.strictEqual(selectDelRows.length, 0, 'delete error');
    // endregion

})()
