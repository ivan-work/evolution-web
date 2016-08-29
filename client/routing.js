import {Map} from 'immutable';
import { hashHistory } from 'react-router';
import { syncHistoryWithStore as _syncHistoryWithStore, routerMiddleware, LOCATION_CHANGE } from 'react-router-redux';

const routerReducerState = Map({
  locationBeforeTransitions: null
});

export const routerReducer = (state = routerReducerState, action) => {
  if (action.type === LOCATION_CHANGE) {
    return state.merge({
      locationBeforeTransitions: action.payload
    });
  }
  return state;
};

export const syncHistoryWithStore = (store, history = hashHistory) => _syncHistoryWithStore(history, store, {
  selectLocationState: (state) => state.get('routing').toJS()
});

export const appRouterMiddleware = (history) => routerMiddleware(history);