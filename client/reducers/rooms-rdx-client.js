import {createReducer} from '~/shared/utils';
import {Map} from 'immutable';

import {roomJoinSuccess, roomExitSuccess} from '../../server/reducers/rooms-rdx-server';

const initialState = Map();

export const reducer = createReducer(initialState, {
  loginUserSuccess: (state, {rooms}) => rooms
  , roomCreateSuccess: (state, {room}) => state.set(room.id, room)
  , roomJoinSuccess
  , roomExitSuccess
  , clientDisconnectSelf: (state, data) => initialState
});