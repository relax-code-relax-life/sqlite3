# Usage

```javascript
const DB = require('relax-sqlite3');
const db = new DB({
    dbFilePath: './database/test.db',
    initSqlFiles: ['./database/init.sql'],
    tableSchema: {
        table1: ['column1', 'column2'],
        t2: ['c1', 'c2', 'c3']
    },
    isDev: false,
    logger: {
        error: console.error,
        info: console.log,
        debug: console.log
    }
});

const rows = db.select('table1');
console.log(rows);
```

# Class DB

[DB](./doc/classes/export_.md)

