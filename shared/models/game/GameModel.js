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

const rollDice = () => Math.floor(6 * Math.random()) + 1;
const FOOD_TABLE = [
  () => 10
  , () => 10
  , () => rollDice() + 2
  , () => rollDice() + rollDice()
  , () => rollDice() + rollDice() + 2
  , () => rollDice() + rollDice() + rollDice() + 2
  , () => rollDice() + rollDice() + rollDice() + 4
  , () => rollDice() + rollDice() + rollDice() + rollDice() + 2
  , () => rollDice() + rollDice() + rollDice() + rollDice() + 4
];

export class GameModel extends Record({
  id: null
  , roomId: null
  , deck: null
  , players: Map()
  , board: Map()
  , started: false
  , status: new StatusRecord()
}) {
  static generateDeck(config, shuffle) {
    const result = config.reduce((result, config) => result.concat(Array.from({length: config[0]}).map(u => CardModel.new(config[1]))), []);
    return List(shuffle ? doShuffle(result) : result);
  }

  static generateFood() {
    return FOOD_TABLE[this.players.size];
  }

  static new(room) {
    return new GameModel({
      id: uuid.v4().slice(0, 4)
      , roomId: room.id
      , deck: GameModel.generateDeck([
        [8, cardTypes.CardCamouflage]
        , [8, cardTypes.CardCarnivorous]
        , [8, cardTypes.CardSharpVision]
      ], true)
      , players: room.users.reduce((result, userId, index) => result.set(userId, PlayerModel.new(userId, index)), Map())
    })
  }

  toClient(userId) {
    return this
      .set('deck', CardModel.generate(this.deck.size))
      .set('players', this.players.map(player => player.id === userId ? player : player.toOthers()))
  }

  static fromServer(js) {
    return js == null
      ? null
      : new GameModel({
      ...js
      , deck: List(js.deck).map(c => CardModel.fromServer(c))
      , players: Map(js.players).map(p => PlayerModel.fromServer(p))
      , status: new StatusRecord(js.status)
    });
  }

  start() {
    return this
      .setIn(['started'], true)
      .setIn(['status', 'phase'], PHASE.DEPLOY)
  }

  leave(userId) {
    ensureParameter(userId, 'string');
    return (this.players.size == 1
      ? null
      : this.removeIn(['players', userId]));
  }

  getPlayer(pid) {
    return pid.id
      ? this.players.get(pid.id)
      : this.players.get(pid);
  }

  getPlayerCard(pid, index) {
    return this.getPlayer(pid).hand.get(index);
  }

  getPlayerAnimal(pid, index) {
    return this.getPlayer(pid).continent.get(index);
  }
}

export class GameModelClient extends Record({
  id: null
  , userId: null
  , roomId: null
  , deck: null
  , started: false
  , players: null
  , status: null
}) {
  static fromServer(js, userId) {
    const game = GameModel.fromServer(js);
    return game == null
      ? null
      : new GameModelClient(game)
      .set('userId', userId);
  }

  getPlayer(pid) {
    return pid === void 0 || pid === null
      ? this.players.get(this.userId)
      : pid.id
      ? this.players.get(pid.id)
      : this.players.get(pid);
  }
}

GameModelClient.prototype.start = GameModel.prototype.start;
GameModelClient.prototype.getPlayerCard = GameModel.prototype.getPlayerCard;
GameModelClient.prototype.getPlayerAnimal = GameModel.prototype.getPlayerAnimal;

// TODO move to utils
function doShuffle(array) {
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