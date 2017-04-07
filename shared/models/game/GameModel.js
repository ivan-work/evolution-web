import {Record, Map, Range} from 'immutable';

import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';

import uuid from 'node-uuid';

export class GameModel extends Record({
  id: null
  , roomId: null
  , deck: Range(0, 36).map(i => CardModel.new(i)).toList()
  , players: Map()
  //, field: Map()
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new GameModel({
      ...js
      , players: Map(js.players).map(p => PlayerModel.fromJS(p))
    });
  }
  static new(room) {
    return new GameModel({
      id: uuid.v4()
      , roomId: room.id
      //, deck: DeckModel.new()
      , players: room.users.reduce((result, userId) => result.set(userId, PlayerModel.new(userId)), Map())
    })
  }
}