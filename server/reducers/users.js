import {Map} from 'immutable';
import {User} from '~/shared/models/User';
import {LOGIN_USER_REQUEST, LOGIN_USER_SUCCESS, LOGIN_USER_FAILURE, LOGOUT_USER} from '~/shared/constants';

export const login = function (state, user) {
  return state.set(user.id, user);
};

export const logout = function (state, userId) {
  return state.remove(userId);
};

export function reducer(state = Map(), action) {
  switch (action.type) {
    case 'loginUserSuccess':
      return login(state, action.data);
    case 'logoutUser':
      return logout(state, action.data);
    default:
      return state;
  }
}