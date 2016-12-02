import {createReducer} from '~/shared/utils';
import {Map} from 'immutable';
import {SettingsRecord} from '../../shared/models/game/GameSettings';

export const roomJoinSuccess = (state, {roomId, userId}) => {
  return state.update(roomId, (room) => room.join(userId))
};

export const roomExitSuccess = (state, {roomId, userId}) => {
  const room = state.get(roomId);
  if (!room) return state;
  const newRoom = room.leave(userId);
  return !newRoom
    ? state.remove(roomId)
    : state.set(roomId, newRoom);
};

export const gameCreateSuccess = (state, {game}) => state.update(game.roomId, room => room.set('gameId', game.id));

export const roomEditSettings = (state, {roomId, settings}) => state.update(roomId, room => room
  .set('name', settings.name)
  .set('settings', new SettingsRecord(settings)));

export const reducer = createReducer(Map(), {
  roomCreateSuccess: (state, {room}) => state.set(room.id, room)
  , roomJoinSuccess
  , roomExitSuccess
  , gameCreateSuccess
  , roomEditSettings
});