import logger, {fileLogger} from '~/shared/utils/logger';
import {Map} from 'immutable';
import {UserModel, RulesLoginPassword} from '../models/UserModel';
import {GameModelClient} from '../models/game/GameModel';
import {redirectTo} from '../utils';
import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';
import jwt from 'jsonwebtoken';
import Validator from 'validatorjs';

import {ActionCheckError} from '../models/ActionCheckError';

import {toUser$Client} from './generic';
import {chatInit} from './chat';
import {server$roomsInit, server$roomExit} from './rooms';

export const SOCKET_DISCONNECT_NOW = 'SOCKET_DISCONNECT_NOW';
export const TIMEOUT = 120 * 1000;

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
        (process.env.TEST ? 1 : TIMEOUT)
        , 'logoutUser' + user.id
        , server$logoutUser(user.id)));
    } else {
      dispatch(server$logoutUser(user.id));
    }
  }
};

/***
 * Login
 */

export const loginUserTokenRequest = (redirect, token) => ({
  type: 'loginUserTokenRequest'
  , data: {redirect, token}
  , meta: {server: true}
});

export const loginUserFormRequest = (redirect, login, password) => ({
  type: 'loginUserFormRequest'
  , data: {redirect, login, password}
  , meta: {server: true}
});

export const loginUser = ({user, redirect, online, rooms, roomId, game}) => ({
  type: 'loginUser'
  , data: {user, redirect, online, rooms, roomId, game}
});

export const loginUserFailure = (error) => ({
  type: 'loginUserFailure'
  , data: {error}
});

export const onlineUpdate = (user) => ({
  type: 'onlineUpdate'
  , data: {user}
});

export const server$loginUser = (user, redirect) => (dispatch, getState) => {
  if (!user.id) throw new Error('User has no ID');
  fileLogger.info(`User ${user.login} joined`);
  const online = getState().get('users').map(u => u.toOthers());
  const rooms = getState().get('rooms');
  const games = getState().get('games');
  const room = rooms.find(room => ~room.users.indexOf(user.id));
  const roomId = !!room && room.id || null;
  const game = !!roomId && games.find(game => game.roomId === roomId) || null;
  const clientGame = !!game && game.toOthers(user.id).toClient() || null;
  dispatch(loginUser({user}));

  dispatch(server$roomsInit(user.id));
  dispatch(toUser$Client(user.id, chatInit(getState().get('chat'))));

  dispatch(toUser$Client(user.id, loginUser({user: user.toClient(), redirect, online, game: clientGame})));
  dispatch(Object.assign(onlineUpdate(user.toOthers().toClient()),
    {meta: {clientOnly: true, users: true}}));
};

/***
 * Logout
 */

const logoutUser = (userId) => ({
  type: 'logoutUser'
  , data: {userId}
});

export const server$logoutUser = (userId) => (dispatch, getState) => {
  logger.debug('server$logoutUser', userId);
  const userLogin = getState().getIn(['users', userId, 'login']);
  const room = getState().get('rooms').find(room => ~room.get('users').indexOf(userId));
  if (room) {
    dispatch(server$roomExit(room.id, userId));
  }
  fileLogger.info(`User ${userLogin} left`);
  dispatch(Object.assign(logoutUser(userId)
    , {meta: {users: true}}));
};

/***
 * Register
 */

export const server$injectUser = (id, login) => (dispatch) => {
  // console.log('dbUser', id, login)
  const user = new UserModel({id, login}).sign();
  dispatch(loginUser({user}));
  dispatch(addTimeout(
    (process.env.TEST ? 1 : TIMEOUT)
    , 'logoutUser' + user.id
    , server$logoutUser(user.id)));
  return user;
};

/***
 * Misc
 */

const customErrorReport = (customErrorAction, fn) => (dispatch, getState) => {
  const result = dispatch(fn);
  if (result instanceof Error) {
    dispatch(customErrorAction(result));
  }
  return result;
};

export const authClientToServer = {
  loginUserFormRequest: ({redirect = '/', login = void 0, password = void 0}, {connectionId}) =>
    customErrorReport((dispatch) => Object.assign(loginUserFailure(), {meta: {socketId: connectionId}}), (dispatch, getState) => {
      const validation = new Validator({login, password}, RulesLoginPassword);
      if (validation.fails()) throw new ActionCheckError('loginUserFormRequest', 'validation failed: %s', JSON.stringify(validation.errors.all()));

      if (getState().get('users').find(user => user.login === login))
        throw new ActionCheckError('loginUserFormRequest', 'User already exists');

      const user = UserModel.new(login, connectionId);

      dispatch(server$loginUser(user, redirect));
    })
  , loginUserTokenRequest: ({redirect = '/', token}, {connectionId}) =>
    customErrorReport((dispatch) => Object.assign(loginUserFailure(), {meta: {socketId: connectionId}}), (dispatch, getState) => {
      logger.silly('server$loginExistingUser', connectionId);
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        throw new ActionCheckError('server$loginExistingUser', `Token not valid (%s)`, token);
      }
      const currentUser = getState().get('users').find(u => u.token === token);
      if (!currentUser) {
        throw new ActionCheckError('server$loginExistingUser', `User not exists (%s)`, token);
      }

      if (getState().get('connections').has(currentUser.connectionId))
        throw new ActionCheckError('server$loginExistingUser', `Duplicate tabs are not supported`);

      dispatch(cancelTimeout('logoutUser' + currentUser.id));

      dispatch(server$loginUser(currentUser.set('connectionId', connectionId), redirect));
    })
};

export const authServerToClient = {
  loginUser: ({user, redirect = '/', online, rooms, roomId, game}) => (dispatch) => {
    user = UserModel.fromJS(user);
    dispatch(loginUser({
      user: user
      , online: Map(online).map(u => new UserModel(u).toOthers())
      , game: GameModelClient.fromServer(game, user.id)
    }));
    dispatch(redirectTo(redirect || '/'));
  }
  , loginUserFailure: ({error}) => (dispatch, getState) => {
    dispatch(loginUserFailure(error));
    redirectToLogin(getState, (location) => dispatch(redirectTo(location)));
  }
  , onlineUpdate: ({user}) => onlineUpdate(UserModel.fromJS(user).toOthers())
  , logoutUser: ({userId}) => logoutUser(userId)
  , socketConnect: ({connectionId}) => socketConnect(connectionId)
};

export const redirectToLogin = (getState, redirectTo) => {
  let previousLocation = getState().getIn(['routing', 'locationBeforeTransitions', 'pathname'], '/');
  if (previousLocation !== '/login')
    redirectTo('/login?redirect=' + previousLocation);
};