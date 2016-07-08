import chai from 'chai';
import sinon from 'sinon';
import chaiImmutable from 'chai-immutable';
import jsdom from 'jsdom';

chai.use(chaiImmutable);

global.sinon = sinon;
global.expect = chai.expect;

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.window.localStorage = require('./test/setup-local-storage-mock').default();

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

Array.prototype.remove = function (argument) {
  const removeFn = (typeof argument === 'function'
    ? argument
    : (item) => item === argument);
  for (var i = 0; i < this.length; i++) {
    if (removeFn(this[i])) {
      this.splice(i, 1);
      break;
    }
  }
  return this;
};

process.env.TEST = true;
process.env.DEBUG = '*';
process.env.JWT_SECRET = 'secret';

const TEST_PORT = 5000;
const TEST_URL = 'http://localhost:' + TEST_PORT;

import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import { combineReducers } from 'redux-immutable';
import * as actions from './actions/actions';
const clientReducers = require('../client/reducers/index');
const serverReducers = require('../server/reducers/index');

import syncSocketIOServer from './test/sync-socket-io'
import syncSocketIOClient from './test/sync-socket-io-client'
import {socketStore as socketClientStore, socketMiddleware as socketClientMiddleware} from '../client/socket';
import {socketStore as socketServerStore, socketMiddleware as socketServerMiddleware} from '../server/socket';

const mixinActions = (store => {
  store.actions = [];
  store.getActions = () => store.actions;
  store.getActionTypes = () => store.getActions().map(a => a.type)
  store.clearActions = () => store.actions = [];
  store.getAction = (i) => store.getActions()[i];
  store.getActionType = (i) => store.getActions()[i].type;
  store.getActionData = (i) => store.getActions()[i].data;
  store.getActionMeta = (i) => store.getActions()[i].meta;
  store.hook = (actionType, callback) => {
    //store.hooks.
  };
});

global.mockServerStore = function (initialServerState) {
  const ioServer = syncSocketIOServer();
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

  serverStore.getSocket = () => ioServer;

  mixinActions(serverStore);

  return serverStore
};

global.mockClientStore = function (initialClientState) {
  const ioClient = syncSocketIOClient();
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

  clientStore.getClient = () => ioClient;
  clientStore.getSocket = () => ioClient.socket;
  clientStore.getConnectionId = () => ioClient.id;

  clientStore.getConnection = () => ({
    connectionId: clientStore.getConnectionId()
    , socket: clientStore.getSocket()
  });

  clientStore.connect = (serverStore) => {
    ioClient.connect(serverStore.getSocket());
    return clientStore;
  };

  mixinActions(clientStore);

  return clientStore
};