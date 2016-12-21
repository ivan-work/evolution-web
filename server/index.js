import globals from '../globals';
import path from 'path';
import http from 'http';
import express from 'express';
import logger from '~/shared/utils/logger'
import configureStore from './configureStore';

logger.info('NODE_ENV =', process.env.NODE_ENV);

const app = express();

const server = http.createServer(app);
app.set('port', process.env.PORT || 2000);

configureStore(server, app);

require('./routes/index')(app);

import frontendDevelopment from './frontend.development';
import frontendProduction from './frontend.production';
import webpackConfig from '../webpack.client.babel';

(process.env.NODE_ENV === 'development' ? frontendDevelopment : frontendProduction)(webpackConfig, app);

server.on('error', onError);
server.on('listening', onListening);
server.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof process.env.PORT === 'string'
    ? 'Pipe ' + process.env.PORT
    : 'Port ' + process.env.PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger.info('Listening on ' + bind);
  logger.info('process.env.NODE_ENV=', process.env.NODE_ENV);
}
