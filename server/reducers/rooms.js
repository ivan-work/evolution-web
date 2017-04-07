import {Map, List} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  roomCreateSuccess: (state, data) => state.set(data.room.id, data.room)
  , roomJoinSuccess: (state, data) => state.updateIn([data.roomId, 'users'], (users) => users.push(data.userId))
  , roomExitSuccess: (state, data) => {
    const {userId, roomId} = data;
    const room = state.get(roomId);
    return room.users.equals(List.of(userId))
      ? state.remove(roomId)
      :
      state.update(roomId, (room) => {
        let index = room.users.indexOf(userId);
        return (!~index
          ? room
          : room.update('users', users => users.remove(index)));
      });
  }
});