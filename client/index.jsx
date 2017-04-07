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
import 'react-mdl/extra/material.min.css'
import 'react-mdl/extra/material.min.js'
import './styles/style.scss';

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

const socketClient = makeSocketClient(location.host);

const store = configureStore({
  reducer
  , router: appRouterMiddleware(browserHistory)
  , socket: socketMiddleware(socketClient)
});

const history = syncHistoryWithStore(store, browserHistory);

socketStore(socketClient, store);

ReactDOM.render(
  <Root store={store} history={history}>
    <DevTools />
  </Root>,
  document.getElementById('app')
);