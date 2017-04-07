require('dotenv').config();

global.GLOBAL_VERSION = require('./package.json').version;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.GLOBAL_NODE_ENV = process.env.NODE_ENV;
global.GLOBAL_BROWSER = null; // defined in configs
global.GLOBAL_SERVER_PORT = process.env.PORT; // defined in configs

export default {
  GLOBAL_VERSION: JSON.stringify(GLOBAL_VERSION)
  , GLOBAL_NODE_ENV: JSON.stringify(GLOBAL_NODE_ENV)
  , GLOBAL_BROWSER
};