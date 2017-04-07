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

export default new winston.Logger({
  colors
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
const SSTransport = (sheetIdx = 1) => new (winston.transports.GoogleSpreadsheet)({
  'fileId': process.env.GOOGLE_LOGS_FILE
  , 'level': 'info'
  , 'refreshToken': process.env.GOOGLE_REFRESH_TOKEN
  , 'clientId': process.env.GOOGLE_CLIENT_ID
  , 'clientSecret': process.env.GOOGLE_CLIENT_SECRET
  , sheetIdx
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