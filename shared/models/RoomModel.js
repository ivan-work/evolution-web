import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import {ensureParameter} from '~/shared/utils';

export class RoomModel extends Record({
  id: null
  , name: null
  , maxSize: 4
  , users: List()
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new RoomModel({
      ...js
      , users: List(js.users)
    });
  }

  static new(userId) {
    const id = uuid.v4().slice(0, 6);
    return new RoomModel({
      id: id
      , name: "Room " + id
      , users: userId ? List.of(userId) : List()
    })
  }

  join(userId) {
    ensureParameter(userId, 'string');
    return this.update('users', (users) => users.push(userId))
  }

  leave(userId) {
    ensureParameter(userId, 'string');
    let index = this.users.indexOf(userId);
    let newRoom;
    if (index === -1) throw new Error(RoomModel.ERRORS.room_error_user_not_in_room);
    return (this.users.size == 1
        ? null
        : this.update('users', users => users.remove(index))
    );
  }

  validateCanStart(userId) {
    if (!~this.users.indexOf(userId)) return RoomModel.ERRORS.room_error_user_not_in_room;
    if (this.users.get(0) !== userId) return RoomModel.ERRORS.room_error_user_not_host;
    if (this.users.size <= 1) return RoomModel.ERRORS.room_error_size_min;
    return true;
  }
}

RoomModel.ERRORS = {
  room_error_size_max: 'room_error_size_max'
  , room_error_size_min: 'room_error_size_min'
  , room_error_user_not_in_room: 'room_error_user_not_in_room'
  , room_error_user_not_host: 'room_error_user_not_host'
};