import winston from 'winston';
import {consoleTransport} from './transports';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  verbose: 'magenta',
  debug: 'green',
  silly: 'gray'
};

if (!process.env.TEST) require('winston-google-spreadsheet').GoogleSpreadSheet;
const SSTransport = (sheetIdx = 1, level = 'info') => new (winston.transports.GoogleSpreadsheet)({
  'fileId': process.env.GOOGLE_LOGS_FILE
  , level
  , 'refreshToken': process.env.GOOGLE_REFRESH_TOKEN
  , 'clientId': process.env.GOOGLE_CLIENT_ID
  , 'clientSecret': process.env.GOOGLE_CLIENT_SECRET
  , sheetIdx
});

const NullTransport = () => ({
  name: 'NullTransport'
  , log: (level, msg, meta, callback) => callback(null)
});

export default new winston.Logger({
  colors
  , transports: [
    new winston.transports.Console(consoleTransport)
    , (process.env.GOOGLE_LOGS_FILE ? SSTransport(3, 'error') : NullTransport())
  ],
  exitOnError: false
});

export const loggerOnline = new winston.Logger({
  transports: [
    (process.env.GOOGLE_LOGS_FILE ? SSTransport() : NullTransport())
  ],
  exitOnError: false
});

export const loggerChat = new winston.Logger({
  transports: [
    (process.env.GOOGLE_LOGS_FILE && process.env.GOOGLE_LOG_CHAT ? SSTransport(2) : NullTransport())
  ],
  exitOnError: false
});