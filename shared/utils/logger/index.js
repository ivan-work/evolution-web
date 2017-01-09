import winston from 'winston';
import {consoleTransport} from './transports';

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

const NullTransport = () => ({
  name: 'NullTransport'
  , log: (level, msg, meta, callback) => callback(null)
});

require('winston-google-spreadsheet').GoogleSpreadSheet;
const SSTransport = () => new (winston.transports.GoogleSpreadsheet)({
  'fileId': process.env.GOOGLE_LOGS_FILE
  , 'level': 'info'
  , 'refreshToken': process.env.GOOGLE_REFRESH_TOKEN
  , 'clientId': process.env.GOOGLE_CLIENT_ID
  , 'clientSecret': process.env.GOOGLE_CLIENT_SECRET
});

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
    (process.env.GOOGLE_LOGS_FILE ? SSTransport() : NullTransport())
  ],
  exitOnError: false
});