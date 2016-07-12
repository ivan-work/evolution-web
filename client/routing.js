import {Map} from 'immutable';
import { routerMiddleware, LOCATION_CHANGE } from 'react-router-redux';

const routerReducerState = Map({
  locationBeforeTransitions: null
});

export const routerReducer = (state = routerReducerState, action) => {
  //console.log('state', state.toJS());
  if (action.type === LOCATION_CHANGE) {
    return state.merge({
      locationBeforeTransitions: action.payload
    });
  }
  return state;
};

export const appRouterMiddleware = (history) => routerMiddleware(history);