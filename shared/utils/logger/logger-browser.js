const LOG_LEVELS = ['silly'
  , 'debug'
  , 'verbose'
  , 'info'
  , 'warn'
  , 'error'
];
var Logger = function () {
  LOG_LEVELS.forEach((level, index) => {
    this[level] = this.log.bind(this, level, index);
  });
};

Logger.prototype.getLogLevel = function () {
  return window && window.LOG_LEVEL ? window.LOG_LEVEL : 3;
};

Logger.prototype.log = function (level, index, msg, attributes) {
  if (index > this.getLogLevel())
    console.log(level + ' - ' + msg + ' (' + JSON.stringify(attributes) + ')')
};

export default new Logger();