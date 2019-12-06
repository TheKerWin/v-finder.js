var sql = require('mysql')
var con = sql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        multipleStatements: true
});
//var x = con.query(qs);
const nameChange = function(dbCon){
  dbCon.query(qs);
  //con.query(qs);
};

nameChange(con);

(function(example){
  example.query(qs);
})(con);
