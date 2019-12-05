var sql = require('mysql')
var con = sql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        multipleStatements: true
});

module.exports = {exportedCon : con};

module.exports.exportedCon2 = con;
