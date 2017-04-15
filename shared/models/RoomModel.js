import {Record, List, Map} from 'immutable';
import uuid from 'uuid';
import {SettingsRecord} from './game/GameSettings';
import {ChatModel} from './ChatModel';

import {passesChecks} from '../actions/checks';
import {checkComboRoomCanStart} from '../actions/rooms.checks';

export const ROOM_STATUS = {
  LOBBY: 0
  , GAME: 1
  , FINISHED: 2
};

export class VotingModel extends Record({
  votes: Map()
  , timestamp: null
}) {
  static START_VOTING_TIMEOUT = !process.env.TEST ? 15 * 1000 : 500;

  static new(timestamp) {
    return new VotingModel({timestamp: timestamp})
  }

  static fromJS(js) {
    return !js ? null
      : new VotingModel({...js, votes: Map(js.votes)});
  }
}

export class RoomModel extends Record({
  id: null
  , name: null
  , settings: new SettingsRecord()
  , users: List()
  , spectators: List()
  , banlist: List()
  , gameId: null
  , chat: ChatModel.new()
  , timestamp: null
  , status: ROOM_STATUS.LOBBY
  // Voting
  , votingForStart: null
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
      , votingForStart: VotingModel.fromJS(js.votingForStart)
    });
  }

  static new() {
    const id = uuid.v4();
    return new RoomModel({
      id: id
      , name: 'Room ' + id.slice(0, 4)
      , users: List()
      , timestamp: Date.now()
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