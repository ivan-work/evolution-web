require('dotenv').config();

global.GLOBAL_VERSION = require('./package.json').version;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.GLOBAL_BROWSER = false; // defined in configs
process.env.PORT = process.env.PORT || 3000;

export default {
  GLOBAL_VERSION: JSON.stringify(GLOBAL_VERSION)
  , process: {
    env: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      , PORT: JSON.stringify(process.env.PORt)
    }
  }
};