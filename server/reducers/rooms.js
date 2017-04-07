import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  roomCreateSuccess: (state, data) => state.set(data.room.id, data.room)
  //, logoutUser: (state, userId) => state.remove(userId)
});