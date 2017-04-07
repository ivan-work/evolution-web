/**
 * Module dependencies.
 */
import logger from '../shared/utils/logger';
import polyfills from '../shared/utils/polyfills'

var app = require('./app');
var http = require('http');
var config = require('./config/config.js');

import * as reducers from './reducers';
import {createStore, compose, applyMiddleware} from 'redux'
import thunk from 'redux-thunk';
import {reduxTimeout} from '~/shared/utils/reduxTimeout'
import {combineReducers} from 'redux-immutable';
import {socketServer, socketStore, socketMiddleware} from './socket';
import {errorMiddleware} from './middleware/error';

/**
 * Create HTTP server and sockets.
 */
const reducer = combineReducers({
  ...reducers
});

const timeouts = {};
app.set('timeouts', timeouts);

const server = http.createServer(app);
const socket = socketServer(server);
const store = createStore(
  reducer
  , applyMiddleware(
    errorMiddleware()
    , thunk
    , reduxTimeout(timeouts)
    , socketMiddleware(socket)
  )
);

app.set('store', store);

socketStore(socket, store);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(config.port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

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
