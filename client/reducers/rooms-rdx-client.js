import {createReducer} from '~/shared/utils';
import {Map} from 'immutable';

import {
  roomCreate
  , roomJoin
  , roomExit
  , roomDestroy
  , roomBan
  , roomUnban
  , roomEditSettings
  , gameCreateNotify
  , chatMessageRoom
} from '../../server/reducers/rooms-rdx-server';

const roomJoinSelf = (state, {roomId, userId, room}) => state.set(roomId, room);

const roomExitSelf = (state, {roomId, userId}) => state.update(roomId, (room) =>
  room.remove('chat'));

export const reducer = createReducer(Map(), {
  roomsInit: (state, {rooms}) => rooms
  , roomCreate
  , roomJoin
  , roomExit: (state, data) => roomExitSelf(roomExit(state, data), data)
  , roomJoinSelf
  , roomDestroy
  , roomBan
  , roomUnban
  , roomEditSettings
  , gameCreateNotify
  , chatMessageRoom
});