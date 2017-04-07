import {createReducer} from '~/shared/utils';
//import {pushState} from 'redux-router';
//import jwtDecode from 'jwt-decode';
import {Map, fromJS} from 'immutable';
import {UserModel} from '../../shared/models/UserModel';

const initialState = fromJS({
  token: null,
  user: null, //JSON.parse(window.localStorage.getItem('user')),
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null
});

export const reducer = createReducer(initialState, {
  loginUserRequest: (state, payload) => {
    return state.merge(Map({
      'isAuthenticating': true,
      'statusText': null
    }));
  }
  , loginUserSuccess: (state, data) => {
    return state.merge(Map({
      'isAuthenticating': false,
      'isAuthenticated': true,
      //'token': payload.token,
      //'userName': jwtDecode(payload.token).userName,
      'user': data.user,
      'statusText': 'You have been successfully logged in.'
    }));
  }
});