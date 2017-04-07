import chai from 'chai';
import chaiImmutable from 'chai-immutable';

chai.use(chaiImmutable);

global.expect = chai.expect;

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './actions/actions';

const testSocketMiddleware = store => next => action => {
  next(action);
  if (action.meta) {
    if (action.meta.server) {
      store.dispatch(actions.clientToServer[action.type](action.meta.TEST_SOCKET_ID, action.data));
    }
    if (action.meta.connectionId || action.meta.clients) {
      if (actions.serverToClient[action.type]) {
        store.dispatch(actions.serverToClient[action.type](action.data));
      } else {
        throw new Error(`actions.serverToClient[${action.type}] doesn't exist!`);
      }
    }
  }
};

global.mockStore = configureStore([thunk, testSocketMiddleware]);
global.window = {
  localStorage: storageMock()
};

global.addSocketId = (connectionId, action) => {
  action.meta.TEST_SOCKET_ID = connectionId;
  return action;
};

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