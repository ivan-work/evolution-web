import {push} from 'react-router-redux';
import {List} from 'immutable';
import {UserModel} from '../models/UserModel';
import uuid from 'node-uuid';
import jwt from 'jsonwebtoken';

export const socketConnect = (connectionId, socket) => ({
  type: 'socketConnect'
  , data: {connectionId, socket}
});

export const socketDisconnect = (connectionId) => (dispatch, getState) => {
  const usersState = getState().get('users');
  let user = usersState.find((user) => user.connectionId == connectionId);
  dispatch({
    type: 'socketDisconnect'
    , data: {connectionId}
  });
  if (!!user) {
    dispatch(logoutUser(user.id))
  }
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
    clients: [connectionId]
  }
});

export const loginUserFailure = (connectionId, msg) => ({
  type: 'loginUserFailure'
  , data: msg
  , meta: {
    clients: [connectionId]
  }
});

export const logoutUser = (userId) => ({
  type: 'logoutUser'
  , data: userId
  , meta: {clients: true}
});

export const onlineSet = (connectionId) => (dispatch, getState) => {
  const users = getState().get('users').toArray().map(u => u.toOthers());
  dispatch({
    type: 'onlineSet'
    , data: {users}
    , meta: {
      clients: [connectionId]
    }
  });
};

export const onlineJoin = (user) => ({
  type: 'onlineJoin'
  , data: {user}
  , meta: {clients: true}
});

export const authClientToServer = {
  loginUserRequest: (meta, data) => (dispatch, getState) => {
    const login = data.login;
    const state = getState();
    const userExists = state.get('users').find(user => user.login == login);
    if (!userExists) {
      //console.log(connectionId, state.get('connections').toJS())
      if (state.get('connections').has(meta.connectionId)) {
        //console.log('new user record', userIds, login)
        const user = UserModel.new(login, meta.connectionId);
        dispatch(onlineJoin(user.toOthers()));
        dispatch(loginUserSuccess(meta.connectionId, user, data.redirect));
        dispatch(onlineSet(meta.connectionId));
      } else {
        dispatch(loginUserFailure(meta.connectionId, 'Connection is missing'));
      }
    } else {
      console.log('User already exists:', login);
      dispatch(loginUserFailure(meta.connectionId, 'User already exists'));
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
  , loginUserFailure: (message) => ({
    type: 'loginUserFailure'
    , data: message
  })
  , logoutUser: (id) => ({
    type: 'logoutUser'
    , data: id
  })
  , onlineSet: (data) => ({
    type: 'onlineSet'
    , data: {users: List(data.users.map(u => new UserModel(u)))}
  })
  , onlineJoin: (data) => ({
    type: 'onlineJoin'
    , data: {user: new UserModel(data.user)}
  })
};





























