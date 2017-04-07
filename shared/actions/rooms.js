import logger from '~/shared/utils/logger';
import {RoomModel} from '../models/RoomModel';
import {SettingsRules} from '../models/game/GameSettings';

import {server$gameLeave} from './game';

import {redirectTo} from '../utils';
import {selectRoom} from '../selectors';

const selectClientRoomId = (getState) => getState().get('room');

import {
  checkSelectRoom
  , checkComboRoomCanStart
  , checkRoomMaxSize
  , checkRoomIsNotInGame
  , checkUserInRoom
  , checkUserNotInRoom
  , checkUserIsHost
  , checkValidate
  , checkUserBanned
  , checkUserNotBanned
} from './rooms.checks';

// Create

export const roomCreateRequest = () => ({
  type: 'roomCreateRequest'
  , data: {}
  , meta: {server: true}
});

const roomCreate = (room) => ({
  type: 'roomCreate'
  , data: {room}
});

export const server$roomCreate = (room) => (dispatch, getState) => dispatch(Object.assign(roomCreate(room)
  , {meta: {users: true}}));

// Join

export const roomJoinRequest = (roomId) => (dispatch, getState) => {
  (getState().get('room') === roomId
    ? dispatch(redirectTo(`/room/${roomId}`))
    : dispatch({
    type: 'roomJoinRequest'
    , data: {roomId}
    , meta: {server: true}
  }));
};

const roomJoin = (roomId, userId) => ({
  type: 'roomJoin'
  , data: {roomId, userId}
});

const roomJoinNotify = (roomId, userId) => ({
  type: 'roomJoinNotify'
  , data: {roomId, userId}
});

export const server$roomJoin = (roomId, userId) => (dispatch, getState) => {
  const room = checkSelectRoom(getState, roomId);
  checkUserNotInRoom(room, userId);
  checkRoomMaxSize(room, true);
  const previousRoom = getState().get('rooms').find(room => room.users.some(uid => uid === userId));
  if (previousRoom) {
    dispatch(server$roomExit(previousRoom.id, userId));
  }
  dispatch(Object.assign(roomJoin(roomId, userId)
    , {meta: {users: true}}));
};

// Exit

export const roomExitRequest = (roomId) => (dispatch, getState) => dispatch({
  type: 'roomExitRequest'
  , data: {roomId: selectClientRoomId(getState)}
  , meta: {server: true}
});

const roomExit = (roomId, userId) => ({
  type: 'roomExit'
  , data: {roomId, userId}
});

const roomExitNotify = (roomId, userId) => ({
  type: 'roomExitNotify'
  , data: {roomId, userId}
});

export const server$roomExit = (roomId, userId) => (dispatch, getState) => {
  //logger.debug('server$roomExit:', roomId, userId);
  const room = selectRoom(getState, roomId);
  dispatch(Object.assign(roomExit(roomId, userId), {meta: {users: true}}));
  if (room && room.gameId) {
    dispatch(server$gameLeave(room.gameId, userId));
  }
  if (selectRoom(getState, roomId).users.size === 0) {
    dispatch(server$roomDestroy(roomId));
  }
};

// Destroy

export const roomDestroy = (roomId) => ({
  type: 'roomDestroy'
  , data: {roomId}
});

export const server$roomDestroy = (roomId) => (dispatch, getState) =>
  dispatch(Object.assign(roomDestroy(roomId)
    , {meta: {users: true}}));

// Settings

export const roomEditSettingsRequest = (settings) => (dispatch, getState) => dispatch({
  type: 'roomEditSettingsRequest'
  , data: {roomId: selectClientRoomId(getState), settings}
  , meta: {server: true}
});

const roomEditSettings = (roomId, settings) => ({
  type: 'roomEditSettings'
  , data: {roomId, settings}
});

const server$roomEditSettings = (roomId, settings) => (dispatch, getState) => {
  dispatch(Object.assign(roomEditSettings(roomId, settings)
    , {meta: {users: true}}));
  while (selectRoom(getState, roomId).settings.maxPlayers < selectRoom(getState, roomId).users.size) {
    dispatch(server$roomKick(roomId, selectRoom(getState, roomId).users.last()))
  }
};

// Kick

export const roomKickRequest = (userId) => (dispatch, getState) => dispatch({
  type: 'roomKickRequest'
  , data: {roomId: getState().get('room'), userId}
  , meta: {server: true}
});

const roomKick = (roomId, userId) => ({
  type: 'roomKick'
  , data: {roomId, userId}
});

const server$roomKick = (roomId, userId) => (dispatch, getState) => {
  dispatch(server$roomExit(roomId, userId));
  dispatch(Object.assign(roomKick(roomId, userId)
    , {meta: {userId}}));
};

// Ban

export const roomBanRequest = (userId) => (dispatch, getState) => dispatch({
  type: 'roomBanRequest'
  , data: {roomId: selectClientRoomId(getState), userId}
  , meta: {server: true}
});

const roomBan = (userId) => ({
  type: 'roomBan'
  , data: {userId}
});

const server$roomBan = (roomId, userId) => (dispatch, getState) => {
  dispatch(Object.assign(roomBan(roomId, userId)
    , {meta: {users: true}}));
  dispatch(server$roomKick(roomId, userId));
};

// Unban

export const roomUnbanRequest = (userId) => (dispatch, getState) => dispatch({
  type: 'roomBanRequest'
  , data: {roomId: selectClientRoomId(getState), userId}
  , meta: {server: true}
});

const roomUnban = (userId) => ({
  type: 'roomUnban'
  , data: {userId}
});

const server$roomUnban = (roomId, userId) => (dispatch, getState) =>
  dispatch(Object.assign(roomUnban(roomId, userId)
    , {meta: {users: true}}));

export const roomsClientToServer = {
  roomCreateRequest: (data, {user: {id: userId}}) => (dispatch, getState) => {
    const room = RoomModel.new();
    dispatch(server$roomCreate(room));
    dispatch(server$roomJoin(room.id, userId));
  }
  , roomJoinRequest: ({roomId}, {user: {id: userId}}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkRoomIsNotInGame(room);
    checkUserNotBanned(room, userId);
    dispatch(server$roomJoin(roomId, userId));
  }
  , roomExitRequest: ({roomId}, {user: {id: userId}}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserInRoom(room, userId);
    dispatch(server$roomExit(roomId, userId));
  }
  , roomEditSettingsRequest: ({roomId, settings}, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const room = checkSelectRoom(getState, roomId);
    checkUserInRoom(room, userId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, userId);
    checkValidate(settings, SettingsRules);
    dispatch(server$roomEditSettings(roomId, settings));
  }
  , roomKickRequest: ({roomId, userId}, {user}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserInRoom(room, userId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, user.id);
    dispatch(server$roomKick(roomId, userId));
  }
  , roomBanRequest: ({roomId, userId}, {user}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserInRoom(room, userId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, userId);
    checkUserNotBanned(room, userId);
    dispatch(server$roomBan(roomId, userId));
  }
  , roomUnbanRequest: ({roomId, userId}, {user}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserInRoom(room, userId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, userId);
    checkUserBanned(room, userId);
    dispatch(server$roomUnban(roomId, userId));
  }
};

export const roomsServerToClient = {
  roomCreate: ({room}) => roomCreate(RoomModel.fromJS(room))
  , roomJoin: ({roomId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(roomJoinNotify(roomId, userId));
    if (currentUserId === userId) {
      dispatch(roomJoin(roomId, userId));
      dispatch(redirectTo(`/room/${roomId}`));
    }
  }
  , roomExit: ({roomId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(roomExitNotify(roomId, userId));
    if (currentUserId === userId) {
      dispatch(roomExit(roomId, userId));
      dispatch(redirectTo(`/`));
    }
  }
  , roomDestroy: ({roomId}) => roomDestroy(roomId)
  , roomEditSettings: ({roomId, settings}) => roomEditSettings(roomId, settings)
  , roomKick: ({roomId, userId}) => roomKick(roomId, userId)
  , roomBan: ({roomId, userId}) => roomBan(roomId, userId)
  , roomUnban: ({roomId, userId}) => roomUnban(roomId, userId)
};