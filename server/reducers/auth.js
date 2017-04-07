import {Map} from 'immutable';
import {User} from '~/shared/models/User';
import {loginUserSuccess} from '~/shared/actions';
import {LOGIN_USER_REQUEST, LOGIN_USER_SUCCESS, LOGIN_USER_FAILURE, LOGOUT_USER} from '~/shared/constants';

export const login = function (state, name) {
  const user = User(name);
  if (!state.find(user => user.name === name)) {
    return [state.set(user.id, user), user];
  }
  return [state, null];
};

export const logout = function (state, userId) {
  return state.remove(userId);
};

export function reducer(state = Map(), action) {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
      store.dispatch(loginUserSuccess("test"));
      return state;
      //return login(state, action.username);
    case 'LOGOUT':
      return logout(state, action.userId);
    default:
      return state;
  }
}