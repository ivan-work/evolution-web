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
import 'react-mdl/extra/material.min.css'
import 'react-mdl/extra/material.min.js'
import './styles/style.scss';

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

const socketClient = makeSocketClient(location.host, {forceNew: true});

const store = configureStore(reducer, void 0, [
  appRouterMiddleware(browserHistory)
  , socketMiddleware(socketClient)
], [DevTools.instrument()]);

const history = syncHistoryWithStore(store, browserHistory);

socketStore(socketClient, store);

import {UserService} from './services/UserService';

UserService.start(store.getState);

ReactDOM.render(
  <Root store={store} history={history}>
    <DevTools />
  </Root>,
  document.getElementById('app')
);