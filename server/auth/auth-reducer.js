import {login, logout} from './auth';

export default function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return login(state, action.username, action.password);
    case 'LOGOUT':
      return logout(state, action.userId);
    default:
      return state;
  }
}