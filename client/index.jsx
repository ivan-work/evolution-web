import React from 'react'
import ReactDOM from 'react-dom'
import polyfills from '../shared/utils/polyfills'

import { combineReducers } from 'redux-immutable';
import configureStore from './configuration/configureStore'

// Socket
import {makeSocketClient, socketStore, socketMiddleware} from './configuration/socket';

// Routing
import {routerReducer, appRouterMiddleware, syncHistoryWithStore} from './configuration/routing';

// History
import { browserHistory } from 'react-router';

// Components
import { Root } from './components/Root.jsx';
import { DevTools } from './components/DevTools.jsx'
import * as reducers from './reducers'

// Styles
import './styles/reset.scss';
// import 'react-mdl/extra/material.min.css'
import 'react-mdl/extra/css/material.teal-indigo.min.css'
import 'react-mdl/extra/material.min.js'
import './styles/style.scss';
import 'rc-tooltip/assets/bootstrap_white.css'

// Services
import {animationMiddleware} from './services/AnimationService';

const isDevelopment = process.env.NODE_ENV === 'development';
const DevToolsArray = (isDevelopment ? [DevTools.instrument()] : []);

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

const socketClient = makeSocketClient(window.location.host, {forceNew: true});

const store = configureStore(reducer, void 0, [
  appRouterMiddleware(browserHistory)
  , animationMiddleware()
  , socketMiddleware(socketClient)
], DevToolsArray);

const history = syncHistoryWithStore(store, browserHistory);

socketStore(socketClient, store);
const $Root = ReactDOM.render(
  <Root store={store} history={history}>
    {isDevelopment ? <DevTools /> : null}
  </Root>,
  document.getElementById('app')
);

import RootService from './services/RootService';
RootService.root = $Root;

import {appChangeLanguage} from './actions/app';
store.dispatch(appChangeLanguage(store.getState().getIn(['app', 'lang'])));