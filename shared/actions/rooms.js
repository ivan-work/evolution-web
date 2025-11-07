import logger from '~/shared/utils/logger';
import {Map} from 'immutable';

export const ROOM_AFK_HOST_PERIOD = 10 * 60e3;
export const ROOM_SELF_DESTRUCTION_TIME = 10 * 60e3;

import {RoomModel, VotingModel} from '../models/RoomModel';
import {GameModel, GameModelClient} from '../models/game/GameModel';
import {CHAT_TARGET_TYPE} from '../models/ChatModel';
import {SettingsRules} from '../models/game/GameSettings';

import ActionCheckError from '../models/ActionCheckError';
import * as ERR from '../errors/ERR';

import {
  gameInit
  , server$gameLeave
  , gameDestroy
  , server$gameCreateSuccess
  , server$chatMessage, makeTurnTimeoutId
} from './actions';
import {appPlaySound} from '../../client/actions/app';
import {toUser$Client, server$toUsers, server$toRoom} from './generic';

import {redirectTo} from '../utils/history';
import {selectRoom, selectGame, selectUsersInRoom, selectUserName, selectUser} from '../selectors';

import {
  checkSelectRoom
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
  , checkComboRoomCanStart
  , checkStartVotingCanStart
  , checkStartVotingIsInProgress
  , isUserInPlayers
  , isUserInSpecatators
} from './rooms.checks';

const selectClientRoomId = (getState) => getState().get('room');

export const findRoomByUser = (getState, userId) => getState().get('rooms').find(room => !!~room.users.indexOf(userId) || !!~room.spectators.indexOf(userId));

import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';
import LocationService from "../../client/services/LocationService";

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
    ? redirectTo(`/room`)
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
    ? redirectTo(`/room`)
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

/**
 * Voting
 * */

export const roomStartVotingRequest = () => (dispatch, getState) => dispatch({
  type: 'roomStartVotingRequest'
  , data: {roomId: selectClientRoomId(getState)}
  , meta: {server: true}
});

const roomStartVoteHide = (roomId) => ({
  type: 'roomStartVoteHide'
  , data: {roomId}
});


const roomStartVoteEnd = (roomId) => ({
  type: 'roomStartVoteEnd'
  , data: {roomId}
});

const roomStartVoting = (roomId, timestamp) => ({
  type: 'roomStartVoting'
  , data: {roomId, timestamp}
});

export const roomStartVoteActionRequest = (vote) => (dispatch, getState) => {
  const roomId = selectClientRoomId(getState);
  dispatch({
    type: 'roomStartVoteActionRequest'
    , data: {roomId, vote}
    , meta: {server: true}
  });
  if (vote === false) dispatch(roomStartVoteHide(roomId));
};

const roomStartVoteAction = (roomId, userId, vote) => ({
  type: 'roomStartVoteAction'
  , data: {roomId, userId, vote}
});

const server$roomStartVoteAction = (roomId, userId, vote) => (dispatch, getState) => {
  dispatch(server$toRoom(roomId, roomStartVoteAction(roomId, userId, vote)));
  const room = selectRoom(getState, roomId);
  const voting = room.votingForStart;
  if (!voting) return;
  if (voting.votes.size === room.users.size) {
    if (voting.votes.every((v, k) => v === true)) {
      dispatch(cancelTimeout(`roomStartVoteEnd#${roomId}`));
      dispatch(server$gameCreateSuccess(room));
    }
  }
};

/**
 * Exit
 */

export const roomExitRequest = () => (dispatch, getState) => {
  const roomId = selectClientRoomId(getState);
  dispatch({
    type: 'roomExitRequest'
    , data: {roomId}
    , meta: {server: true}
  });
  dispatch(roomExitSelf());
  redirectTo(`/`);
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

/**
 * Destroy
 */

export const roomDestroy = (roomId) => ({
  type: 'roomDestroy'
  , data: {roomId}
});

export const server$roomDestroy = (roomId) => (dispatch, getState) => {
  const room = selectRoom(getState, roomId);
  const game = selectGame(getState, room.gameId);

  dispatch(server$roomSelfDestructCancel(roomId));

  room.users.forEach((userId) => {
    dispatch(server$roomExit(roomId, userId, false));
  });

  room.spectators.forEach((userId) => {
    dispatch(server$roomExit(roomId, userId, false));
  });

  if (game) dispatch(gameDestroy(game.id));

  dispatch(Object.assign(roomDestroy(roomId)
    , {meta: {users: true}}));
};

/**
 * Settings
 */

export const roomSetSeedRequest = (seed) => (dispatch, getState) => dispatch({
  type: 'roomSetSeedRequest'
  , data: {roomId: selectClientRoomId(getState), seed}
  , meta: {server: true}
});

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

/**
 * Kick
 */

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
  dispatch(Object.assign(roomKick(roomId, userId)
    , {meta: {userId}}));
  dispatch(server$roomExit(roomId, userId));
};

/**
 * Ban
 */

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

/**
 * Unban
 */

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

/**
 * Dead hosts
 */

const roomAfkHost = (roomId, afkHost) => ({
  type: 'roomAfkHost'
  , data: {roomId, afkHost}
});

export const server$roomAfkHosts = () => (dispatch, getState) => {
  getState().get('rooms').forEach((room) => {
    if (room.gameId) return;
    if (Date.now() - room.timestamp < ROOM_AFK_HOST_PERIOD) return;
    const hostId = room.users.first();

    if (Date.now() - room.hostActivity > ROOM_AFK_HOST_PERIOD) {
      if (room.afkHost) {
        dispatch(server$chatMessage(room.id, CHAT_TARGET_TYPE.ROOM, 'App.Room.Messages.AfkHostKick', '0'));
        dispatch(roomAfkHost(room.id, false));
        // Watch out, this should be the last action as it could destroy room
        dispatch(server$roomKick(room.id, hostId));
      } else {
        dispatch(roomAfkHost(room.id, true));
        dispatch(server$chatMessage(room.id, CHAT_TARGET_TYPE.ROOM, 'App.Room.Messages.AfkHostRequest', '0'));
      }
    } else {
      if (room.afkHost) {
        dispatch(roomAfkHost(room.id, false));
        dispatch(server$chatMessage(room.id, CHAT_TARGET_TYPE.ROOM, 'App.Room.Messages.AfkHostNormal', '0'));
      }
    }
  })
};

export const roomsClientToServer = {
  roomCreateRequest: (data, {userId}) => (dispatch, getState) => {
    const room = RoomModel.new(selectUser(getState, userId));
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

    if (previousRoom) {
      // If user has previous room and it's not the same:
      if (previousRoom.id !== roomId) dispatch(server$roomExit(previousRoom.id, userId));
      // If user has same previous room, but not in spectators:
      else if (!~previousRoom.spectators.indexOf(userId)) dispatch(server$roomExit(previousRoom.id, userId, false));
      else throw new ActionCheckError('User already in spectators');
    }

    dispatch(roomSpectate(roomId, userId));
    dispatch(Object.assign(roomSpectate(roomId, userId), {meta: {clientOnly: true, users: true}}));
    const game = room.gameId && selectGame(getState, room.gameId).toOthers(userId).toClient();
    dispatch(Object.assign(roomSpectateSelf(roomId, userId, selectRoom(getState, roomId).toClient(), game), {
      clientOnly: true,
      meta: {userId}
    }));
  }
  , roomStartVotingRequest: ({roomId}, {userId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkComboRoomCanStart(room, userId);
    dispatch(server$toUsers(roomStartVoting(roomId, Date.now())));
    dispatch(addTimeout(VotingModel.START_VOTING_TIMEOUT, `roomStartVoteEnd#${roomId}`, (dispatch) => {
      checkSelectRoom(getState, roomId);
      dispatch(server$toUsers(roomStartVoteEnd(roomId)))
    }));
    dispatch(server$roomStartVoteAction(roomId, userId, true));
  }
  , roomStartVoteActionRequest: ({roomId, vote}, {userId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserInRoom(room, userId);
    checkUserNotSpectatingRoom(room, userId);
    checkStartVotingIsInProgress(room);
    checkRoomIsNotInGame(room);
    dispatch(server$roomStartVoteAction(roomId, userId, vote));
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
    if (!process.env.SEEDS_ENABLED && settings.seed) throw new ActionCheckError('CheckIfSeedsEnabled', 'SEEDS_ENABLED is false', room.id, userId);
    settings.timeTurn *= 1e3;
    settings.timeTraitResponse *= 1e3;
    dispatch(server$roomEditSettings(roomId, settings));
  }
  , roomSetSeedRequest: ({roomId, seed}, {userId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkRoomIsNotInGame(room);
    checkUserIsHost(room, userId);
    if (!process.env.SEEDS_ENABLED) throw new ActionCheckError('CheckIfSeedsEnabled', 'SEEDS_ENABLED is false', room.id, userId);
    dispatch(server$roomEditSettings(roomId, {seed}));
  }
  , roomKickRequest: ({roomId, userId}, {userId: hostId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserIsHost(room, hostId);
    checkUserInRoom(room, userId);
    if (isUserInPlayers(room, userId)) {
      checkRoomIsNotInGame(room);
      checkStartVotingCanStart(room);
    }
    dispatch(server$roomKick(roomId, userId));
  }
  , roomBanRequest: ({roomId, userId}, {userId: hostId}) => (dispatch, getState) => {
    const room = checkSelectRoom(getState, roomId);
    checkUserIsHost(room, hostId);
    checkUserInRoom(room, userId);
    checkUserNotBanned(room, userId);
    if (isUserInPlayers(room, userId)) {
      checkRoomIsNotInGame(room);
      checkStartVotingCanStart(room);
    }
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

// TODO make it normal. relocate, add selectPath, url contruction to function.
const isUserRouterInGame = () => {
  const pathname = window.location.pathname;
  return pathname === '/room';
};

// region roomSelfDestruct

const makeRoomSelfDestructTimeoutId = (roomId) => `roomSelfDestruct#${roomId}`;

export const server$roomSelfDestructStart = (roomId, winnerId) => (dispatch, getState) => {
  dispatch(server$chatMessage(roomId, CHAT_TARGET_TYPE.ROOM, 'App.Room.Messages.GameEnd', '0', {
    time: Math.floor(ROOM_SELF_DESTRUCTION_TIME / 60e3)
    , winnerName: selectUserName(getState, winnerId)
  }));

  dispatch(addTimeout(ROOM_SELF_DESTRUCTION_TIME, makeRoomSelfDestructTimeoutId(roomId), (dispatch) => {
    dispatch(server$roomDestroy(roomId));
  }));
};

export const server$roomSelfDestructCancel = (roomId) =>
  cancelTimeout(makeRoomSelfDestructTimeoutId(roomId));

// endregion

export const roomsServerToClient = {
  roomsInit: ({roomId, rooms}) => roomsInit(roomId, Map(rooms).map(r => RoomModel.fromJS(r)))
  , roomCreate: ({room}, currentUserId) => (dispatch, getState) => {
    const roomModel = RoomModel.fromJS(room);
    dispatch(roomCreate(roomModel));
    const userNotInRoom = !getState().room;
    const userAtRoot = LocationService.getLocationPath() === '/';
    const userIsNotHost = roomModel.hostId !== currentUserId;
    if (userNotInRoom && userAtRoot && userIsNotHost) {
      dispatch(appPlaySound('ROOM_CREATED', 30e3));
    }
  }
  , roomJoin: ({roomId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(roomJoin(roomId, userId));
    const room = selectRoom(getState, roomId);
    if (room.users.first() === currentUserId && userId !== currentUserId) {
      if (room.users.size === +room.settings.maxPlayers) {
        dispatch(appPlaySound('ROOM_JOIN_FULL'));
      } else {
        dispatch(appPlaySound('ROOM_JOIN'));
      }
    }
  }
  , roomJoinSelf: ({roomId, userId, room}, currentUserId) => (dispatch, getState) => {
    dispatch(roomJoinSelf(roomId, userId, RoomModel.fromJS(room)));
    redirectTo(`/room`);
  }
  , roomSpectate: ({roomId, userId}) => roomSpectate(roomId, userId)
  , roomSpectateSelf: ({roomId, userId, room, game}, currentUserId) => (dispatch, getState) => {
    dispatch(roomSpectateSelf(roomId, userId, RoomModel.fromJS(room)));
    if (game) {
      dispatch(gameInit(GameModelClient.fromServer(game)));
    }
    redirectTo(`/room`);
  }
  , roomExit: ({roomId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(roomExit(roomId, userId));
    if (currentUserId === userId) {
      dispatch(roomExitSelf());
      if (isUserRouterInGame())
        redirectTo(`/`);
    }
  }
  , roomDestroy: ({roomId}) => roomDestroy(roomId)
  , roomEditSettings: ({roomId, settings}) => roomEditSettings(roomId, settings)
  , roomKick: ({roomId, userId}) => roomKick(roomId, userId)
  , roomBan: ({roomId, userId}) => roomBan(roomId, userId)
  , roomUnban: ({roomId, userId}) => roomUnban(roomId, userId)
  , roomStartVoting: ({roomId, timestamp}, currentUserId) => (dispatch, getState) => {
    dispatch(roomStartVoting(roomId, timestamp));
    if (isUserInPlayers(selectRoom(getState, roomId), currentUserId)) {
      if (!isUserRouterInGame()) {
        redirectTo(`/room`);
      }
      dispatch(appPlaySound('START_D2'));
    }
  }
  , roomStartVoteAction: ({roomId, userId, vote}) => roomStartVoteAction(roomId, userId, vote)
  , roomStartVoteEnd: ({roomId}) => roomStartVoteEnd(roomId)
};