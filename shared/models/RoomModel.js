import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import {ensureParameter} from '~/shared/utils';

const ROOM_MIN_USERS = 2;
const ROOM_MAX_USERS = 4;

export class RoomModel extends Record({
  id: null
  , name: null
  , maxUsers: 4
  , users: List()
  , gameId: null
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new RoomModel({
      ...js
      , users: List(js.users)
    });
  }

  static new() {
    const id = uuid.v4().slice(0, 6);
    return new RoomModel({
      id: id
      , name: "Room " + id
      , users: List()
      , maxUsers: 4
    })
  }

  join(userId) {
    ensureParameter(userId, 'string');
    return this.update('users', (users) => users.push(userId))
  }

  hasUser(userId) {
    ensureParameter(userId, 'string');
    return !!~this.users.indexOf(userId);
  }

  leave(userId) {
    ensureParameter(userId, 'string');
    let index = this.users.indexOf(userId);
    return (this.users.size == 1
      ? null
      : !~index
      ? this
      : this.update('users', users => users.remove(index)));
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