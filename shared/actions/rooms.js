import logger from '~/shared/utils/logger';
import {RoomModel} from '../models/RoomModel';
import {SettingsRules} from '../models/game/GameSettings';
import Validator from 'validatorjs';

import {server$gameLeave} from './game';

import {actionError} from './generic';
import {redirectTo} from '../utils';
import {selectRoom} from '../selectors';

export const roomCreateRequest = () => ({
  type: 'roomCreateRequest'
  , data: {}
  , meta: {server: true}
});
export const roomJoinRequest = (roomId) => ({
  type: 'roomJoinRequest'
  , data: {roomId}
  , meta: {server: true}
});
export const roomExitRequest = () => (dispatch, getState) => dispatch({
  type: 'roomExitRequest'
  , data: {roomId: getState().get('room')}
  , meta: {server: true}
});
export const roomCreateSuccess = (room) => ({
  type: 'roomCreateSuccess'
  , data: {room}
  , meta: {users: true}
});
export const roomJoinSuccess = (roomId, userId) => ({
  type: 'roomJoinSuccess'
  , data: {roomId, userId}
  , meta: {users: true}
});
export const roomJoinSuccessNotify = (roomId, userId) => ({
  type: 'roomJoinSuccessNotify'
  , data: {roomId, userId}
});
export const roomExitSuccess = (roomId, userId) => ({
  type: 'roomExitSuccess'
  , data: {roomId, userId}
  , meta: {users: true}
});
export const roomExitSuccessNotify = (roomId, userId) => ({
  type: 'roomExitSuccessNotify'
  , data: {roomId, userId}
});

export const server$roomExit = (roomId, userId) => (dispatch, getState) => {
  const room = selectRoom(getState, roomId);
  dispatch(roomExitSuccess(roomId, userId));
  if (room && room.gameId) {
    dispatch(server$gameLeave(room.gameId, userId));
  }
};

const server$roomJoinRequest = ({roomId}, {user: {id: userId}}) => (dispatch, getState) => {
  const room = getState().getIn(['rooms', roomId]);
  if (!room) {
    dispatch(actionError(userId, 'bad room')); // TODO add validation
    return;
  }
  const userAlreadyInRoom = room.users.some(uid => uid === userId);
  if (!userAlreadyInRoom) {
    const previousRoom = getState().get('rooms').find(room => {
      return room.users.some(uid => uid === userId);
    });
    if (previousRoom) {
      dispatch(roomExitSuccess(previousRoom.id, userId));
    }
    dispatch(roomJoinSuccess(roomId, userId));
  }
};

// Actions

export const roomEditSettingsRequest = (settings) => (dispatch, getState) => dispatch({
  type: 'roomEditSettingsRequest'
  , data: {roomId: getState().get('room'), settings}
  , meta: {server: true}
});

const roomEditSettings = (roomId, settings) => ({
  type: 'roomEditSettings'
  , data: {roomId, settings}
});

const server$roomEditSettings = (roomId, settings) => (dispatch, getState) => dispatch(
  Object.assign(roomEditSettings(roomId, settings)
    , {meta: {users: true}}));

export const roomKickRequest = (userId) => (dispatch, getState) => dispatch({
  type: 'roomKickRequest'
  , data: {roomId: getState().get('room'), userId}
  , meta: {server: true}
});

const roomKick = (userId) => ({
  type: 'roomKick'
  , data: {userId}
});

export const roomBanRequest = (userId) => (dispatch, getState) => dispatch({
  type: 'roomBanRequest'
  , data: {roomId: getState().get('room'), userId}
  , meta: {server: true}
});

const roomBan = (userId) => ({
  type: 'roomBan'
  , data: {userId}
});

export const roomsClientToServer = {
    roomCreateRequest: (data, {user}) => (dispatch, getState) => {
      const userId = user.id;
      const room = RoomModel.new();
      dispatch(roomCreateSuccess(room));
      dispatch(server$roomJoinRequest({roomId: room.id}, {user}));
    }
    , roomJoinRequest: server$roomJoinRequest
    , roomExitRequest: ({roomId}, {user}) => server$roomExit(roomId, user.id)
    , roomEditSettingsRequest: ({roomId, settings}, {user}) => (dispatch, getState) => {
      const userId = user.id;
      checkUserInRoom(getState, roomId, userId);
      checkUserIsHost(getState, roomId, userId);
      const validation = new Validator(settings, SettingsRules);
      if (validation.fails()) throw new ActionCheckError('roomEditSettingsRequest', 'validation failed: %s', validation);
      dispatch(server$roomEditSettings(roomId, settings));
    }
    , roomKickRequest: ({roomId, userId}, {user}) => (dispatch, getState) => {
      checkUserInRoom(getState, roomId, userId);
      checkUserIsHost(getState, roomId, userId);
    }
    , roomBanRequest: ({roomId, userId}, {user}) => (dispatch, getState) => {
    checkUserInRoom(getState, roomId, userId);
      checkUserIsHost(getState, roomId, userId);
    }
  }
  ;

export const roomsServerToClient = {
  roomCreateSuccess: ({room}) => roomCreateSuccess(RoomModel.fromJS(room))
  , roomJoinSuccess: ({roomId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(roomJoinSuccessNotify(roomId, userId));
    if (currentUserId === userId) {
      dispatch(roomJoinSuccess(roomId));
      dispatch(redirectTo(`/room/${roomId}`));
    }
  }
  , roomExitSuccess: ({roomId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(roomExitSuccessNotify(roomId, userId));
    if (currentUserId === userId) {
      dispatch(roomExitSuccess(roomId));
      dispatch(redirectTo(`/`));
    }
  }
  , roomEditSettings: ({roomId, settings}) => roomEditSettings(roomId, settings)
};

import {ActionCheckError} from '~/shared/models/ActionCheckError';

const checkUserInRoom = (getState, roomId, userId) => {
  if (!getState().getIn(['rooms', roomId, 'users']).some(roomUserId => roomUserId === userId))
    throw new ActionCheckError('checkUserInRoom', 'Room(%s) doesnt have User(%s)', roomId, userId);
};

const checkUserIsHost = (getState, roomId, userId) => {
  if (getState().getIn(['rooms', roomId, 'users', 0]) !== userId)
    throw new ActionCheckError('checkUserIsHost', 'Room(%s) have User(%s) as not host', roomId, userId);
};