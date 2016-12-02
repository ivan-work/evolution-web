import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import {ensureParameter} from '~/shared/utils';
import {SettingsRecord} from './game/GameSettings';

export class RoomModel extends Record({
  id: null
  , name: null
  , settings: new SettingsRecord()
  , users: List()
  , gameId: null
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new RoomModel({
      ...js
      , users: List(js.users)
      , settings: new SettingsRecord(js.settings)
    });
  }

  static new() {
    const id = uuid.v4().slice(0, 6);
    return new RoomModel({
      id: id
      , name: "Room " + id
      , users: List()
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

  checkCanStart(userId) {
    return this.validateCanStart(userId) === true;
  }

  validateCanStart(userId) {
    if (!~this.users.indexOf(userId)) return RoomModel.ERRORS.room_error_user_not_in_room;
    if (this.users.get(0) !== userId) return RoomModel.ERRORS.room_error_user_not_host;
    if (process.env.NODE_ENV !== 'development')
      if (this.users.size <= 1) return RoomModel.ERRORS.room_error_size_min;
    if (this.gameId !== null) return RoomModel.ERRORS.room_error_has_game;
    return true;
  }
}

RoomModel.ERRORS = {
  room_error_size_max: 'room_error_size_max'
  , room_error_size_min: 'room_error_size_min'
  , room_error_user_not_in_room: 'room_error_user_not_in_room'
  , room_error_user_not_host: 'room_error_user_not_host'
  , room_error_has_game: 'room_error_has_game'
};