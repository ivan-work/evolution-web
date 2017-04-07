import chai from 'chai';
import chaiImmutable from 'chai-immutable';
//import jsdom from 'jsdom';

chai.use(chaiImmutable);

global.expect = chai.expect;

//global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
//global.window = document.defaultView;
//global.window.localStorage = require('./test/setup-local-storage-mock').default;

//Object.keys(window).forEach((key) => {
//  if (!(key in global)) {
//    global[key] = window[key];
//  }
//});

process.env.DEBUG = '*';

const TEST_PORT = 5000;
const TEST_URL = 'http://localhost:' + TEST_PORT;

import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import { combineReducers } from 'redux-immutable';
import * as actions from './actions/actions';
const clientReducers = require('../client/reducers/index');
const serverReducers = require('../server/reducers/index');

const makeIoServer = require('socket.io');
import {makeSocketClient, socketStore as socketClientStore, socketMiddleware as socketClientMiddleware} from '../client/socket';
import {socketServer, socketStore as socketServerStore, socketMiddleware as socketServerMiddleware} from '../server/socket';

global.mockServerStore = function (initialServerState) {
  const ioServer = makeIoServer.listen(TEST_PORT);
  console.log('ioServer', ioServer.connected);
  const serverStore = createStore(
    combineReducers({...serverReducers})
    , initialServerState
    , compose(
      applyMiddleware(thunk)
      , applyMiddleware(store => next => action => {
        serverStore.actions.push(action);
        next(action);
      })
      , applyMiddleware(socketServerMiddleware(ioServer))
    ));
  socketServerStore(ioServer, serverStore);
  serverStore.actions = [];
  serverStore.getActions = () => serverStore.actions;
  serverStore.clearActions = () => serverStore.actions = [];
  serverStore.end = () => {
    ioServer.close();
  };
  return serverStore
};

global.mockClientStore = function (initialClientState) {
  const ioClient = makeSocketClient(TEST_URL, {
    //'reconnection delay' : 0
    //, 'reopen delay' : 0
    //, 'force new connection' : true
  });
  console.log('ioClient', ioClient.connected);
  const clientStore = createStore(
    combineReducers({...clientReducers})
    , initialClientState
    , compose(
      applyMiddleware(thunk)
      , applyMiddleware(store => next => action => {
        clientStore.actions.push(action);
        next(action);
      })
      , applyMiddleware(socketClientMiddleware(ioClient))
    ));
  socketClientStore(ioClient, clientStore);
  clientStore.actions = [];
  clientStore.getActions = () => clientStore.actions;
  clientStore.clearActions = () => clientStore.actions = [];
  return clientStore
};

//const testClientSocketMiddleware = (serverStore, connectionId) => store => next => action => {
//  next(action);
//  if (action.meta && action.meta.server) {
//    if (actions.clientToServer[action.type]) {
//      serverStore.dispatch(actions.clientToServer[action.type](connectionId, JSON.parse(JSON.stringify(action.data))));
//    } else {
//      throw new Error(`actions.clientToServer[${action.type}] doesn't exist!`);
//    }
//  }
//};
//
//const testServerSocketMiddleware = store => next => action => {
//  if (action.meta) {
//    if (action.meta.connectionId) {
//      if (actions.serverToClient[action.type]) {
//        store.getState().get('connections').get(action.meta.connectionId)().dispatch(actions.serverToClient[action.type](action.data));
//      } else {
//        throw new Error(`actions.serverToClient[${action.type}] doesn't exist!`);
//      }
//    }
//    if (action.meta.clients) {
//      if (actions.serverToClient[action.type]) {
//        store.getState().get('connections').map(c => {
//          if (typeof c === 'function') {
//            c().dispatch(actions.serverToClient[action.type](JSON.parse(JSON.stringify(action.data))))
//          }
//        });
//      } else {
//        throw new Error(`actions.serverToClient[${action.type}] doesn't exist!`);
//      }
//    }
//  }
//  next(action);
//};
