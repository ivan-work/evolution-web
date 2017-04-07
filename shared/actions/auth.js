import {push} from 'react-router-redux';
import {UserRecord} from '../models/User';

export const socketConnect = (connectionId, socket) => ({
  type: 'socketConnect'
  , data: {connectionId, socket}
});

export const socketDisconnect = (connectionId) => (dispatch, getState) => {
  const usersState = getState().get('users');
  let user = usersState.find((user) => user.connectionId == connectionId);
  console.log('socketDisconnect', !!user);
  if (!!user) {
    dispatch(logoutUser(user.id))
  }
  dispatch({
    type: 'socketDisconnect'
    , data: {connectionId}
  })
};

export const loginUserRequest = (redirect, login, password) => {
  return {
    type: 'loginUserRequest'
    , data: {redirect, login, password}
    , meta: {
      server: true
    }
  }
};

export const loginUserSuccess = (connectionId, user, redirect) => ({
  type: 'loginUserSuccess'
  , data: {user, redirect}
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
    const login = data.login;
    const state = getState().get('users');
    const userExists = state.find(user => user.login === login);
    if (!userExists) {
      const user = new UserRecord({
        id: userIds++
        , login: login
        , connectionId: connectionId
      });
      dispatch(loginUserSuccess(connectionId, user, data.redirect));
    } else {
      dispatch(loginUserFailure(connectionId, 'User already exists'));
    }
  }
};

export const authServerToClient = {
  loginUserSuccess: (data) => (dispatch) => {
    //console.log('authServerToClient', data);
    window.localStorage.setItem('user', JSON.stringify(data.user));
    dispatch({
      type: 'loginUserSuccess'
      , data: {
        user: data.user
      }
    });
    dispatch(push(data.redirect || '/'));
  }
};





























