import {Record, Map, Range, List} from 'immutable';

import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';

import uuid from 'node-uuid';
import {ensureParameter} from '~/shared/utils';

export const TEST_DECK_SIZE = 24;
export const TEST_HAND_SIZE = 6;

export class GameModel extends Record({
  id: null
  , roomId: null
  , deck: null
  , players: Map()
  , board: Map()
  , started: false
}) {
  toClient(userId) {
    return this
      .set('deck', this.deck.size)
      .set('players', this.players.map(player => player.id === userId ? player : player.toOthers()))
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
      , deck: CardModel.generate(TEST_DECK_SIZE)
      , players: room.users.reduce((result, userId) => result.set(userId, PlayerModel.new(userId)), Map())
    })
  }

  leave(userId) {
    ensureParameter(userId, 'string');
    return (this.players.size == 1
      ? null
      : this.removeIn(['players', userId]));
  }
}

export class GameModelClient extends Record({
  id: null
  , userId: null
  , roomId: null
  , deck: -1
  , started: false
  , players: null
}) {
  static fromServer(js, userId) {
    const game = GameModel.fromServer(js);
    return game == null
      ? null
      : new GameModelClient(game)
      .set('userId', userId);
  }

  getPlayer() {
    return this.players.get(this.userId);
  }
}