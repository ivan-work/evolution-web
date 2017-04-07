//require('source-map-support').install();
import polyfills from '../shared/utils/polyfills'
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
    , addListener: () => {
    }
    , removeListener: () => {
    }
  }));

////https://github.com/tleunen/react-mdl/issues/193
require('react-mdl/extra/material');
global.Element = global.window.Element;
global.CustomEvent = global.window.CustomEvent;
global.Event = global.window.Event;
global.NodeList = global.window.NodeList;
global.Node = global.window.Node;

//Object.keys(window).forEach((key) => {
//  if (!(key in global)) {
//    global[key] = window[key];
//  }
//});

//let warn = console.error;
//console.error = function(warning) {
//  if (/^Warning: (Invalid prop|Failed prop type)/.test(warning)) {
//    //console.error('uhh', warning)
//    console.log(warning);
//    throw new Error('Invalid prop/Failed prop type');
//  }
//  warn.apply(console, arguments);
//};

process.env.TEST = true;
process.env.DEBUG = '*';
process.env.JWT_SECRET = 'secret';

const TEST_PORT = 5000;
const TEST_URL = 'http://localhost:' + TEST_PORT;

import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import { reduxTimeout } from './utils/reduxTimeout';
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

const mixinActions = (store => {
  store.actions = [];
  store.getActions = () => store.actions;
  store.getActionTypes = () => store.getActions().map(a => a.type)
  store.clearActions = () => store.actions = [];
  store.getAction = (i) => store.getActions()[i];
  store.getActionType = (i) => store.getActions()[i].type;
  store.getActionData = (i) => store.getActions()[i].data;
  store.getActionMeta = (i) => store.getActions()[i].meta;
});

global.mockServerStore = function (initialServerState) {
  const ioServer = syncSocketIOServer();
  const serverStore = createStore(
    combineReducers({...serverReducers})
    , initialServerState
    , compose(
      applyMiddleware(thunk)
      , applyMiddleware(reduxTimeout())
      , applyMiddleware(store => next => action => {
        serverStore.actions.push(action);
        next(action);
      })
      , applyMiddleware(socketServerMiddleware(ioServer))
      //, applyMiddleware(thunk)
    ));

  socketServerStore(ioServer, serverStore);

  serverStore.getSocket = () => ioServer;

  mixinActions(serverStore);

  return serverStore
};

global.mockClientStore = function (initialClientState) {
  const ioClient = syncSocketIOClient();
  const history = createMemoryHistory('/');
  const clientStore = createStore(
    combineReducers({...clientReducers, routing: routerReducer})
    , initialClientState
    , compose(
      applyMiddleware(thunk)
      , applyMiddleware(reduxTimeout())
      , applyMiddleware(store => next => action => {
        clientStore.actions.push(action);
        next(action);
      })
      , applyMiddleware(appRouterMiddleware(history))
      , applyMiddleware(socketClientMiddleware(ioClient))
    ));
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

  mixinActions(clientStore);

  return clientStore
};

import {UserModel} from '~/shared/models/UserModel';
import {loginUserRequest} from '~/shared/actions/actions';
global.mockStores = (count = 2, initialServerStore = void 0) => {
  const serverStore = mockServerStore(initialServerStore);
  const result = [];
  const sandbox = sinon.sandbox.create();
  const UserSpy = sandbox.spy(UserModel, 'new');
  for (let i = 0; i < count; ++i) {
    const clientStore = mockClientStore().connect(serverStore);
    clientStore.dispatch(loginUserRequest('/', 'User' + i, 'testPassword'));
    const User = UserSpy.lastCall.returnValue;
    result.push({
      ['clientStore' + i]: clientStore
      , ['User' + i]: User
    });
  }
  result.forEach((r, i) => r['clientStore' + i].clearActions())
  serverStore.clearActions();
  sandbox.restore();
  result.unshift(serverStore);
  return result;
};