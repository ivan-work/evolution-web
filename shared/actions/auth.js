import logger from '~/shared/utils/logger';
import {UserModel, RulesLoginPassword} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';
import {GameModel, GameModelClient} from '../models/game/GameModel';
import {List, Map} from 'immutable';
import {redirectTo} from '../utils';
import {server$roomExit} from './rooms';
import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';
import jwt from 'jsonwebtoken';
import Validator from 'validatorjs';

import {

} from './auth.checks';

import {ActionCheckError} from '../models/ActionCheckError';

export const SOCKET_DISCONNECT_NOW = 'SOCKET_DISCONNECT_NOW';
export const TIMEOUT = 2 * 60 * 1000;

export const socketConnect = (connectionId, sendToClient) => ({
  type: 'socketConnect'
  , data: {connectionId, sendToClient}
});

export const socketDisconnect = (connectionId, reason) => ({
  type: 'socketDisconnect'
  , data: {connectionId, reason}
});

export const server$socketDisconnect = (connectionId, reason) => (dispatch, getState) => {
  dispatch(socketDisconnect(connectionId, reason));
  const user = getState().get('users').find((user) => user.connectionId == connectionId);
  if (!!user) {
    if (reason !== SOCKET_DISCONNECT_NOW) {
      dispatch(addTimeout(
        TIMEOUT
        , 'logoutUser' + user.id
        , server$logoutUser(user.id)));
    } else {
      dispatch(server$logoutUser(user.id));
    }
  }
};

export const loginUserRequest = (redirect, login, password) => ({
  type: 'loginUserRequest'
  , data: {redirect, login, password}
  , meta: {server: true}
});

export const loginUser = ({user, redirect, online, rooms, roomId, game}) => ({
  type: 'loginUser'
  , data: {user, redirect, online, rooms, roomId, game}
});

export const onlineUpdate = (user) => ({
  type: 'onlineUpdate'
  , data: {user}
});

export const server$loginUser = (user, redirect) => (dispatch, getState) => {
  const online = getState().get('users').map(u => u.toOthers());
  const rooms = getState().get('rooms');
  const games = getState().get('games');
  const room = rooms.find(room => ~room.users.indexOf(user.id)) || {id: null};
  const roomId = room.id;
  const game = games.find(game => game.roomId === roomId) || null;
  const clientGame = game !== null ? game.toOthers(user.id).toClient() : null;
  dispatch(Object.assign(loginUser({user: user.toClient(), redirect, online, rooms, roomId, game: clientGame}),
    {meta: {socketId: user.connectionId}}));
  dispatch(Object.assign(onlineUpdate(user.toOthers().toClient()),
    {meta: {users: true}}));
};

const logoutUser = (userId) => ({
  type: 'logoutUser'
  , data: {userId}
})

export const server$logoutUser = (userId) => (dispatch, getState) => {
  logger.debug('server$logoutUser', userId);
  const room = getState().get('rooms').find(room => ~room.get('users').indexOf(userId));
  if (room) {
    dispatch(server$roomExit(room.id, userId));
  }
  dispatch(Object.assign(logoutUser(userId)
    , {meta: {users: true}}));
};


const server$loginExistingUser = (requestUser, connectionId) => (dispatch, getState) => {
  logger.silly('server$loginExistingUser', requestUser.id);
  try {
    jwt.verify(requestUser.token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ActionCheckError('server$loginExistingUser', `Token not valid (%s) (%s)`, requestUser.id, requestUser.token);
  }
  const currentUser = getState().get('users').find(u => u.token === requestUser.token);
  if (!currentUser)
    throw new ActionCheckError('server$loginExistingUser', `User not exists (%s) (%s)`, requestUser.id, requestUser.token);

  if (getState().get('connections').has(currentUser.connectionId))
    throw new ActionCheckError('server$loginExistingUser', `Duplicate tabs are not supported`);

  dispatch(cancelTimeout('logoutUser' + currentUser.id));
  return currentUser.set('connectionId', connectionId);
};

export const authClientToServer = {
  loginUserRequest: ({redirect = '/', login = void 0, password = void 0}, {user, connectionId}) => (dispatch, getState) => {
    let newUser;
    if (user && user.token) {
      newUser = dispatch(server$loginExistingUser(user, connectionId));
      if (!(newUser instanceof UserModel)) logger.debug('server$loginExistingUser failed', newUser);
    }
    if (!(newUser instanceof UserModel)) {
      const validation = new Validator({login, password}, RulesLoginPassword);
      if (validation.fails()) throw new ActionCheckError('loginUserRequest', 'validation failed: %s', validation);

      if (getState().get('users').find(user => user.login === login))
        throw new ActionCheckError('loginUserRequest', 'User already exists');

      newUser = UserModel.new(login, connectionId);
    }
    dispatch(server$loginUser(newUser, redirect));
  }
};

export const authServerToClient = {
  loginUser: ({user, redirect = '/', online, rooms, roomId, game}) => (dispatch) => {
    user = UserModel.fromJS(user);
    if (window && window.sessionStorage) window.sessionStorage.setItem('user', JSON.stringify(user));
    dispatch(loginUser({
      user: user
      , online: Map(online).map(u => new UserModel(u).toOthers())
      , rooms: Map(rooms).map(r => RoomModel.fromJS(r))
      , roomId
      , game: GameModelClient.fromServer(game, user.id)
    }));
    dispatch(redirectTo(redirect));
  }
  , onlineUpdate: ({user}) => onlineUpdate(UserModel.fromJS(user).toOthers())
  , logoutUser: ({userId}) => logoutUser(userId)
};