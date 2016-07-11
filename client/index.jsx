import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import {Map} from 'immutable';
import React from 'react'
import ReactDOM from 'react-dom'
import { combineReducers } from 'redux-immutable';
import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';

import { browserHistory } from 'react-router'
import { routerMiddleware, LOCATION_CHANGE } from 'react-router-redux'


import * as reducers from './reducers'

import 'react-mdl/extra/material.min.css'
import 'react-mdl/extra/material.min.js'
import './styles/style.scss';

import {makeSocketClient, socketStore, socketMiddleware} from './socket';

const routerReducerState = Map({
  locationBeforeTransitions: null
});
const routerReducer = (state = routerReducerState, action) => {
  //console.log('state', state.toJS());
  if (action.type === LOCATION_CHANGE) {
    return state.merge({
      locationBeforeTransitions: action.payload
    });
  }
  return state;
};

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
    , applyMiddleware(routerMiddleware(browserHistory))
    , applyMiddleware(socketMiddleware(socketClient))
    , DevTools.instrument()
  )
);

socketStore(socketClient, store);

import {Root} from './components/app/Root.jsx';

console.warn('GLOBAL RENDEEER');
ReactDOM.render(
  <Root store={store}>
    <DevTools />
  </Root>,
  document.getElementById('app')
);