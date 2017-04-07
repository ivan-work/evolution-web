import React from 'react'
import ReactDOM from 'react-dom'
// DevTools
import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import { combineReducers } from 'redux-immutable';
import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import { reduxTimeout } from 'redux-timeout'
// History
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux'
import {routerReducer, appRouterMiddleware} from './routing';

import {Root} from './components/app/Root.jsx';
import * as reducers from './reducers'

import 'react-mdl/extra/material.min.css'
import 'react-mdl/extra/material.min.js'
import './styles/style.scss';

import {makeSocketClient, socketStore, socketMiddleware} from './socket';

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q">
    <LogMonitor theme="tomorrow" preserveScrollTop={false}/>
  </DockMonitor>
);

const socketClient = makeSocketClient(location.host);

const store = createStore(
  reducer
  , compose(
    applyMiddleware(thunk)
    , applyMiddleware(reduxTimeout())
    , applyMiddleware(appRouterMiddleware(browserHistory))
    , applyMiddleware(socketMiddleware(socketClient))
    , DevTools.instrument()
  )
);

const history = syncHistoryWithStore(browserHistory, store, {
  selectLocationState: (state) => state.get('routing').toJS()
});

socketStore(socketClient, store);

console.warn('GLOBAL RENDEEER');
ReactDOM.render(
  <Root store={store} history={history}>
    <DevTools />
  </Root>,
  document.getElementById('app')
);