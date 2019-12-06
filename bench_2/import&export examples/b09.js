var source = require('./b08.js');

var qs = "select * from table";
var x = source.exportedCon.query(qs);
var y = source.exportedCon2.query(qs);
