import logger, {loggerOnline} from '~/shared/utils/logger';
import {Map} from 'immutable';
import {UserModel, RulesLoginPassword} from '../models/UserModel';
import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';
import jwt from 'jsonwebtoken';
import Validator from 'validatorjs';

import {ActionCheckError} from '../models/ActionCheckError';

import {to$, toUser$Client} from './generic';
import {chatInit} from './chat';
import {server$roomsInit, server$roomExit, findRoomByUser} from './rooms';

export const SOCKET_DISCONNECT_NOW = 'SOCKET_DISCONNECT_NOW';
export const USER_LOGOUT_TIMEOUT = 120e3;

import TimeService from '../../client/services/TimeService';

export const socketConnect = (connectionId, sendToClient, ip) => ({
  type: 'socketConnect'
  , data: {connectionId, sendToClient, ip}
});

export const socketConnectClient = (connectionId, timestamp) => ({
  type: 'socketConnectClient'
  , data: {connectionId, timestamp}
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
        USER_LOGOUT_TIMEOUT
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

export const loginUser = ({user, redirect, online}) => ({
  type: 'loginUser'
  , data: {user, redirect, online}
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
  loggerOnline.info(`User ${user.login} joined`);
  const online = getState().get('users').map(u => u.toOthers());
  const rooms = getState().get('rooms');
  dispatch(loginUser({user}));
  dispatch(server$roomsInit(user.id));
  dispatch(toUser$Client(user.id, loginUser({user: user.toClient(), redirect, online})));
  dispatch(toUser$Client(user.id, chatInit(getState().get('chat'))));
  dispatch(to$({clientOnly: true, users: true}, onlineUpdate(user.toOthers().toClient())));
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
  const room = findRoomByUser(getState, userId);
  if (room) dispatch(server$roomExit(room.id, userId));
  loggerOnline.info(`User ${userLogin} left`);
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
    USER_LOGOUT_TIMEOUT
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

      if (getState().get('connections').has(currentUser.connectionId)) {
        dispatch(Object.assign(loginUserFailure(`Duplicate tabs are not supported`)
          , {meta: {clientOnly: true, socketId: currentUser.connectionId}}));
      }

      dispatch(cancelTimeout('logoutUser' + currentUser.id));

      dispatch(server$loginUser(currentUser.set('connectionId', connectionId), redirect));
    })
};

export const authServerToClient = {
  loginUser: ({user, redirect = '/', online}) => (dispatch) => {
    user = UserModel.fromJS(user);
    dispatch(loginUser({
      user: user
      , online: Map(online).map(u => new UserModel(u).toOthers())
    }));
  }
  , loginUserFailure: ({error}) => (dispatch, getState) => {
    dispatch(loginUserFailure(error));
  }
  , onlineUpdate: ({user}) => onlineUpdate(UserModel.fromJS(user).toOthers())
  , logoutUser: ({userId}) => logoutUser(userId)
  , socketConnectClient: ({connectionId, timestamp}) => {
    TimeService.setOffset(timestamp);
    return socketConnectClient(connectionId);
  }
};