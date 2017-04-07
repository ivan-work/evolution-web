import {push} from 'react-router-redux';
import {User} from '../models/User';

export const socketConnect = (connectionId, socket) => ({
  type: 'socketConnect'
  , data: {connectionId, socket}
});

export const socketDisconnect = (connectionId) => ({
  type: 'socketDisconnect'
  , data: {connectionId}
});

export const loginUserRequest = (redirect = "/", login, password) => {
  return {
    type: 'loginUserRequest'
    , data: {login: login}
    , meta: {
      server: true
    }
  }
};

export const loginUserSuccess = (connectionId, user) => ({
  type: 'loginUserSuccess'
  , data: user
  , meta: {
    connectionId: connectionId
  }
});

export const loginUserFailure = (connectionId, msg) => ({
  type: 'loginUserFailure'
  , data: msg
  , meta: {
    connectionId: connectionId
  }
});

export const authClientToServer = {
  loginUserRequest: (connectionId, data) => (dispatch, getState) => {
    const username = data.login;
    const state = getState().get('users');
    const userExists = state.find(user => user.name === username);
    if (!userExists) {
      const user = User(connectionId, data.username);
      return dispatch(loginUserSuccess(connectionId, user));
    } else {
      return dispatch(loginUserFailure(connectionId, 'User already exists'));
    }
  }
};

export const authServerToClient = {
  loginUserSuccess: (data) => {
    console.log('login user success')
    push('/lobbies');
    return {
      type: 'loginUserSuccess'
      , data: data
    }
  }
};





























