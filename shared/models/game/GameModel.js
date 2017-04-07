import {Record, Map, OrderedMap, Range, List} from 'immutable';

import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';
import {CooldownList} from './CooldownList';
import {SettingsRecord, DeckVariants} from './GameSettings';

import uuid from 'uuid';
import {ensureParameter} from '../../utils';
import {getRandom} from '../../utils/randomGenerator';

import {parseFromRoom, parseCardList, parseAnimalList} from './GameModel.parse';

export const TEST_DECK_SIZE = 24;
export const TEST_HAND_SIZE = 6;

export const PHASE = {
  PREPARE: 0
  , DEPLOY: 1
  , FEEDING: 2
  , FINAL: 3
};

export const StatusRecord = Record({
  turn: 0
  , round: 0
  , currentPlayer: 0
  , roundPlayer: 0
  , phase: PHASE.PREPARE
  , time: null
});

export const QuestionRecord = Record({
  id: null
  , time: null
  , sourcePid: null
  , sourceAid: null
  , traitType: null
  , targetPid: null
  , targetAid: null
});

const rollDice = () => getRandom(1, 6);

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

const GameModelData = {
  id: null
  , roomId: null
  , deck: null
  , players: OrderedMap()
  , food: -1
  , started: false
  , status: new StatusRecord()
  , cooldowns: CooldownList.new()
  , question: null
  , settings: null
  , scoreboardFinal: null
  , winnerId: null
};

export class GameModel extends Record(GameModelData) {
  static generateDeck(config, shuffle) {
    const result = config.reduce((result, [count, type]) => result
      .concat(Array.from({length: count})
        .map(u => CardModel.new(type))), []);
    return List(shuffle ? doShuffle(result) : result);
  }

  generateFood() {
    return FOOD_TABLE[this.players.size]();
  }

  static new(room) {
    const deck = room.settings.decks.reduce((result, deckName) => result.concat(DeckVariants[deckName]), List());

    return new GameModel({
      id: uuid.v4().slice(0, 4)
      , roomId: room.id
      , deck: GameModel.generateDeck(deck, true)
      , players: room.users.reduce((result, userId, index) => result.set(userId, PlayerModel.new(userId, index)), Map())
      , settings: room.settings
    })
  }

  toOthers(userId) {
    return this
      .set('deck', this.deck.map(card => card.toOthers()))
      .set('players', this.players.map(player => player.id === userId ? player : player.toOthers()))
  }

  toClient() {
    // TODO question
    return this
      .set('deck', this.deck.map(card => card.toClient()))
      .set('players', this.players.map(player => player.toClient()));
  }

  static fromServer(js) {
    return js == null
      ? null
      : new GameModel({
      ...js
      , deck: List(js.deck).map(c => CardModel.fromServer(c))
      , players: OrderedMap(js.players).map(p => PlayerModel.fromServer(p)).sort((p1, p2) => p1.index > p2.index)
      , status: new StatusRecord(js.status)
      , cooldowns: CooldownList.fromServer(js.cooldowns)
      , settings: SettingsRecord.fromJS(js.settings)
    });
  }

  end() {
    let scoreboard = [];
    let winnerId = null;
    let maxScore = -1;
    this.players.forEach((player, playerId) => {
      const score = player.countScore();
      if (player.playing && score > maxScore) {
        winnerId = playerId;
        maxScore = score;
      }
      scoreboard.push({
        playerId
        , score
      })
    });
    scoreboard = scoreboard.sort((p1, p2) => p1.score < p2.score);
    return this
      .set('scoreboardFinal', scoreboard)
      .set('winnerId', winnerId)
      .setIn(['status', 'phase'], PHASE.FINAL);
  }

  makeScoreboard() {
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

  locateAnimal(animalId) {
    let playerId = null, animalIndex = -1;
    this.players.some(player => {
      animalIndex = player.continent.findIndex(animal => animal.id === animalId);
      if (~animalIndex) {
        playerId = player.id;
        return true;
      }
    });
    const animal = playerId !== null ? this.getPlayer(playerId).getAnimal(animalIndex) : null;
    return {playerId, animalIndex, animal};
  }

  locateCard(cardId) {
    let playerId = null, cardIndex = -1;
    this.players.some(player => {
      cardIndex = player.hand.findIndex(card => card.id === cardId);
      if (~cardIndex) {
        playerId = player.id;
        return true;
      }
    });
    const card = playerId !== null ? this.getPlayer(playerId).getCard(cardIndex) : null;
    return {playerId, cardIndex, card};
  }

  static sortPlayersFromIndex(game, index) {
    if (index === void 0) index = game.status.roundPlayer;
    const playersList = game.players.toList();
    return playersList.slice(index).concat(playersList.slice(0, index));
  }
}

export class GameModelClient extends Record({
  ...GameModelData
  , userId: null
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
      ? (this.players.get(this.userId))
      : pid.id
      ? (this.players.get(pid.id))
      : (this.players.get(pid));
  }

  isPlayerTurn(userId) {
    return this.getPlayer(userId).index === this.status.currentPlayer
      && (this.status.phase === PHASE.DEPLOY || this.status.phase === PHASE.FEEDING);
  }

  isDeploy() {
    return this.status.phase === PHASE.DEPLOY;
  }

  isFeeding() {
    return this.status.phase === PHASE.FEEDING;
  }
}

GameModel.parse = parseFromRoom;
GameModel.parseCardList = parseCardList;
GameModel.parseAnimalList = parseAnimalList;
GameModelClient.prototype.end = GameModel.prototype.end;
GameModelClient.prototype.getPlayerCard = GameModel.prototype.getPlayerCard;
GameModelClient.prototype.getPlayerAnimal = GameModel.prototype.getPlayerAnimal;
GameModelClient.prototype.locateAnimal = GameModel.prototype.locateAnimal;
GameModelClient.prototype.locateCard = GameModel.prototype.locateCard;

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