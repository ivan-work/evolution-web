import logger from '~/shared/utils/logger';
import {RoomModel} from '../models/RoomModel';
import Validator from 'validatorjs';

import {ActionCheckError} from '../models/ActionCheckError';

/**
 * Check/Select
 * */

export const checkSelectRoom = (getState, roomId) => {
  const room = getState().getIn(['rooms', roomId]);
  if (!room) throw new ActionCheckError('checkRoomExists', `Room(%s) doesn't exist`, roomId);
  return room;
};

/**
 * Checks/Combined
 * */

export const checkComboRoomCanStart = (room, userId) => {
  if (!room) throw new ActionCheckError('checkRoomExists', `Room(%s) doesn't exist`, room);
  checkUserInRoom(room, userId);
  checkUserIsHost(room, userId);
  checkRoomMinSize(room);
  checkRoomMaxSize(room);
  checkRoomIsNotInGame(room);
};

/**
 * Checks/Simple
 * */

export const checkRoomMinSize = (room) => {
  if (room.users.size < (process.env.NODE_ENV === 'production' ? 2 : 1))
    throw new ActionCheckError('checkRoomMinSize', `Room(%s) doesn't have min players`, room.id);
};

export const checkRoomMaxSize = (room, adding) => {
  // Adding = true means we check with joining player. Adding = false means we check existing room for start.
  if (room.users.size + (adding ? 1 : 0) > room.settings.maxPlayers)
    throw new ActionCheckError('checkRoomMaxSize', `Room(%s) already has too much players`, room.id);
};

export const checkRoomIsNotInGame = (room) => {
  if (room.gameId !== null)
    throw new ActionCheckError('checkRoomIsValid', `Room(%s) is in game (%s)`, room.id, room.gameId);
};

export const checkUserInRoom = (room, userId) => {
  if (!~room.users.indexOf(userId))
    throw new ActionCheckError('checkUserInRoom', 'Room(%s) doesnt have User(%s)', room.id, userId);
};

export const checkUserNotInRoom = (room, userId) => {
  if (~room.users.indexOf(userId))
    throw new ActionCheckError('checkUserNotInRoom', 'Room(%s) has User(%s)', room.id, userId);
};

export const checkUserNotSpectatingRoom = (room, userId) => {
  if (~room.spectators.indexOf(userId))
    throw new ActionCheckError('checkUserNotSpectatingRoom', 'Room(%s) has User(%s)', room.id, userId);
};

export const checkUserIsHost = (room, userId) => {
  if (room.users.get(0) !== userId)
    throw new ActionCheckError('checkUserIsHost', 'Room(%s) have User(%s) as not host', room.id, userId);
};

export const checkValidate = (data, rules) => {
  const validation = new Validator(data, rules);
  if (validation.fails()) throw new ActionCheckError('roomEditSettingsRequest', 'validation failed: %s', JSON.stringify(validation.errors.all()));
};

export const checkUserNotBanned = (room, userId) => {
  if (~room.banlist.indexOf(userId))
    throw new ActionCheckError('checkUserNotBanned', `Room(%s) have User(%s) banned`, room.id, userId);
};

export const checkUserBanned = (room, userId) => {
  if (!~room.banlist.indexOf(userId))
    throw new ActionCheckError('checkUserBanned', `Room(%s) doesn't have User(%s) banned`, room.id, userId);
};