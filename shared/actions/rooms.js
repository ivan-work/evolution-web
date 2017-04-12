import logger from '~/shared/utils/logger';
import {Map} from 'immutable';

import {RoomModel} from '../models/RoomModel';
import {GameModelClient} from '../models/game/GameModel';
import {SettingsRules} from '../models/game/GameSettings';
import {ActionCheckError} from '../models/ActionCheckError';

import {gameInit, server$gameLeave, gameDestroy} from './actions';
import {toUser$Client} from './generic';

import {redirectTo} from '../utils';
import {selectRoom, selectGame} from '../selectors';

const selectClientRoomId = (getState) => getState().get('room');

import {
  checkSelectRoom
  , checkRoomMaxSize
  , checkRoomIsNotInGame
  , checkUserInRoom
  , checkUserNotInPlayers
  , checkUserNotSpectatingRoom
  , checkUserIsHost
  , checkValidate
  , checkUserBanned
  , checkUserNotBanned
  , checkCanJoinRoomToPlay
  , checkCanJoinRoomToSpectate
} from './rooms.checks';

export const findRoomByUser = (getState, userId) => getState().get('rooms').find(room => !!~room.users.indexOf(userId) || !!~room.spectators.indexOf(userId));

/**
 * Init
 * */

const roomsInit = (roomId, rooms) => ({
  type: 'roomsInit'
  , data: {roomId, rooms}
});

export const server$roomsInit = (userId) => (dispatch, getState) => {
  const rooms = getState().get('rooms');
  const room = findRoomByUser(getState, userId);
  const roomId = !!room && room.id || null;
  const roomsClient = rooms.map(r => r.id === roomId ? r.toClient() : r.toOthers().toClient());
  dispatch(toUser$Client(userId, roomsInit(roomId, roomsClient)));

  const game = !!room && room.gameId && selectGame(getState, room.gameId) || null;
  const gameUserId = !!game && game.players.has(userId) && userId;
  !!game && dispatch(toUser$Client(userId, gameInit(game.toOthers(gameUserId).toClient(), gameUserId)));
};

/**
 * Create
 */

export const roomCreateRequest = () => ({
  type: 'roomCreateRequest'
  , data: {}
  , meta: {server: true}
});

const roomCreate = (room) => ({
  type: 'roomCreate'
  , data: {room}
});

export const server$roomCreate = (room) => (dispatch, getState) => dispatch(Object.assign(roomCreate(room.toClient().toOthers())
  , {meta: {users: true}}));

/**
 * Join
 */

export const roomJoinRequestSoft = (roomId) => (dispatch, getState) => (
  getState().get('room') === roomId && getState().get('rooms').find(r => ~r.users.indexOf(getState().getIn(['user', 'id'])))
    ? dispatch(redirectTo(`/room/${roomId}`))
    : dispatch(roomJoinRequest(roomId))
);

export const roomJoinRequest = (roomId) => ({
  type: 'roomJoinRequest'
  , data: {roomId}
  , meta: {server: true}
});

const roomJoin = (roomId, userId) => ({
  type: 'roomJoin'
  , data: {roomId, userId}
});

const roomJoinSelf = (roomId, userId, room) => ({
  type: 'roomJoinSelf'
  , data: {roomId, userId, room}
});

export const server$roomJoin = (roomId, userId) => (dispatch, getState) => {
  const previousRoom = findRoomByUser(getState, userId);
  if (previousRoom)
  // If user has previous room and it's not the same:
    if (previousRoom.id !== roomId) dispatch(server$roomExit(previousRoom.id, userId));
    // If user has same previous room, but not in spectators:
    else if (!~previousRoom.users.indexOf(userId)) dispatch(server$roomExit(previousRoom.id, userId, false));
    else throw new ActionCheckError('User already in users');
  dispatch(roomJoin(roomId, userId));
  dispatch(Object.assign(roomJoin(roomId, userId), {meta: {clientOnly: true, users: true}}));
  dispatch(Object.assign(roomJoinSelf(roomId, userId, selectRoom(getState, roomId).toClient()), {
    clientOnly: true,
    meta: {userId}
  }));
};

/**
 * Spectate
 */

export const roomSpectateRequestSoft = (roomId) => (dispatch, getState) => (
  getState().get('room') === roomId && getState().get('rooms').find(r => ~r.spectators.indexOf(getState().getIn(['user', 'id'])))
    ? dispatch(redirectTo(`/room/${roomId}`))
    : dispatch(roomSpectateRequest(roomId))
);

export const roomSpectateRequest = (roomId) => ({
  type: 'roomSpectateRequest'
  , data: {roomId}
  , meta: {server: true}
});

const roomSpectate = (roomId, userId) => ({
  type: 'roomSpectate'
  , data: {roomId, userId}
});

const roomSpectateSelf = (roomId, userId, room, game) => ({
  type: 'roomSpectateSelf'
  , data: {roomId, userId, room, game}
});

// Exit

export const roomExitRequest = () => (dispatch, getState) => {
  const roomId = selectClientRoomId(getState);
  dispatch({
    type: 'roomExitRequest'
    , data: {roomId}
    , meta: {server: true}
  });
  dispatch(roomExitSelf());
  dispatch(redirectTo(`/`));
};

const roomExit = (roomId, userId) => ({
  type: 'roomExit'
  , data: {roomId, userId}
});

const roomExitSelf = () => ({
  type: 'roomExitSelf'
  , data: {}
});

export const server$roomExit = (roomId, userId, checkForDestroy = true) => (dispatch, getState) => {
  //logger.debug('server$roomExit:', roomId, userId);
  dispatch(Object.assign(roomExit(roomId, userId), {meta: {users: true}}));
  const room = selectRoom(getState, roomId);
  if (room.gameId && selectGame(getState, room.gameId).getPlayer(userId))
    dispatch(server$gameLeave(room.gameId, userId));

  if (checkForDestroy && selectRoom(getState, roomId).users.size + selectRoom(getState, roomId).spectators.size === 0)
    dispatch(server$roomDestroy(roomId));
};

// Destroy

export const roomDestroy = (roomId) => ({
  type: 'roomDestroy'
  , data: {roomId}
});

export const server$roomDestroy = (roomId) => (dispatch, getState) => {
  const room = selectRoom(getState, roomId);
  const game = selectGame(getState, room.gameId);
  if (game) dispatch(gameDestroy(game.id));
  dispatch(Object.assign(roomDestroy(roomId)
    , {meta: {users: true}}));
};

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

const roomBan = (roomId, userId) => ({
  type: 'roomBan'
  , data: {roomId, userId}
});

const server$roomBan = (roomId, userId) => (dispatch, getState) => {
  dispatch(Object.assign(roomBan(roomId, userId)
    , {meta: {users: true}}));
  dispatch(server$roomKick(roomId, userId));
};

// Unban

export const roomUnbanRequest = (userId) => (dispatch, getState) => dispatch({
  type: 'roomUnbanRequest'
  , data: {roomId: selectClientRoomId(getState), userId}
  , meta: {server: true}
});

const roomUnban = (roomId, userId) => ({
  type: 'roomUnban'
  , data: {roomId, userId}
});

const server$roomUnban = (roomId, userId) => (dispatch, getState) =>
  dispatch(Object.assign(roomUnban(roomId, userId)
    , {meta: {users: true}}));

export const roomsClientToServer = {
  roomCreateRequest: (data, {userId}) => (dispatch, getState) => {
    const room = RoomModel.new();
    dispatch(server$roomCreate(room));
    dispatch(server$roomJoin(room.id, userId));
  }
  , roomJoinRequest: ({roomId}, {userId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkCanJoinRoomToPlay(room, userId);
    checkUserNotInPlayers(room, userId);
    dispatch(server$roomJoin(roomId, userId));
  }
  , roomSpectateRequest: ({roomId}, {userId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkCanJoinRoomToSpectate(room, userId);
    checkUserNotSpectatingRoom(room, userId);
    const previousRoom = findRoomByUser(getState, userId);

    if (previousRoom)
    // If user has previous room and it's not the same:
      if (previousRoom.id !== roomId) dispatch(server$roomExit(previousRoom.id, userId));
      // If user has same previous room, but not in spectators:
      else if (!~previousRoom.spectators.indexOf(userId)) dispatch(server$roomExit(previousRoom.id, userId, false));
      else throw new ActionCheckError('User already in spectators');

    dispatch(roomSpectate(roomId, userId));
    dispatch(Object.assign(roomSpectate(roomId, userId), {meta: {clientOnly: true, users: true}}));
    const game = room.gameId && selectGame(getState, room.gameId).toOthers(userId).toClient();
    dispatch(Object.assign(roomSpectateSelf(roomId, userId, selectRoom(getState, roomId).toClient(), game), {
      clientOnly: true,
      meta: {userId}
    }));
  }
  , roomExitRequest: ({roomId}, {userId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserInRoom(room, userId);
    dispatch(server$roomExit(roomId, userId));
  }
  , roomEditSettingsRequest: ({roomId, settings}, {userId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, userId);
    if (settings.name) settings.name = settings.name.trim();
    checkValidate(settings, SettingsRules);
    settings.timeTurn *= 60000;
    settings.timeTraitResponse *= 60000;
    dispatch(server$roomEditSettings(roomId, settings));
  }
  , roomKickRequest: ({roomId, userId}, {userId: hostId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, hostId);
    checkUserInRoom(room, userId);
    dispatch(server$roomKick(roomId, userId));
  }
  , roomBanRequest: ({roomId, userId}, {userId: hostId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, hostId);
    checkUserNotBanned(room, userId);
    dispatch(server$roomBan(roomId, userId));
  }
  , roomUnbanRequest: ({roomId, userId}, {userId: hostId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, hostId);
    checkUserBanned(room, userId);
    dispatch(server$roomUnban(roomId, userId));
  }
};

export const roomsServerToClient = {
  roomsInit: ({roomId, rooms}) => roomsInit(roomId, Map(rooms).map(r => RoomModel.fromJS(r)))
  , roomCreate: ({room}) => roomCreate(RoomModel.fromJS(room))
  , roomJoin: ({roomId, userId}) => roomJoin(roomId, userId)
  , roomJoinSelf: ({roomId, userId, room}, currentUserId) => (dispatch, getState) => {
    dispatch(roomJoinSelf(roomId, userId, RoomModel.fromJS(room)));
    dispatch(redirectTo(`/room/${roomId}`));
  }
  , roomSpectate: ({roomId, userId}) => roomSpectate(roomId, userId)
  , roomSpectateSelf: ({roomId, userId, room, game}, currentUserId) => (dispatch, getState) => {
    dispatch(roomSpectateSelf(roomId, userId, RoomModel.fromJS(room)));
    if (!game) {
      dispatch(redirectTo(`/room/${roomId}`));
    } else {
      dispatch(gameInit(GameModelClient.fromServer(game)));
      dispatch(redirectTo(`/game`));
    }
  }
  , roomExit: ({roomId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(roomExit(roomId, userId));
    if (currentUserId === userId) {
      dispatch(roomExitSelf());
      if (getState().getIn(['routing', 'locationBeforeTransitions', 'pathname']) === '/room/' + roomId)
        dispatch(redirectTo(`/`));
    }
  }
  , roomDestroy: ({roomId}) => roomDestroy(roomId)
  , roomEditSettings: ({roomId, settings}) => roomEditSettings(roomId, settings)
  , roomKick: ({roomId, userId}) => roomKick(roomId, userId)
  , roomBan: ({roomId, userId}) => roomBan(roomId, userId)
  , roomUnban: ({roomId, userId}) => roomUnban(roomId, userId)
};