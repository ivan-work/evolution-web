import React from 'react';
import ReactDOM from 'react-dom';
//import RR from 'react-router';
import {Router, Route, hashHistory} from 'react-router';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
//import io from 'socket.io-client';
import reducer from './reducer';
//import {setClientId, setState, setConnectionState} from './action_creators';
import remoteActionMiddleware from './remote_action_middleware';
//import getClientId from './client_id';
import App from './components/App';
import {LoginContainer} from './components/Login';
import {Lobbies} from './components/Lobbies';

require('./style.css');

//const socket = io(`${location.protocol}//${location.hostname}:8090`);
//socket.on('state', state =>
//  store.dispatch(setState(state))
//);
//[
//  'connect',
//  'connect_error',
//  'connect_timeout',
//  'reconnect',
//  'reconnecting',
//  'reconnect_error',
//  'reconnect_failed'
//].forEach(ev =>
//  socket.on(ev, () => store.dispatch(setConnectionState(ev, socket.connected)))
//);

//const createStoreWithMiddleware = applyMiddleware(
//  remoteActionMiddleware(socket)
//)(createStore);
//const store = createStoreWithMiddleware(reducer);
const store = createStore(reducer);

//store.dispatch(setClientId(getClientId()));

const routes = <Route component={App}>
  <Route path="/" component={LoginContainer} />
  <Route path="/server" component={Lobbies} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
