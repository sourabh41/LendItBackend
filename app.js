var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var app = express();

app.use(logger('short'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
	secret: 'lend-it',
	resave: false,
	saveUninitialized: true
}));


//-- Database Setup ------
var promise = require('bluebird');
var options = { promiseLib: promise };
var pgp = require('pg-promise')(options);
var cn = {
    host: 'localhost',
    port: 5090,
    database: 'LendIt',
    user: 'sourabh',
};
var db = pgp(cn);

app.use(function(req,res,next){
  req.db = db;
  next();
});


//-------- Routes ----------------------------------------------------------------

var indexRouter = require('./routes/index');
app.use('/', indexRouter);

var usersRouter = require('./routes/users');
app.use('/users', usersRouter);

var loginRouter = require('./routes/login');
app.use('/login', loginRouter);

var logoutRouter = require('./routes/logout');
app.use('/logout', logoutRouter);

var itemsRouter = require('./routes/items');
app.use('/items', itemsRouter)

var lendingsRouter = require('./routes/lendings');
app.use('/lendings', lendingsRouter)

var requestsRouter = require('./routes/requests');
app.use('/requests', requestsRouter)

var myItemsRouter = require('./routes/myItems');
app.use('/myItems', myItemsRouter)

var messagesRouter = require('./routes/messages');
app.use('/messages', messagesRouter)

var chatRouter = require('./routes/chat');
app.use('/chat', chatRouter)

var itemRouter = require('./routes/item');
app.use('/item', itemRouter)

var lendingRouter = require('./routes/lending');
app.use('/lending', lendingRouter)

var requestRouter = require('./routes/request');
app.use('/request', requestRouter)

var profileRouter = require('./routes/profile');
app.use('/profile', profileRouter)


//--------------------------------------------------------------------------------




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // return error json
  res.status(err.status || 500).json({
    status: false,
    message: err.message
  });
});

module.exports = app;
