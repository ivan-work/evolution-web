import {Record, List} from 'immutable';
import uuid from 'uuid';
import {SettingsRecord} from './game/GameSettings';

import {passesChecks} from '../actions/checks';
import {checkComboRoomCanStart} from '../actions/rooms.checks';

export class RoomModel extends Record({
  id: null
  , name: null
  , settings: new SettingsRecord()
  , users: List()
  , gameId: null
  , banlist: List()
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new RoomModel({
      ...js
      , users: List(js.users)
      , settings: SettingsRecord.fromJS(js.settings)
      , banlist: List(js.banlist)
    });
  }

  static new() {
    const id = uuid.v4()
    return new RoomModel({
      id: id
      , name: "Room " + id
      , users: List()
    })
  }

  checkCanStart(userId) {
    return passesChecks(() => {
      checkComboRoomCanStart(this, userId);
    });
  }
}