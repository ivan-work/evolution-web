import React from 'react'
import ReactDOM from 'react-dom'
import polyfills from '../shared/utils/polyfills';

import { combineReducers } from 'redux-immutable';
import configureStore from './configuration/configureStore'

// Socket
import {makeSocketClient, socketStore, socketMiddleware} from './configuration/socket';

// History
import {createBrowserHistory} from 'history';

const history = createBrowserHistory();

import {setHistory} from '../shared/utils/history';

setHistory(history);

// Components
import * as reducers from './reducers'

// Styles
import './styles/reset.scss';
// import 'react-mdl/extra/material.min.css'
// import 'react-mdl/extra/css/material.teal-indigo.min.css'
// import 'react-mdl/extra/material.min.js'
import './styles/style.scss';
import 'rc-tooltip/assets/bootstrap_white.css'

// Services
// import {animationMiddleware} from './services/AnimationService';
import {uiv3animationMiddleware} from './reducers/animations-rdx-client';

const reducer = combineReducers({
  ...reducers
});

const APP_HOST = process.env.APP_HOST || window.location.host;
console.log(`Initializing new socket client (${APP_HOST})`);

const socketClient = makeSocketClient(APP_HOST, {forceNew: process.env.NODE_ENV === 'production'});

const store = configureStore(reducer, void 0, [
  // animationMiddleware()
  // ,
  uiv3animationMiddleware()
  , socketMiddleware(socketClient)
]);

socketStore(socketClient, store);

import RootService from './services/RootService';

const render = () => {
  import('./app/Root').then(({Root}) => {
    // console.log(store.getState().toJS());
    const $Root = ReactDOM.render(
      <Root store={store} history={history}/>,
      document.getElementById('app')
    );
    RootService.root = $Root;
  })
};
if (module.hot) {
  module.hot.accept('./app/Root', render);
}
render();

import {appChangeLanguage} from './actions/app';
store.dispatch(appChangeLanguage(store.getState().getIn(['app', 'lang'])));