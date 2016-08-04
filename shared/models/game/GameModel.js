import {Record, Map, Range, List} from 'immutable';

import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';

import uuid from 'node-uuid';

export class GameModel extends Record({
  id: null
  , roomId: null
  , deck: Range(0, 12).map(i => CardModel.new(i)).toList()
  , players: Map()
  , board: Map()
}) {
  toClient(userId) {
    return this
      .set('deck', this.deck.size)
      .set('players', this.players.map(player => player.id === userId ? player : player.toClient()))
  }

  static fromServer(js) {
    return js == null
      ? null
      : new GameModel({
      ...js
      , players: Map(js.players).map(p => PlayerModel.fromServer(p))
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

export class GameModelClient extends Record({
  id: null
  , roomId: null
  , deck: -1
  , players: null
  , board: null
  , hand: List()
}) {
  static fromGameModel(game, userId) {
    return new GameModelClient(game)
      .set('hand', game.players.getIn([userId, 'hand'], List()));
  }
}