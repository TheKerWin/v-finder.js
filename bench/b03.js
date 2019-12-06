var sql = require('mysql')
var con = sql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        multipleStatements: true
});
var qs = response;
var x = con.query(qs);


var sql2 = require('mysql')
var con2 = sql2.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        multipleStatements: true
});
var x2 = con2.query("qs");

var sql3 = require('mysql')
var con3 = sql3.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        multipleStatements: true
});
var x3 = con3.query("q"+input);
