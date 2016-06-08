import {createReducer} from '../utils';
import {LOGIN_USER_REQUEST, LOGIN_USER_SUCCESS, LOGIN_USER_FAILURE, LOGOUT_USER} from '../constants';
//import {pushState} from 'redux-router';
//import jwtDecode from 'jwt-decode';
import {fromJS} from 'immutable';

const initialState = fromJS({
  token: null,
  userName: null,
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null
});

export const auth = createReducer(initialState, {
  [LOGIN_USER_REQUEST]: (state, payload) => {
    return state.merge(Map.of({
      'isAuthenticating': true,
      'statusText': null
    }));
  },
  [LOGIN_USER_SUCCESS]: (state, payload) => {
    return state.merge(Map.of({
      'isAuthenticating': false,
      'isAuthenticated': true,
      //'token': payload.token,
      //'userName': jwtDecode(payload.token).userName,
      'username': payload.username,
      'statusText': 'You have been successfully logged in.'
    }));

  },
  [LOGIN_USER_FAILURE]: (state, payload) => {
    return state.merge(Map.of({
      'isAuthenticating': false,
      'isAuthenticated': false,
      'token': null,
      'userName': null,
      'statusText': `Authentication Error: ${payload.status} ${payload.statusText}`
    }));
  },
  [LOGOUT_USER]: (state, payload) => {
    return state.merge(Map.of({
      'isAuthenticated': false,
      'token': null,
      'userName': null,
      'statusText': 'You have been successfully logged out.'
    }));
  }
});