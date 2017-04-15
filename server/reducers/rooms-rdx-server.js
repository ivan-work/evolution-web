import {createReducer} from '~/shared/utils';
import {Map} from 'immutable';
import {VotingModel} from '../../shared/models/RoomModel';
import {SettingsRecord} from '../../shared/models/game/GameSettings';

export const roomCreate = (state, {room}) => state.set(room.id, room);

export const roomJoin = (state, {roomId, userId}) => state.update(roomId, (room) =>
  room.update('users', (users) => users.push(userId)));

export const roomSpectate = (state, {roomId, userId}) => state.update(roomId, (room) =>
  room.update('spectators', (spectators) => spectators.push(userId)));

export const roomExit = (state, {roomId, userId}) => !state.get(roomId)
  ? state
  : state.update(roomId, (room) => room
  .update('users', users => users.filterNot(u => u === userId))
  .update('spectators', spectators => spectators.filterNot(u => u === userId))
);

export const roomDestroy = (state, {roomId, userId}) => state.remove(roomId);

export const roomEditSettings = (state, {roomId, settings}) => state.update(roomId, room => room
  .set('name', settings.name)
  .update('settings', s => s.applySettings(settings)));

export const roomBan = (state, {roomId, userId}) => state.updateIn([roomId, 'banlist'], banlist => banlist.push(userId));

export const roomUnban = (state, {roomId, userId}) => state.updateIn([roomId, 'banlist'], banlist => banlist.filterNot(u => u === userId));

export const gameCreateNotify = (state, {roomId, gameId}) => state.update(roomId, room => room
  .set('gameId', gameId));

export const chatMessageRoom = (rooms, {message}) => rooms.updateIn([message.to, 'chat'], chat => chat.receiveMessage(message));

/**
 * Start/Ready
 */

export const roomStartVoting = (rooms, {roomId}) => rooms.setIn([roomId, 'votingForStart'], VotingModel.new());

export const roomStartVoteAction = (rooms, {roomId, userId, vote}) => rooms.setIn([roomId, 'votingForStart', 'votes', userId], vote);

export const reducer = createReducer(Map(), {
  roomCreate
  , roomJoin
  , roomSpectate
  , roomExit
  , roomDestroy
  , roomBan
  , roomUnban
  , roomEditSettings
  , gameCreateNotify
  , chatMessageRoom
  , roomStartVoting
  , roomStartVoteAction
});