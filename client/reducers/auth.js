import {createReducer} from '~/shared/utils';
//import {pushState} from 'redux-router';
//import jwtDecode from 'jwt-decode';
import {fromJS} from 'immutable';
import {UserRecord} from '../../shared/models/User';

const initialState = fromJS({
  token: null,
  user: JSON.parse(window.localStorage.getItem('user')),
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null
});

export const auth = createReducer(initialState, {
  loginUserRequest: (state, payload) => {
    return state.merge(Map({
      'isAuthenticating': true,
      'statusText': null
    }));
  }
  , loginUserSuccess: (state, data) => {
    console.log('loginUserSuccess', state, data);
    return state.merge(Map({
      'isAuthenticating': false,
      'isAuthenticated': true,
      //'token': payload.token,
      //'userName': jwtDecode(payload.token).userName,
      'user': new UserRecord(data.user),
      'statusText': 'You have been successfully logged in.'
    }));

  }
  //[LOGIN_USER_FAILURE]: (state, payload) => {
  //  return state.merge(Map({
  //    'isAuthenticating': false,
  //    'isAuthenticated': false,
  //    'token': null,
  //    'userName': null,
  //    'statusText': `Authentication Error: ${payload.status} ${payload.statusText}`
  //  }));
  //},
  //[LOGOUT_USER]: (state, payload) => {
  //  return state.merge(Map({
  //    'isAuthenticated': false,
  //    'token': null,
  //    'userName': null,
  //    'statusText': 'You have been successfully logged out.'
  //  }));
  //}
});