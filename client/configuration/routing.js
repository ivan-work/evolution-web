import {Map} from 'immutable';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore as $syncHistoryWithStore, routerMiddleware, LOCATION_CHANGE } from 'react-router-redux';

const routerReducerState = Map({
  locationBeforeTransitions: null
});

export const routerReducer = (state = routerReducerState, action) => {
  return action.type !== LOCATION_CHANGE
    ? state
    : state.merge({
    locationBeforeTransitions: action.payload
  });
};

export const syncHistoryWithStore = (store, history = browserHistory) => $syncHistoryWithStore(history, store, {
  selectLocationState: (state) => state.get('routing').toJS()
});

export const appRouterMiddleware = (history) => routerMiddleware(history);