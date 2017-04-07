//require('source-map-support').install();
if (!global._babelPolyfill) require('babel-polyfill');
import polyfills from '../shared/utils/polyfills'
import logger from '../shared/utils/logger';
import chai from 'chai';
import sinon from 'sinon';
import chaiImmutable from 'chai-immutable';
import jsdom from 'jsdom';
import {shallow, mount} from 'enzyme';

chai.use(chaiImmutable);
chai.config.includeStack = true;

global.sinon = sinon;
global.expect = chai.expect;
global.mount = mount;
global.shallow = shallow;
global.fastCheck = false;

var exposedProperties = ['window', 'navigator', 'document', 'componentHandler'];

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});
global.navigator = {
  userAgent: 'node.js'
};

global.window.localStorage = require('./test/setup-local-storage-mock').default();
global.window.sessionStorage = require('./test/setup-local-storage-mock').default();

global.window.matchMedia = window.matchMedia || (() => ({
    matches: false
    , addListener: () => null
    , removeListener: () => null
  }));

// https://github.com/tleunen/react-mdl/issues/193
require('react-mdl/extra/material');
global.Element = global.window.Element;
global.CustomEvent = global.window.CustomEvent;
global.Event = global.window.Event;
global.NodeList = global.window.NodeList;
global.Node = global.window.Node;

// https://stackoverflow.com/questions/26867535/calling-setstate-in-jsdom-based-tests-causing-cannot-render-markup-in-a-worker
require('fbjs/lib/ExecutionEnvironment').canUseDOM = true;

//Object.keys(window).forEach((key) => {
//  if (!(key in global)) {
//    global[key] = window[key];
//  }
//});

process.env.TEST = true;
process.env.DEBUG = '*';
process.env.JWT_SECRET = 'secret';

const TEST_PORT = 5000;
const TEST_URL = 'http://localhost:' + TEST_PORT;

import { createStore, compose, applyMiddleware } from 'redux'
import configureStore from '../client/configuration/configureStore'
import thunk from 'redux-thunk';
import { reduxTimeout } from './utils/reduxTimeout';
import { reduxQuestion } from './utils/reduxQuestion';
//import { reduxTimeout } from 'redux-timeout';
import { combineReducers } from 'redux-immutable';
import * as actions from './actions/actions';
import { createMemoryHistory } from 'react-router';
import {routerReducer, appRouterMiddleware, syncHistoryWithStore} from '../client/configuration/routing';

const clientReducers = require('../client/reducers/index');
const serverReducers = require('../server/reducers/index');

import syncSocketIOServer from './test/sync-socket-io'
import syncSocketIOClient from './test/sync-socket-io-client'
import {socketStore as socketClientStore, socketMiddleware as socketClientMiddleware} from '../client/configuration/socket';
import {socketStore as socketServerStore, socketMiddleware as socketServerMiddleware} from '../server/socket';
import {errorMiddleware as serverErrorMiddleware} from '../server/middleware/error';

const mixinActions = (store => {
  store.actions = [];
  store.getActions = () => store.actions;
  store.getActionTypes = () => store.getActions().map(a => a.type);
  store.clearActions = () => store.actions = [];
  store.getAction = (i) => store.getActions()[i];
  store.getActionType = (i) => store.getActions()[i].type;
  store.getActionData = (i) => store.getActions()[i].data;
  store.getActionMeta = (i) => store.getActions()[i].meta;
});

global.mockServerStore = function (initialServerState) {
  const errorInterceptor = () => {
    console.log('intercepted')
  };
  const ioServer = syncSocketIOServer();
  const serverStore = createStore(
    combineReducers({...serverReducers})
    , initialServerState
    , applyMiddleware(
      serverErrorMiddleware(errorInterceptor)
      , thunk
      , reduxQuestion()
      , reduxTimeout()
      , store => next => action => {
        serverStore.actions.push(action);
        return next(action);
      }
      , socketServerMiddleware(ioServer)
    ));

  socketServerStore(ioServer, serverStore);

  serverStore.getSocket = () => ioServer;

  serverStore.errorInterceptor = errorInterceptor;

  mixinActions(serverStore);

  return serverStore
};

global.mockClientStore = function (initialClientState) {
  const ioClient = syncSocketIOClient();
  const history = createMemoryHistory('/');
  const clientStore = configureStore(combineReducers({...clientReducers, routing: routerReducer}), initialClientState, [
    appRouterMiddleware(history)
    , socketClientMiddleware(ioClient)
  ]);
  socketClientStore(ioClient, clientStore);

  clientStore.getHistory = () => history;
  clientStore.getClient = () => ioClient;
  clientStore.getSocket = () => ioClient.socket;
  clientStore.getConnectionId = () => ioClient.socket.id;

  clientStore.getConnection = () => ({
    connectionId: clientStore.getConnectionId()
    , socket: clientStore.getSocket()
  });

  clientStore.connect = (serverStore) => {
    ioClient.connect(serverStore.getSocket());
    return clientStore;
  };

  clientStore.disconnect = (reason) => clientStore.getClient().disconnect(reason);

  mixinActions(clientStore);

  return clientStore
};

global.expectUnchanged = (cb, ...stores) => {
  const LOG_LEVEL = logger.transports.console.level;
  logger.transports.console.level = 'error';
  let previousStates = stores.map(store => store.getState());
  cb();
  stores.forEach((store, i) => {
    expect(store.getState().toJS()).eql(previousStates[i].toJS());
  });
  logger.transports.console.level = LOG_LEVEL;
};

global.expectChanged = (cb, ...stores) => {
  let previousStates = stores.map(store => store.getState());
  cb();
  stores.forEach((store, i) => {
    expect(store.getState()).not.equal(previousStates[i]);
  });
};

import './test-helper-mocks';