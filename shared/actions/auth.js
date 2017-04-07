import {UserModel} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';
import {GameModel, GameModelClient} from '../models/game/GameModel';
import {List, Map} from 'immutable';
import {push} from 'react-router-redux';
import {roomExitSuccess} from './rooms';
import {addTimeout, cancelTimeout} from '~/shared/utils/reduxTimeout';

export const SOCKET_DISCONNECT_NOW = 'SOCKET_DISCONNECT_NOW';

export const socketConnect = (connectionId, socket) => ({
  type: 'socketConnect'
  , data: {connectionId, socket}
});

export const clientDisconnectSelf = (reason) => ({
  type: 'clientDisconnectSelf'
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
        !process.env.TEST ? 10000 : 1
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

export const loginUserSuccess = (user, redirect) => (dispatch, getState) => {
  const online = getState().get('users').toArray().map(u => u.toOthers());
  const rooms = getState().get('rooms');
  const games = getState().get('games');
  const room = rooms.find(room => ~room.users.indexOf(user.id)) || {id: null};
  const roomId = room.id;
  const game = games.find(game => game.roomId === roomId) || null;
  const clientGame = game !== null ? game.toClient(user.id) : null;
  dispatch({
    type: 'loginUserSuccess'
    , data: {user, redirect, online, rooms, roomId, game: clientGame}
    , meta: {userId: user.id}
  });
  dispatch({
    type: 'onlineUpdate'
    , data: {user: user.toOthers()}
    , meta: {users: true}
  })
};

export const loginUserFailure = (connectionId, msg) => {
  console.warn('loginUserFailure', msg);
  return {
    type: 'loginUserFailure'
    , data: msg
    , meta: {
      clients: [connectionId]
    }
  };
};

export const logoutUser = (userId) => (dispatch, getState) => {
  const user = getState().get('users').get(userId);
  const room = getState().get('rooms').find(room => ~room.get('users').indexOf(userId));
  if (room) {
    dispatch(roomExitSuccess(room.id, userId));
  }
  dispatch({
    type: 'logoutUser'
    , data: {userId}
    , meta: {users: true}
  });
};

export const authClientToServer = {
  loginUserRequest: ({login, password, redirect = '/'}, {user, connectionId}) => (dispatch, getState) => {
    const state = getState();
    if (user == void 0 || user.token == void 0) {
      if (!login) {
        dispatch(loginUserFailure(connectionId, 'Login is not supplied'));
        return;
      }
      const userExists = state.get('users').find(user => user.login === login);
      if (userExists) {
        console.warn('User already exists:', login);
        dispatch(loginUserFailure(connectionId, 'User already exists'));
        return;
      }
      const user = UserModel.new(login, connectionId);
      //console.log('new user record', user.id, user.login)
      dispatch(loginUserSuccess(user, redirect));
    } else {
      const userExists = state.get('users').find(user => user.token === user.token);
      if (!userExists) {
        dispatch(loginUserFailure(connectionId, 'Invalid token'));
        return;
      }
      const alreadyHasWorkingIdConnection = getState().get('connections').has(user.connectionId);
      if (alreadyHasWorkingIdConnection) {
        dispatch(loginUserFailure(connectionId, 'Duplicate tabs are not supported'));
        return;
      }
      const newUser = userExists.set('connectionId', connectionId);
      dispatch(cancelTimeout('logoutUser' + newUser.id));
      dispatch(loginUserSuccess(newUser, redirect));
    }
  }
};

export const authServerToClient = {
  loginUserSuccess: ({user, redirect = '/', online, rooms, roomId, game}) => (dispatch) => {
    //console.log('authServerToClient', data);
    user = new UserModel(user);
    if (typeof (window) != 'undefined') {
      window.sessionStorage.setItem('user', JSON.stringify(user));
    }
    dispatch({
      type: 'loginUserSuccess'
      , data: {
        user: user
        , online: List(online.map(u => new UserModel(u).toOthers()))
        , rooms: Map(rooms).map(r => RoomModel.fromJS(r))
        , roomId
        , game: GameModelClient.fromServer(game, user.id)
      }
    });
    dispatch(push(redirect));
  }
  , onlineUpdate: ({user}) => ({
    type: 'onlineUpdate'
    , data: {user: new UserModel(user).toOthers()}
  })
  , onlineLeave: ({userId}) => ({
    type: 'onlineLeave'
    , data: {userId}
  })
  , loginUserFailure: (message) => (dispatch) => {
    dispatch({
      type: 'loginUserFailure'
      , data: message
    });
    dispatch(push('/login'));
  }
  , logoutUser: (data) => ({
    type: 'logoutUser'
    , data: {userId: data.userId}
  })
};





























