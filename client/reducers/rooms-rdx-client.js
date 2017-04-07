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
  , gameCreateSuccess
} from '../../server/reducers/rooms-rdx-server';

const initialState = Map();

export const reducer = createReducer(initialState, {
  loginUserSuccess: (state, {rooms}) => rooms
  , roomCreate
  , roomJoinNotify: roomJoin
  , roomExitNotify: roomExit
  , roomDestroy
  , roomBan
  , roomUnban
  , roomEditSettings
  , gameCreateSuccess
  , clientDisconnectSelf: (state, data) => initialState
});