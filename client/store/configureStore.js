//import thunk from 'redux-thunk';
//import routes from '../routes';
//import {reduxReactRouter} from 'redux-router';
//import {browserHistory} from 'react-router';
//import {applyMiddleware, compose, createStore} from 'redux';
//import createLogger from 'redux-logger';
import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const reducer = combineReducers({
    ...reducers,
    routing: routerReducer
  });


  let createStoreWithMiddleware;

  const logger = createLogger();

  const middleware = applyMiddleware(thunk, logger);

  createStoreWithMiddleware = compose(
    middleware,
    reduxReactRouter({routes, browserHistory})
  );

  const store = createStoreWithMiddleware(createStore)(rootReducer, initialState);

  if (module.hot) {
    module.hot
      .accept('../reducers', () => {
        const nextRootReducer = require('../reducers/index');
        store.replaceReducer(nextRootReducer);
      });
  }

  return store;

}
