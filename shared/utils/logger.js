function makeLogger() {
  if (process.env.BROWSER) {
    var Logger = function () {
      this.silly = this.log.bind(this, 'silly');
      this.debug = this.log.bind(this, 'debug');
      this.verbose = this.log.bind(this, 'verbose');
      this.info = this.log.bind(this, 'info');
      this.warn = this.log.bind(this, 'warn');
      this.error = this.log.bind(this, 'error');
    };

    Logger.prototype.log = function (level, msg, attributes) {
      console.log(level + ' - ' + msg + ' (' + JSON.stringify(attributes) + ')')
    };

    return new Logger()
  }

  const winston = require('winston');
  const config = require('winston/lib/winston/config');

  const util = require('util');

  winston.emitErrs = true;

  return new winston.Logger({
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'cyan',
      verbose: 'magenta',
      debug: 'green',
      silly: 'gray'
    }
    , transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
        , formatter: function (options) {
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
          //if (showLevel) {
          //}
          //
          //output += (options.align) ? '\t' : '';
          //output += (timestamp || showLevel) ? ': ' : '';
          //output += options.label ? ('[' + options.label + '] ') : '';
          //output += options.colorize === 'all' || options.colorize === 'message'
          //  ? config.colorize(options.level, options.message)
          //  : options.message;
          //
          //if (meta !== null && meta !== undefined) {
          //  if (meta && meta instanceof Error && meta.stack) {
          //    meta = meta.stack;
          //  }
          //
          //  if (typeof meta !== 'object') {
          //    output += ' ' + meta;
          //  }
          //  else if (Object.keys(meta).length > 0) {
          //    if (typeof options.prettyPrint === 'function') {
          //      output += ' ' + options.prettyPrint(meta);
          //    } else if (options.prettyPrint) {
          //      output += ' ' + '\n' + util.inspect(meta, false, options.depth || null, options.colorize);
          //    } else if (
          //      options.humanReadableUnhandledException
          //      && Object.keys(meta).length === 5
          //      && meta.hasOwnProperty('date')
          //      && meta.hasOwnProperty('process')
          //      && meta.hasOwnProperty('os')
          //      && meta.hasOwnProperty('trace')
          //      && meta.hasOwnProperty('stack')) {
          //
          //      //
          //      // If meta carries unhandled exception data serialize the stack nicely
          //      //
          //      var stack = meta.stack;
          //      delete meta.stack;
          //      delete meta.trace;
          //      output += ' ' + exports.serialize(meta);
          //
          //      if (stack) {
          //        output += '\n' + stack.join('\n');
          //      }
          //    } else {
          //      output += ' ' + exports.serialize(meta);
          //    }
          //  }
          //}
          //
          //return output;
        }
      })
      //, new winston.transports.File({
      //  level: 'info',
      //  filename: './logs/all-logs.log',
      //  handleExceptions: true,
      //  json: true,
      //  maxsize: 5242880, //5MB
      //  maxFiles: 5,
      //  colorize: false
      //})
    ],
    exitOnError: false
  });
}

export default makeLogger();