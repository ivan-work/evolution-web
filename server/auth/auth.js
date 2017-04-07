import {User} from '../../shared/models/User';

export const login = function (state, name) {
  const user = User(name);
  if (!state.has(user.id)) {
    return state.set(user.id, user);
  }
  return state;
};

export const logout = function (state, name) {
  const user = User(name);
  return state.remove(user.id);
};