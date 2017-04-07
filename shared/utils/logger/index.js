import winston from 'winston';
import {consoleTransport, fileTransport} from './transports';

export default new winston.Logger({
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    verbose: 'magenta',
    debug: 'green',
    silly: 'gray'
  }
  , transports: [
    new winston.transports.Console(consoleTransport)
  ],
  exitOnError: false
});

var NullTransport = require('winston-null');
require('winston-loggly-bulk');
export const fileLogger = new winston.Logger({
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    verbose: 'magenta',
    debug: 'green',
    silly: 'gray'
  }
  , transports: [
    (!process.env.LOGGLY_TOKEN ? NullTransport : new winston.transports.Loggly({
      token: process.env.LOGGLY_TOKEN
      , subdomain: "fen1kz"
      , tags: ["Winston-NodeJS"]
      , json: true
    }))
  ],
  exitOnError: false
});