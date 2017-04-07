import {Map} from 'immutable';
import {User} from '~/shared/models/User';

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
    case 'LOGIN':
      return login(state, action.username);
    case 'LOGOUT':
      return logout(state, action.userId);
    default:
      return state;
  }
}