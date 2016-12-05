import logger from '~/shared/utils/logger';
import {RoomModel} from '../models/RoomModel';
import Validator from 'validatorjs';

import {ActionCheckError} from '../models/ActionCheckError';

export const checkRoomExists = (getState, roomId) => {
  if (!getState().getIn(['rooms', roomId]))
    throw new ActionCheckError('checkRoomExists', `Room(%s) doesnt exists`, roomId);
};

export const checkRoomSize = (getState, roomId) => {
  const room = getState().getIn(['rooms', roomId]);
  if (room.settings.maxPlayers <= room.users.size)
    throw new ActionCheckError('checkRoomSize', `Room(%s) already have max`, roomId);
};

export const checkUserInRoom = (getState, roomId, userId) => {
  if (!getState().getIn(['rooms', roomId, 'users']).some(roomUserId => roomUserId === userId))
    throw new ActionCheckError('checkUserInRoom', 'Room(%s) doesnt have User(%s)', roomId, userId);
};

export const checkUserNotInRoom = (getState, roomId, userId) => {
  if (getState().getIn(['rooms', roomId, 'users']).some(roomUserId => roomUserId === userId))
    throw new ActionCheckError('checkUserNotInRoom', 'Room(%s) has User(%s)', roomId, userId);
};

export const checkUserIsHost = (getState, roomId, userId) => {
  if (getState().getIn(['rooms', roomId, 'users', 0]) !== userId)
    throw new ActionCheckError('checkUserIsHost', 'Room(%s) have User(%s) as not host', roomId, userId);
};

export const checkValidate = (getState, data, rules) => {
  const validation = new Validator(data, rules);
  if (validation.fails()) throw new ActionCheckError('roomEditSettingsRequest', 'validation failed: %s', validation);
};

export const checkUserNotBanned = (getState, roomId, userId) => {
  if (~getState().getIn(['rooms', roomId, 'banlist']).indexOf(userId))
    throw new ActionCheckError('checkUserNotBanned', `Room(%s) have User(%s) banned`, roomId, userId);
};

export const checkUserBanned = (getState, roomId, userId) => {
  if (!~getState().getIn(['rooms', roomId, 'banlist']).indexOf(userId))
    throw new ActionCheckError('checkUserBanned', `Room(%s) don't have User(%s) banned`, roomId, userId);
};