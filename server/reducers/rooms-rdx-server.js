import {createReducer} from '~/shared/utils';
import {Map} from 'immutable';
import {SettingsRecord} from '../../shared/models/game/GameSettings';

export const roomCreate = (state, {room}) => state.set(room.id, room);

export const roomJoin = (state, {roomId, userId}) => state.update(roomId, (room) =>
  room.update('users', (users) => users.push(userId)));

export const roomExit = (state, {roomId, userId}) => state.update(roomId, (room) =>
  room.update('users', (users) => users.remove(users.indexOf(userId))));

export const roomDestroy = (state, {roomId, userId}) => state.remove(roomId);

export const roomEditSettings = (state, {roomId, settings}) => state.update(roomId, room => room
  .set('name', settings.name)
  .set('settings', new SettingsRecord(settings)));

export const roomBan = (state, {roomId, userId}) => state.update(roomId, room => room
  .update('banlist', banlist => banlist.push(userId)));

export const roomUnban = (state, {roomId, userId}) => state.update(roomId, room => room
  .update('banlist', banlist => banlist.remove(banlist.indexOf(userId))));

export const gameCreateNotify = (state, {roomId, gameId}) => state.update(roomId, room => room
  .set('gameId', gameId));

export const reducer = createReducer(Map(), {
  roomCreate
  , roomJoin
  , roomExit
  , roomDestroy
  , roomBan
  , roomUnban
  , roomEditSettings
  , gameCreateNotify
});