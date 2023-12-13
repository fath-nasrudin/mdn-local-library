var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const compression = require('compression');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');

var app = express();

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const MONGODB_URI_DEV = 'mongodb+srv://fathnasrudin:Mnczm7dHfy0EE0Oe@cluster0.fbjuovh.mongodb.net/local_library?retryWrites=true&w=majority';
const mongoDB = process.env.MONGODB_URI || MONGODB_URI_DEV;

async function main() {
  await mongoose.connect(mongoDB);
}

main().catch(err => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(helmet.contentSecurityPolicy({
  directives: {
    "srcipt-src": ["self", "code.jquery.com", "cdn.jsdelivr.net"]
  }
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
