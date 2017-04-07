import {UserModel} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';
import {List, Map} from 'immutable';
import {push} from 'react-router-redux';
import {roomsClientToServer} from './rooms';
import {addTimeout, cancelTimeout} from '~/shared/utils/reduxTimeout';

export const SOCKET_DISCONNECT_NOW = 'SOCKET_DISCONNECT_NOW';

export const socketConnect = (connectionId, socket) => ({
  type: 'socketConnect'
  , data: {connectionId, socket}
});

export const clientSelfDisconnect = (reason) => ({
  type: 'clientSelfDisconnect'
  , data: {reason}
});

export const socketDisconnect = (connectionId, reason) => (dispatch, getState) => {
  const usersState = getState().get('users');
  let user = usersState.find((user) => user.connectionId == connectionId);
  dispatch({
    type: 'socketDisconnect'
    , data: {connectionId}
  });
  if (!!user) {
    if (reason !== SOCKET_DISCONNECT_NOW) {
      dispatch(addTimeout(
        !process.env.TEST ? 10000 : 10
        , 'logoutUser' + user.id
        , logoutUser(user.id)));
    } else {
      dispatch(logoutUser(user.id));
    }
  }
};

export const loginUserRequest = (redirect, login, password) => {
  return {
    type: 'loginUserRequest'
    , data: {redirect, login, password}
    , meta: {server: true}
  }
};

export const loginUserSuccess = (user, redirect) => ({
  type: 'loginUserSuccess'
  , data: {user, redirect}
  , meta: {userId: user.id}
});

export const loginUserFailure = (connectionId, msg) => ({
  type: 'loginUserFailure'
  , data: msg
  , meta: {
    clients: [connectionId]
  }
});

export const logoutUser = (userId) => (dispatch, getState) => {
  const user = getState().get('users').get(userId);
  const room = getState().get('rooms').find(room => ~room.get('users').indexOf(userId));
  if (room) {
    roomsClientToServer.roomExitRequest({roomId: room.id}, {user})(dispatch, getState);
  }
  dispatch({
    type: 'logoutUser'
    , data: {userId}
    , meta: {users: true}
  });
};

export const loginState = (user) => (dispatch, getState) => {
  const online = getState().get('users').toArray().map(u => u.toOthers());
  const rooms = getState().get('rooms').toJS();
  dispatch({
    type: 'loginState'
    , data: {online, rooms}
    , meta: {userId: user.id}
  });
};

export const onlineJoin = (user) => ({
  type: 'onlineJoin'
  , data: {user: user.toOthers()}
  , meta: {users: true}
});

export const authClientToServer = {
  loginUserRequest: (data, meta) => (dispatch, getState) => {
    const state = getState();
    const login = data.login;

    if (meta.user == void 0 || meta.user.token == void 0) {
      if (!login) {
        dispatch(loginUserFailure(meta.connectionId, 'Login is not supplied'));
        return;
      }
      const userExists = state.get('users').find(user => user.login === login);
      if (userExists) {
        console.warn('User already exists:', login);
        dispatch(loginUserFailure(meta.connectionId, 'User already exists'));
        return;
      }
      const user = UserModel.new(login, meta.connectionId);
      //console.log('new user record', user.id, user.login)
      dispatch(onlineJoin(user));
      dispatch(loginUserSuccess(user, data.redirect));
      dispatch(loginState(user));
    } else {
      const userExists = state.get('users').find(user => user.token === meta.user.token);
      if (!userExists) {
        dispatch(loginUserFailure(meta.connectionId, 'Relogin failed.'));
        return;
      }
      const alreadyHasWorkingIdConnection = getState().get('connections').has(meta.user.connectionId);
      if (alreadyHasWorkingIdConnection) {
        dispatch(loginUserFailure(meta.connectionId, 'Duplicate tabs are not supported'));
        return;
      }
      const user = userExists.set('connectionId', meta.connectionId);
      dispatch(cancelTimeout('logoutUser' + user.id));
      dispatch(loginUserSuccess(user, data.redirect));
      dispatch(loginState(user));
    }
  }
};

export const authServerToClient = {
  loginUserSuccess: (data) => (dispatch) => {
    //console.log('authServerToClient', data);
    if (typeof (window) != 'undefined') {
      window.sessionStorage.setItem('user', JSON.stringify(data.user));
    }
    dispatch(loginUserSuccess(new UserModel(data.user)));
    dispatch(push(data.redirect || '/'));
  }
  , loginUserFailure: (message) => ({
    type: 'loginUserFailure'
    , data: message
  })
  , logoutUser: (data) => ({
    type: 'logoutUser'
    , data: {userId: data.userId}
  })
  , loginState: (data) => ({
    type: 'loginState'
    , data: {
      online: List(data.online.map(u => new UserModel(u).toOthers()))
      , rooms: Map(data.rooms).map(r => RoomModel.fromJS(r))
    }
  })
  , onlineJoin: (data) => ({
    type: 'onlineJoin'
    , data: {user: new UserModel(data.user).toOthers()}
  })
};





























