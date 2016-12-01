var config = require('./config/config.js');
var express = require('express');
//var session  = require('express-session');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var passport = require('passport');
var passport = null;
var app = express();

var frontend = require('./frontend');

//app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser(config.sessionOptions.secret));

// Sessions/PassportJS/Authentication
//require('./config/passport.js')(passport);
//var sessionOptions = config.sessionOptions;
//app.use(session(sessionOptions));
//app.use(passport.initialize());
//app.use(passport.session());

// set routes
require('./routes/index')(app, passport);

const webpackConfig = (process.env.NODE_ENV !== 'production'
  ? require('../webpack.dev.babel')
  : require('../webpack.prod.babel'));
app.use(frontend(webpackConfig));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if (err.message === '400') err.status = 400;
  res.status(err.status || 500);
  res.json('no');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.stack,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
