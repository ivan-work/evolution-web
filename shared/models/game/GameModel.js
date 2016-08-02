import {Record, List, Map} from 'immutable';

import {PlayerModel} from './PlayerModel';

import uuid from 'node-uuid';

export class GameModel extends Record({
  id: null
  , roomId: null
  //, deck: null
  , players: List()
  //, field: Map()
}) {
  static new(room) {
    return new GameModel({
      id: uuid.v4()
      , roomId: room.id
      //, deck: DeckModel.new()
      , players: room.get('users').map(userId => new PlayerModel(userId))
    })
  }
}