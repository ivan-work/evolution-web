'use strict'
require('babel-register');
require('babel-polyfill');
var logger = require('../shared/utils/logger').default;
var bind = '0.1.2.3';

logger.error('Listening on ' + bind);
logger.warn('Listening on ' + bind);
logger.info('Listening on ' + bind);
logger.verbose('Listening on ' + bind);
logger.debug('Listening on ' + bind);
logger.silly('Listening on ' + bind);