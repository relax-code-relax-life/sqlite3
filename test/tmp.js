const Database = require('better-sqlite3');
const fs = require('fs');


const db = new Database(__dirname + '/test.db', {verbose: null, fileMustExist: false});

// const migration = fs.readFileSync(__dirname + '/init.sql', 'utf8');
// db.exec(migration);

// db.prepare('insert into topic1(id) values($id)').run({id: 666});
// db.prepare('insert into topic2(id) values($id)').run({id: 666});
// db.prepare('insert into topic3(id) values($id)').run({id: 666});

const iterator = db.prepare('select id,name,note from topic').iterate(undefined);

for (const row of iterator) {
    console.log(row);
}