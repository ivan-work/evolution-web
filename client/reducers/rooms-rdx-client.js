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
  , roomStartVoting
  , roomStartVoteAction
  , roomStartVoteEnd
} from '../../server/reducers/rooms-rdx-server';

const roomJoinSelf = (rooms, {roomId, userId, room}) => rooms.set(roomId, room);

const roomSpectateSelf = (rooms, {roomId, userId, room}) => rooms.set(roomId, room);

const roomExitSelf = (rooms, {roomId, userId}) => !rooms.get(roomId) ? rooms
  : rooms.removeIn([roomId, 'chat']);

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
  , roomStartVoting
  , roomStartVoteAction
  , roomStartVoteHide: (rooms, {roomId}) => !rooms.get(roomId) ? rooms
    : rooms.setIn([roomId, 'votingForStart', 'showOnClient'], false)
  , roomStartVoteEnd
});