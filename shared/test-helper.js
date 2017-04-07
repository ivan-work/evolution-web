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
  }
};

global.mockStore = configureStore([thunk, testSocketMiddleware]);

global.addSocketId = (connectionId, action) => {
  action.meta.TEST_SOCKET_ID = connectionId;
  return action;
};


//global.socketOf = (fnName, container, connectionId) => {
//  if (connectionId !== void 0) {
//    return (...args) => {
//      const result = actions[fnName](...args);
//      return container[fnName](result.data);
//    };
//};