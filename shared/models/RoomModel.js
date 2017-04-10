import {Record, List, Map} from 'immutable';
import uuid from 'uuid';
import {SettingsRecord} from './game/GameSettings';
import {ChatModel} from './ChatModel';

import {passesChecks} from '../actions/checks';
import {checkComboRoomCanStart} from '../actions/rooms.checks';

export class RoomModel extends Record({
  id: null
  , name: null
  , settings: new SettingsRecord()
  , users: List()
  , spectators: List()
  , gameId: null
  , banlist: List()
  , chat: ChatModel.new()
  , timeCreate: 0
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new RoomModel({
      ...js
      , users: List(js.users)
      , spectators: List(js.spectators)
      , settings: SettingsRecord.fromJS(js.settings)
      , banlist: List(js.banlist)
      , chat: ChatModel.fromJS(js.chat)
    });
  }

  static new() {
    const id = uuid.v4();
    return new RoomModel({
      id: id
      , name: 'Room ' + id.slice(0, 4)
      , users: List()
      , timeCreate: Date.now()
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