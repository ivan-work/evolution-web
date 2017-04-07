import {createReducer} from '~/shared/utils';
//import {pushState} from 'redux-router';
//import jwtDecode from 'jwt-decode';
import {Map, fromJS} from 'immutable';
import {UserModel} from '../../shared/models/UserModel';

const getInitialUser = () => {
  let user = window.sessionStorage.getItem('user');
  if (user != null) {
    user = JSON.parse(user);
    if (typeof user === 'object') {
      user = new UserModel(user);
      if (user.token !== null) {
        return user;
      }
    }
  }
  return null;
};

console.log('Storage User:', getInitialUser());
export const reducer = createReducer(getInitialUser(), {
  loginUserSuccess: (state, data) => data.user
  , loginUserFailure: (state, data) => null
});