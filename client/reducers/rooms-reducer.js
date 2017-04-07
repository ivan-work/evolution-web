import {createReducer} from '~/shared/utils';
import {Map, List} from 'immutable';
import {RoomModel} from '~/shared/models/RoomModel';

export const reducer = createReducer(Map(), {
  loginState: (state, data) => data.rooms
  ,
  roomCreateSuccess: (state, data) => state.set(data.room.id, data.room)
  ,
  roomJoinSuccess: (state, data) => state.update(data.roomId, room => room.update('users', users => users.push(data.userId)))
  ,
  roomExitSuccess: (state, data) => {
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