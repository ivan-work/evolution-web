import {createReducer} from '~/shared/utils';
import {Map} from 'immutable';
import {RoomModel} from '~/shared/models/RoomModel';

export const reducer = createReducer(Map(), {
  loginState: (state, data) => data.rooms
  ,
  roomCreateSuccess: (state, data) => state.set(data.room.id, data.room)
  ,
  roomJoinSuccess: (state, data) => state.update(data.roomId, room => room.update('users', users => users.push(data.userId)))
  ,
  roomExitSuccess: (state, data) => state.update(data.roomId, room => {
    let index = room.users.indexOf(data.userId);
    return (!~index
      ? room
      : room.update('users', users => users.remove(index)));
  })
});