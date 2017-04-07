import {createReducer} from '~/shared/utils';
import {Map} from 'immutable';

import {
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
} from '../../server/reducers/rooms-rdx-server';

const roomJoinSelf = (state, {roomId, userId, room}) => state.set(roomId, room);

const roomSpectateSelf = (state, {roomId, userId, room}) => state.set(roomId, room);

const roomExitSelf = (state, {roomId, userId}) => state.update(roomId, (room) => room.remove('chat'));

export const reducer = createReducer(Map(), {
  roomsInit: (state, {rooms}) => rooms
  , roomCreate
  , roomJoin
  , roomJoinSelf
  , roomSpectate
  , roomSpectateSelf
  , roomExit
  , roomExitSelf
  , roomDestroy
  , roomBan
  , roomUnban
  , roomEditSettings
  , gameCreateNotify
  , chatMessageRoom
});