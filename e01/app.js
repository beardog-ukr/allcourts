var fs = require('fs');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

console.log("app mode is %s", app.get('env') );

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public/static', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// ============================================================================
//  Note, in production mode nginx will handle the static files
// But during devlopment I need nodejs to do it
if (app.get('env') === 'development') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'data')));
}

// ============================================================================

var routes = require('./routes/index');
app.use('/', routes);

var regionPages = require('./routes/regionPages');
app.use('/region', regionPages);

var users = require('./routes/users');
app.use('/users', users); //TODO: remove this line

// ============================================================================
var ras = {
    globalTitle: "Can be title fo all pages"
  , websiteUrl: "http://allcourts.tk" 
  , addGa : true
  } ;
if (app.get('env') === 'development') {
  ras.websiteUrl = 'http://localhost:3000'   ;
  ras.addGa = false;
}
app.routingAppSettings=ras;
//console.log("wsurl %s" , app.routingAppSettings.websiteUrl);

// ============================================================================

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', 
               {
                 message: err.message,
                 error: err ,
                 "glSettings": req.app.routingAppSettings
               });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// ============================================================================
// ============================================================================

module.exports = app;
