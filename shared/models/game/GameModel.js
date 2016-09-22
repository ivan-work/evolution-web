import {Record, Map, Range, List} from 'immutable';

import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';
import * as cardTypes from './evolution/cards';

import uuid from 'node-uuid';
import {ensureParameter} from '~/shared/utils';

export const TEST_DECK_SIZE = 24;
export const TEST_HAND_SIZE = 6;

export const PHASE = {
  NONE: 0
  , DEPLOY: 1
  , EAT: 2
  , DIE: 3
};

const StatusRecord = Record({
  turn: 0
  , round: 0
  , player: 0
  , phase: PHASE.NONE
});

export class GameModel extends Record({
  id: null
  , roomId: null
  , deck: null
  , players: Map()
  , board: Map()
  , started: false
  , status: new StatusRecord()
}) {
  static new(room) {
    return new GameModel({
      id: uuid.v4().slice(0,4)
      , roomId: room.id
      , deck: List(shuffle([
        [12, cardTypes.CardCamouflage]
        , [12, cardTypes.CardCarnivorous]
      ].reduce((result, config) => result.concat(Array.from({length: config[0]}).map(u => CardModel.new(config[1]))), [])))
      , players: room.users.reduce((result, userId, index) => result.set(userId, PlayerModel.new(userId, index)), Map())
    })
  }

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
      , status: new StatusRecord(js.status)
    });
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

function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}