import path from 'path';
import fs from 'fs';
import config from 'winston/lib/winston/config';

const formatter = function (options) {
  const meta = options.meta;
  let obj = '';
  if (meta) {
    if (Object.keys(meta).length === 2 && meta.hasOwnProperty('message') && meta.hasOwnProperty('stack')) {
      obj = meta.stack;//.slice("Error: ".length, meta.stack.length);
    } else if (meta.toString) {
      if (meta.toJS) {
        obj = meta.toString.call(meta.toJS())
      } else if (Object.keys(meta).length) {
        obj = JSON.stringify(meta);
      }
    } else if (Object.keys(meta).length) {
      obj = JSON.stringify(meta);
    }
  }
  const delimeterIndex = options.message.indexOf(':');
  const parts = delimeterIndex < 0
    ? [options.message]
    : [options.message.substring(0, delimeterIndex)
    , options.message.substring(delimeterIndex + 1)];
  const header = `${options.level.toUpperCase().slice(0, 5)}: ${parts[0]}`;
  const body = `${parts[1] || ''} ${obj}`;
  return config.colorize(options.level, header) + body;
};

export const consoleTransport = {
  level: process.env.LOG_LEVEL || 'debug'
  , handleExceptions: true
  , json: false
  , colorize: true
  , formatter
};

const filePath = path.resolve('./logs/production.log');

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '');
}

export const fileTransport = {
  level: 'info'
  , silent: !(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development')
  , json: false
  , filename: filePath
  , maxsize: 5 * 1024 * 1024
  , maxFiles: 1
  , colorize: false
};

