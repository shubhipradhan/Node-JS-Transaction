require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var mysql = require('mysql');

// for creating the single connect, or one-to-one connection
/*
var connection = mysql.createConnection({
    host: 'localhost', // hosting for DB
    user: 'root', // username for MySql server
    password: '', // password
    port: '3306', // port number
    database: 'MySQLTransactionDB', // Database name
    multipleStatements: true, // Allow multiple mysql statements per query. Be careful with this, it could increase the scope of SQL injection attacks
});

// connection.connect usage is a recommended way, it can be implicity remove, just by directly using connection.query
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});
// Begin transaction 
connection.beginTransaction(function(err) {
  if (err) { throw err; }
  connection.query('INSERT INTO names SET name=?', "Shubhi", function(err, result) {
      if (err) {
          connection.rollback(function() {
              throw err;
          });
      }

      var log = result.insertId;

      connection.query('INSERT INTO log SET logid=?', log, function(err, result) {
          if (err) {
              connection.rollback(function() {
                  throw err;
              });
          }
          connection.commit(function(err) {
              if (err) {
                  connection.rollback(function() {
                      throw err;
                  });
              }
              console.log('Transaction Complete.');
              connection.end();
          });
      });
  });
});
// End transaction 

*/

// Rather than creating and managing connections one-by-one, this module also provides built-in connection pooling
var pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER, // username for MySql server
    password: process.env.DB_PASS, // password
    port: process.env.DB_PORT, // port number
    database: process.env.DB_NAME, // Database name
    multipleStatements: true, // Allow multiple mysql statements per query. Be careful with this, it could increase the scope of SQL injection attacks
});

pool.getConnection(function(err, connection) {
    if (err) {
        connection.rollback(function() {
            console.log('error', err);
            connection.release();
            //Failure
        });
    } else {
        connection.beginTransaction(function(err) {
            if (err) { //Transaction Error (Rollback and release connection)
                connection.rollback(function() {
                    console.log('error', err);

                    // connection.release();
                    reject(err);
                    //Failure
                });
            }
            var q1 = connection.query('Select * from names', function(err) {
                if (err) { //Query Error (Rollback and release connection)
                    console.log('error 1', err)
                }
            });

            var q2 = connection.query('INSERT INTO names SET name=?', ["Ankit"], function(err) {
                if (err) { //Query Error (Rollback and release connection)
                    console.log('error 2', err)
                }
            });

            connection.commit(function(err, results) {
                if (err) {
                    connection.rollback(function() {
                        connection.release();
                        //Failure
                    });
                } else {
                    console.log('q1', q1)
                    console.log('q1', q1._results)
                    console.log('q2', q2._results)
                        // console.log('results', results)
                    connection.release();
                    //Success
                }
            });

        }); // ending of pool
    }
});
















// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;