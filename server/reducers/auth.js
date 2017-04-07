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
    case LOGIN_USER_REQUEST:
      return login(state, action.username);
    case 'LOGOUT':
      return logout(state, action.userId);
    default:
      return state;
  }
}