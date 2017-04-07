import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  roomCreateSuccess: (state, data) => state.set(data.room.id, data.room)
  , roomJoinSuccess: (state, data) => state.updateIn([data.roomId, 'users'], (users) => users.push(data.userId))
  , roomExitSuccess: (state, data) => {
    const {userId} = data;
    return state.map((room) => {
      let index = room.users.indexOf(userId);
      return (!~index
        ? room
        : room.update('users', users => users.remove(index)));
    });
  }
});