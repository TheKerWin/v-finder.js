var express = require('express');
var child_maker = require("child_process"), t = 2;
var child_process = require('child_process');
var execer = require('child_process').exec;
var execer2 = require('child_process').exec;
var app = express();
const port = 3000;

app.get('/1', function (req, res) {
  child_process.exec(
    'ls ' + req.query.file_path,
    function (err, data) {
      console.log('err: ', err)
      console.log('data: ', data);
    });
  res.send('Hello World!')
})
app.get('/2', function (req, res) {
  child_maker.exec(
    'ls ' + req.query.file_path,
    function (err, data) {
      console.log('err: ', err)
      console.log('data: ', data);
    });
  res.send('Hello World!')
})
app.get('/4', function (req, res) {
  require('child_process').exec(
    'ls ' + req.query.file_path,
    function (err, data) {
      console.log('err: ', err)
      console.log('data: ', data);
    });
  res.send('Hello World!')
})
app.get('/5', function (req, res) {
  execer2(
    'ls ' + req.query.file_path,
    function (err, data) {
      console.log('err: ', err)
      console.log('data: ', data);
    });
  res.send('Hello World!')
})

app.get('/3', function (req, res) {
  execer(
    'ls ' + req.query.file_path,
    function (err, data) {
      console.log('err: ', err)
      console.log('data: ', data);
    });
  res.send('Hello World!')
})

app.get('/6', function (req, res) {
  execer2(
    'ls ',
    function (err, data) {
      console.log('err: ', err)
      console.log('data: ', data);
    });
  res.send('Hello World!');
})

function runs_exec(input, res) {
  zipzap();
  execer2("ls",
    function (err, data) {
      console.log('err: ', err)
      console.log('data: ', data);
    });
  res.send("hello world");
}

app.get('/7', runs_exec)

function zipzap() {
  with(zipzapzoot()) {
    a = PI * 2 * 2;
    b = cos(PI);
    console.log(a*b);
  }
}

function zipzapzoot() {
  return Math;
}

function bimbap(){
  typeof(Math)
  return zipzapzoot();
}

function testBreak(x) {
  var i = 0;
  var j = [1,2,3,4];
  var k = [];

  while (i < 6) {
    if (i == 3) {
      break;
    }
    i += 1;
  }
  outer_block: {
    inner_block: {
      console.log('1');
      break outer_block; // breaks out of both inner_block and outer_block
      console.log(':-('); // skipped
    }
    console.log('2'); // skipped
  }



  return i * x;
}



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
