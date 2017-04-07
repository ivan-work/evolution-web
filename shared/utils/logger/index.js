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
    new winston.transports.File(fileTransport)
    // , new winston.transports.Console(consoleTransport)
  ],
  exitOnError: false
});