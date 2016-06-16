import {push} from 'react-router-redux';
import {UserRecord} from '../models/User';

export const socketConnect = (connectionId, socket) => ({
  type: 'socketConnect'
  , data: {connectionId, socket}
});

export const socketDisconnect = (connectionId) => (dispatch, getState) => {
  const usersState = getState().get('users');
  let user = usersState.find((user) => user.connectionId == connectionId);
  if (!!user) {
    dispatch(logoutUser(user.id))
  }
  dispatch({
    type: 'socketDisconnect'
    , data: {connectionId}
  })
};

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

export const logoutUser = (userId) => ({
  type: 'logoutUser'
  , data: userId
});

let userIds = 0;

export const authClientToServer = {
  loginUserRequest: (connectionId, data) => (dispatch, getState) => {
    console.log('loginUserRequest', data);
    console.log('loginUserRequest', data.login);
    const login = data.login;
    const state = getState().get('users');
    const userExists = state.find(user => user.login === login);
    if (!userExists) {
      const user = new UserRecord({
        id: userIds++
        , login: login
        , connectionId: connectionId
      });
      dispatch(loginUserSuccess(connectionId, user));
    } else {
      dispatch(loginUserFailure(connectionId, 'User already exists'));
    }
  }
};

export const authServerToClient = {
  loginUserSuccess: (user) => (dispatch) => {
    console.log(authServerToClient, user);
    dispatch({
      type: 'loginUserSuccess'
      , data: user
    });
    dispatch(push('/lobbies'));
  }
};





























