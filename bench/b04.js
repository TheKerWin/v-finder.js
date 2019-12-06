var sql = require('mysql')
var con = sql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        multipleStatements: true
});
con.connect(function(err) { if (err) throw err;console.log("connected...");})

var qs = "select * from table";
var x = con.query(qs);
