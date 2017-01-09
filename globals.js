import fs from 'fs';
import uuid from 'uuid';

const originalV4 = uuid.v4;
uuid.v4 = () => originalV4().slice(0, 4);

if (fs.existsSync('.env')) require('dotenv').config();

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET undefined');

global.GLOBAL_VERSION = require('./package.json').version;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.GLOBAL_BROWSER = false; // defined in configs
process.env.PORT = process.env.PORT || 3000;

export default {
  GLOBAL_VERSION: JSON.stringify(GLOBAL_VERSION)
  , process: {
    env: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      , PORT: JSON.stringify(process.env.PORT)
      , VK_API_ID: JSON.stringify(process.env.VK_API_ID)
    }
  }
};