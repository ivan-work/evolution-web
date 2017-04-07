var router = require('express').Router();
var path = require('path');
import prune from 'json-prune';

module.exports = (app, passport) => {
// Rest API
//require(path.join(__dirname, './', 'todos'))(router);
//require(path.join(__dirname, './', 'users'))(router);

// Homepage/Client
  router.get('/', function (req, res, next) {
    res.send("ok");
  });

// Homepage/Client
  router.get('/state', function (req, res, next) {
    const state = app.get('store').getState().toJS();

    state.connections = Object.keys(state.connections).reduce((result, key) => {
      result[key] = '<socket>';
      return result;
    }, {});

    res.json(state);
  });

  // set authentication routes
  //require('./authentication.js')(app, passport);

  // set other routes
  app.use('/api', router);
};