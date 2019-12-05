var x = require('mysql').createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        multipleStatements: true
})

var y = x.query(qs);
