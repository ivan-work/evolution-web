var router = require('express').Router();
var path = require('path');
import oauth from './oauth';

module.exports = (app, passport) => {
  router.get('/state', function (req, res, next) {
    const state = app.get('store').getState().toJS();

    state.connections = Object.keys(state.connections).reduce((result, key) => {
      result[key] = '#socket#';
      return result;
    }, {});

    const format = (str) => `<pre>${str}</pre>`;
    res.send(format(JSON.stringify(state, null, '  ')));
  });

  router.get('/timeouts', function (req, res, next) {
    const timeouts = app.get('timeouts');
    res.status(200).json(Object.keys(timeouts).reduce((result, key) => {
      const timer = timeouts[key];
      result[key] = timer ? timer.getRemaining() : timer;
      return result;
    }, {}));
  });

  router.use('/oauth', oauth);
  // set authentication routes
  //require('./authentication.js')(app, passport);


  router.get('*', function (req, res, next) {
    res.send('ok');
  });

  // set other routes
  app.use('/api', router);
};