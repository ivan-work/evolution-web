import {Record, List} from 'immutable';
import uuid from 'uuid';
import {SettingsRecord} from './game/GameSettings';
import {ChatModel} from './ChatModel';

import {passesChecks} from '../actions/checks';
import {checkComboRoomCanStart} from '../actions/rooms.checks';

export class RoomUser extends Record({
  id: null
  , name: null
  , isObserver: false
}) {
  static new(user) {
    return new RoomUser({id: user.id, name: user.login})
  }

  static fromJS(js) {
    return js == null
      ? null
      : new RoomUser(js);
  }
}

export class RoomModel extends Record({
  id: null
  , name: null
  , settings: new SettingsRecord()
  , users: List()
  , gameId: null
  , banlist: List()
  , chat: ChatModel.new()
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new RoomModel({
      ...js
      , users: List(js.users)
      , settings: SettingsRecord.fromJS(js.settings)
      , banlist: List(js.banlist)
      , chat: ChatModel.fromJS(js.chat)
    });
  }

  static new() {
    const id = uuid.v4()
    return new RoomModel({
      id: id
      , name: 'Room ' + id
      , users: List()
    })
  }

  toClient() {
    return this;
  }

  toOthers() {
    return this.remove('chat');
  }

  checkCanStart(userId) {
    return passesChecks(() => checkComboRoomCanStart(this, userId));
  }
}