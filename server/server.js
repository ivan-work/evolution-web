import Express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import serverConfig from './config';

const app = new Express();
const frontend = require('./frontend');

const webpackConfig = (process.env.NODE_ENV !== 'production'
  ? require('../webpack.dev.babel')
  : require('../webpack.prod.babel'));

console.log((process.env.NODE_ENV !== 'production'));

app.use(frontend(webpackConfig));

app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`running on port: ${serverConfig.port}`); // eslint-disable-line
  }
});

