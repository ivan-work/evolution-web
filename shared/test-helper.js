import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import jsdom from 'jsdom';

chai.use(chaiImmutable);

global.expect = chai.expect;

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.window.localStorage = storageMock();

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

function storageMock() {
  var storage = {};


  return {
    setItem: function (key, value) {
      storage[key] = value || '';
    },
    getItem: function (key) {
      return storage[key] || null;
    },
    removeItem: function (key) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function (i) {
      var keys = Object.keys(storage);
      return keys[i] || null;
    }
  };
}

import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import { combineReducers } from 'redux-immutable';
import * as actions from './actions/actions';
const clientReducers = require('../client/reducers/index');
import * as serverReducers from '../server/reducers/index';

global.mockServerStore = function (initialServerState) {
  const serverStore = createStore(
    combineReducers({...serverReducers})
    , initialServerState
    , compose(
      applyMiddleware(thunk)
      , applyMiddleware(store => next => action => {
        serverStore.actions.push(action);
        next(action);
      })
      , applyMiddleware(testServerSocketMiddleware)
    ));
  serverStore.actions = [];
  serverStore.getActions = () => serverStore.actions;
  serverStore.clearActions = () => serverStore.actions = [];
  return serverStore
};

global.mockClientStore = function (initialClientState, serverStore, connectionId) {
  const clientStore = createStore(
    combineReducers({...clientReducers})
    , initialClientState
    , compose(
      applyMiddleware(thunk)
      , applyMiddleware(store => next => action => {
        clientStore.actions.push(action);
        next(action);
      })
      , applyMiddleware(testClientSocketMiddleware(serverStore, connectionId))
    ));
  clientStore.actions = [];
  clientStore.getActions = () => clientStore.actions;
  clientStore.clearActions = () => clientStore.actions = [];
  return clientStore
};


const testClientSocketMiddleware = (serverStore, connectionId) => store => next => action => {
  next(action);
  if (action.meta && action.meta.server) {
    if (actions.clientToServer[action.type]) {
      serverStore.dispatch(actions.clientToServer[action.type](connectionId, JSON.parse(JSON.stringify(action.data))));
    } else {
      throw new Error(`actions.clientToServer[${action.type}] doesn't exist!`);
    }
  }
};

const testServerSocketMiddleware = store => next => action => {
  if (action.meta) {
    if (action.meta.connectionId) {
      if (actions.serverToClient[action.type]) {
        store.getState().get('connections').get(action.meta.connectionId)().dispatch(actions.serverToClient[action.type](action.data));
      } else {
        throw new Error(`actions.serverToClient[${action.type}] doesn't exist!`);
      }
    }
    if (action.meta.clients) {
      if (actions.serverToClient[action.type]) {
        store.getState().get('connections').map(c => {
          if (typeof c === 'function') {
            c().dispatch(actions.serverToClient[action.type](JSON.parse(JSON.stringify(action.data))))
          }
        });
      } else {
        throw new Error(`actions.serverToClient[${action.type}] doesn't exist!`);
      }
    }
  }
  next(action);
};
