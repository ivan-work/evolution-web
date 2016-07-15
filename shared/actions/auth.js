import {UserModel} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';
import {List, Map} from 'immutable';
import {push} from 'react-router-redux';

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
  const room = getState().get('rooms').find(room => ~room.get('users').indexOf(userId));
  //if (room) {
  //  dispatch()
  //}
  //
  //dispatch({
  //  type: 'logoutUser'
  //  , data: {userId}
  //  , meta: {clients: true}
  //});
  dispatch({
    type: 'logoutUser'
    , data: {userId}
    , meta: {clients: true}
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
    const login = data.login;
    const state = getState();
    const userExists = state.get('users').find(user => user.login == login);
    if (!userExists) {
      //console.log(connectionId, state.get('connections').toJS())
      if (state.get('connections').has(meta.connectionId)) {
        const user = UserModel.new(login, meta.connectionId);
        //console.log('new user record', user.id, user.login)
        dispatch(onlineJoin(user));
        dispatch(loginUserSuccess(user, data.redirect));
        dispatch(loginState(user));
      } else {
        dispatch(loginUserFailure(meta.connectionId, 'Connection is missing'));
      }
    } else {
      console.warn('User already exists:', login);
      dispatch(loginUserFailure(meta.connectionId, 'User already exists'));
    }
  }
};

export const authServerToClient = {
  loginUserSuccess: (data) => (dispatch) => {
    //console.log('authServerToClient', data);
    window.localStorage.setItem('user', JSON.stringify(data.user));
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





























