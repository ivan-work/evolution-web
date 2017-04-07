//https://github.com/joshgeller/react-redux-jwt-auth-example

import {combineReducers} from 'redux';
import {routerStateReducer} from 'redux-router';
import auth from './auth';
import data from './data';

export default combineReducers({
  auth,
  data,
  router: routerStateReducer
});