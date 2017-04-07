var router = require('express').Router();
var path = require('path');
import oauth from './oauth';
import glob from 'glob';
import fs from 'fs';
import yamlParser from 'yaml-js';

module.exports = (app, passport) => {
  /**
   * Static
   * */

  app.get('/changelog', (req, res) => res.sendFile(path.join(NODE_ROOT, 'changelog.txt')));

  /**
   * Translations
   * */
  const translations = glob.sync('i18n/*.yml')
    .reduce((result, fileName) => {
      const key = fileName.substr(fileName.lastIndexOf('/') + 1).replace(/\.yml$/, '');
      const value = yamlParser.load(fs.readFileSync(fileName).toString());
      return {...result, [key]: value};
    }, {});
  router.get('/i18n/*', function (req, res, next) {
    const translation = req.path.substr(req.path.lastIndexOf('/') + 1);
    if (translations.hasOwnProperty(translation)) {
      res.json(translations[translation]);
    } else {
      res.status(404).send('404');
    }
  });

  /**
   * Time Service
   * */
  router.get('/time', function (req, res, next) {
    res.status(200).json(Date.now());
  });

  if (process.env.NODE_ENV !== 'production') {
    router.get('/state', function (req, res, next) {
      const state = app.get('store').getState()
        .update('connections', c => c.keySeq().toArray());

      const replacer = (key, value) => (
        key === 'connections' ? void 0
          : key === 'chat' ? void 0
          : value);

      const format = (str) => `<pre>${str}</pre>`;
      res.send(format(JSON.stringify(state.toJS(), replacer, '  ')));
    });
  }

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

  // set other routes
  app.use('/api', router);
};