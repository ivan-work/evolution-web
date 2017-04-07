import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import {Map} from 'immutable';
import React from 'react'
import ReactDOM from 'react-dom'
import { combineReducers } from 'redux-immutable';
import { createStore, compose, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerMiddleware, LOCATION_CHANGE } from 'react-router-redux'
import thunk from 'redux-thunk';

import * as reducers from './reducers'
import routes from './routes';

import './styles/style.scss';

const routerReducerState = Map({
  locationBeforeTransitions: null
});
const routerReducer = (state = routerReducerState, action) => {
  console.log('state', state.toJS());
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

const store = createStore(
  reducer
  , Map()
  , compose(
    applyMiddleware(thunk),
    routerMiddleware(browserHistory),
    DevTools.instrument()
  )
);

const history = syncHistoryWithStore(browserHistory, store, {
  selectLocationState (state) {
    console.log('selectLocationState', state.toJS())
    return state.get('routing').toJS();
  }
});

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        {routes}
      </Router>
      <DevTools />
    </div>
  </Provider>,
  document.getElementById('app')
);