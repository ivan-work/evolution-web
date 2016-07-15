import {Map, List} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  roomUpdate: (state, data) => data.room !== null ? state.set(data.roomId, data.room) : state.remove(data.roomId)
});