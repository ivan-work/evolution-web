import {createReducer} from '~/shared/utils';
import {Map, List} from 'immutable';
import {RoomModel} from '~/shared/models/RoomModel';

export const reducer = createReducer(Map(), {
  loginState: (state, data) => data.rooms
  , roomUpdate: (state, data) => data.room != null ? state.set(data.roomId, data.room) : state.remove(data.roomId)
  , clientSelfDisconnect: (state, data) => Map()
});