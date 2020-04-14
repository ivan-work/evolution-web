import logger, {loggerOnline} from '~/shared/utils/logger';
import {selectUser} from "../../shared/selectors";

var router = require('express').Router();
var path = require('path');
import oauth from './oauth';
import glob from 'glob';
import fs from 'fs';
import moment from 'moment';
import yamlParser from 'yaml-js';

import {db$findStats} from '../actions/db';

module.exports = (app, passport) => {
  /**
   * Static
   * */

  //app.get('/changelog', (req, res) => res.sendFile(path.join(NODE_ROOT, 'changelog.md')));

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

  router.use('/oauth', oauth);
  // set authentication routes
  //require('./authentication.js')(app, passport);

  // router.post('/stats/uiold', (req, res, next) => {
  //   const getState = app.get('store').getState;
  //   const user = selectUser(getState, req.body.userId);
  //   loggerOnline.info(`User ${user.login} is using OLD UI`);
  //   res.status(200).send(`It's sad`);
  // });

  // region debug state
  if (!!process.env.DEBUG_STATE) {
    router.get('/state', function (req, res, next) {
      const state = app.get('store').getState();
      // .update('connections', c => c.keySeq().toArray());

      const replacer = (key, value) => (
        key === 'connections' ? (Object.keys(value).reduce((result, connectionId) => {
            result[connectionId] = value[connectionId].ip;
            return result;
          }, {}))
          : key === 'chat' ? 'REPLACED'
          : key === 'log' ? 'REPLACED'
            : value);

      const format = (str) => `<pre>${str}</pre>`;
      res.send(format(JSON.stringify(state.toJS(), replacer, '  ')));
    });
  }

  if (!!process.env.DEBUG_STATE) {
    router.get('/timeouts', function (req, res, next) {
      const timeouts = app.get('timeouts');
      res.status(200).json(Object.keys(timeouts).reduce((result, key) => {
        const timer = timeouts[key];
        result[key] = timer ? timer.getRemaining() : timer;
        return result;
      }, {}));
    });
  }

  if (!!process.env.DEBUG_STATE) {
    router.get('/stats', (req, res, next) => {
      const from = moment(req.query.from, "YYYY-MM-DD");
      const to = moment(req.query.to, "YYYY-MM-DD");
      if (!from.isValid() || !to.isValid()) {
        res.status(400).send('Wrong parameters (from=YYYY-MM-DD&to=YYYY-MM-DD)');
        return;
      }
      return db$findStats(from.valueOf(), to.valueOf())
        .then(data => res.status(200).json(data))
        .catch(err => {
          console.error(err);
          res.status(500);
        })
    });
  }

  // endregion

  // set other routes
  app.use('/api', router);
};