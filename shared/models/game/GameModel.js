import logger from '../../utils/logger';
import {Record, Map, OrderedMap, Set, List} from 'immutable';

import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';
import {getTraitDataModel, TraitModel} from './evolution/TraitModel';
import {CooldownList} from './CooldownList';
import {
  SettingsRecord
  , Deck_Base
  , Deck_TimeToFly
  , Deck_ContinentsShort
  , Deck_Bonus
  , Deck_Plantarium
  , PlantDeck_Plantarium
} from './GameSettings';

import uuid from 'uuid';
import {ensureParameter} from '../../utils';
import {getIntRandom} from '../../utils/randomGenerator';
import {selectUserName} from '../../selectors';

import * as tt from './evolution/traitTypes';
import * as pt from './evolution/plantarium/plantTypes';
import PlantModel from "./evolution/plantarium/PlantModel";

export const TEST_DECK_SIZE = 84;
export const TEST_HAND_SIZE = 6;

export const PHASE = {
  PREPARE: 'PREPARE'
  , DEPLOY: 'DEPLOY'
  , FEEDING: 'FEEDING'
  , AMBUSH: 'AMBUSH'
  , EXTINCTION: 'EXTINCTION'
  , REGENERATION: 'REGENERATION'
  , FINAL: 'FINAL'
};

export const AREA = {
  STANDARD: 'STANDARD'
};

export const StatusRecord = Record({
  turn: 0
  , round: 0
  , currentPlayer: null
  , roundPlayer: null
  , phase: PHASE.PREPARE
  , turnStartTime: null
  , turnDuration: null
  , paused: false
});

export class QuestionRecord extends Record({
  id: null
  , type: null
  , userId: null
  , time: null
  , sourcePid: null
  , sourceAid: null
  , traitId: null
  , targetPid: null
  , targetAid: null
  , turnRemainingTime: null
}) {
  static new(type, userId, sourceEid, sourcePid, traitId, targetAnimal, turnRemainingTime) {
    return new QuestionRecord({
      id: uuid.v4()
      , type
      , userId
      , sourcePid: sourcePid
      , sourceAid: sourceEid
      , traitId
      , targetPid: targetAnimal.ownerId
      , targetAid: targetAnimal.id
      , time: Date.now()
      , turnRemainingTime
    });
  }

  static DEFENSE = 'DEFENSE';
  static INTELLECT = 'INTELLECT';

  static PLANT_COUNTERATTACK = 'PLANT_COUNTERATTACK';

  static fromJS(js) {
    return js == null ? null : new QuestionRecord(js);
  }

  toOthers() {
    return this.set('id', null);
  }

  toClient() {
    return this;
  }
}

export const FEEDING_SOURCE_TYPE = {
  GAME: 'GAME'
  , PLANT: 'PLANT'
};

const FeedingData = {
  gameId: null
  , targetAid: null
  , targetPid: null
  , amount: 1
  , sourceType: 'GAME'
  , sourceId: 'GAME'
  , helperId: null
  , auto: false
};

export class FeedingRecord extends Record(FeedingData) {
  static new(gameId, animal, amount, sourceType, sourceId, helperId, auto) {
    return new FeedingRecord({
      gameId,
      targetAid: animal.id,
      targetPid: animal.ownerId,
      amount,
      sourceType,
      sourceId,
      helperId,
      auto
    });
  }

  static fromJS(js) {
    return new FeedingRecord({...js});
  }
}

export class AmbushRecord extends Record({
  targets: List()
  , targetPlayerId: null
  , ambushers: OrderedMap()
  , turnRemainingTime: null
}) {
  static new(turnRemainingTime) {
    return new AmbushRecord({
      turnRemainingTime
    })
  }

  static fromServer(js) {
    // if (js) console.log('js.ambushers', js.ambushers)
    return (!js ? null
      : new AmbushRecord({
        ...js
        , ambushers: OrderedMap(js.ambushers)
      }));
  }
}

class AreaRecord extends Record({
  id: null
  , shells: Map()
  , food: 0
  , plants: OrderedMap()
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new AreaRecord({
        ...js
        , shells: Map(js.shells).map(TraitModel.fromServer)
      });
  }

  toClient() {
    return this;
  }
}

export const HuntRecord = Record({
  type: null
  , attackEntityId: null
  , attackPlayerId: null
  , attackTraitId: null
  , attackTraitType: null
  , targetAid: null
  , targetPid: null
  , flags: Set()
});

const AreasStandard = Map({[AREA.STANDARD]: new AreaRecord({id: AREA.STANDARD})});

const rollDice = () => getIntRandom(1, 6);

const FOOD_TABLE = [
// chosen by fair dice roll
// guaranteed to be random
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

export const PLANTS_TABLE = [
  (zero) => ({start: 3, spawn: 2, max: 4}) // 0 players
  , (one) => ({start: 3, spawn: 2, max: 4}) // 1 player
  , (players) => ({start: players + 1, spawn: 1, max: players * 2})
  , (players) => ({start: players + 1, spawn: 2, max: players * 2})
  , (players) => ({start: players + 1, spawn: 3, max: players * 2})
  , (players) => ({start: players + 1, spawn: 3, max: players * 2})
  , (players) => ({start: players + 1, spawn: 3, max: players * 2})
  , (players) => ({start: players + 1, spawn: 4, max: players * 2})
  , (players) => ({start: players + 1, spawn: 4, max: players * 2})
];

const GameModelData = {
  id: null
  , roomId: null
  , timeCreated: null
  , deck: null
  , deckPlants: null
  , deckPlantsDiscard: null
  , players: OrderedMap()
  , plants: OrderedMap()
  , areas: AreasStandard
  , observers: List()
  , log: List()
  , food: -1
  , status: new StatusRecord()
  , cooldowns: CooldownList.new()
  , question: null
  , settings: null
  , scoreboardFinal: null
  , winnerId: null
  , ambush: null
};

// global.locateAnimalTime = 0;

export const generateDeck = (config, shuffle) => {
  const result = config.reduce((result, [count, type]) => result
    .concat(Array.from({length: count})
      .map(u => CardModel.new(type))), []);
  return List(shuffle ? doShuffle(result) : result);
};

export const generatePlantDeck = (config, shuffle) => {
  const result = config.reduce((result, [count, type]) => result
    .concat(Array.from({length: count})
      .map(u => type)), []);
  return List(shuffle ? doShuffle(result) : result);
};

export class GameModel extends Record({
  ...GameModelData
  , hunts: List()
}) {
  generateFood() {
    let aedificatorFood = 0;
    this.someAnimal((animal, continent, player) => {
      if (animal.hasTrait(tt.TraitAedificator)) aedificatorFood += 2;
    });
    return FOOD_TABLE[this.getActualPlayers().size]() + aedificatorFood;
  }

  getPlantsConfig() {
    const playersSize = this.getActualPlayers().size;
    return PLANTS_TABLE[playersSize](playersSize);
  }

  getPlantsCountForSpawn() {
    const {spawn, max} = this.getPlantsConfig();
    const currentSize = this.plants.filter(plant => plant.type !== pt.PlantParasite).size;
    return Math.min(max - currentSize, spawn);
  }

  static new(room) {
    let deckConfig = Deck_Base;
    let deckPlantsConfig = [];

    if (room.settings.addon_timeToFly) deckConfig = deckConfig.concat(Deck_TimeToFly);
    if (room.settings.addon_continents) deckConfig = deckConfig.concat(Deck_ContinentsShort);
    if (room.settings.addon_bonus) deckConfig = deckConfig.concat(Deck_Bonus);
    if (room.settings.addon_plantarium) deckConfig = deckConfig.concat(Deck_Plantarium);
    if (room.settings.addon_plantarium) deckPlantsConfig = deckPlantsConfig.concat(PlantDeck_Plantarium);

    if (room.settings.halfDeck) deckConfig = deckConfig.map(([count, type]) => [Math.ceil(count / 2), type]);


    const players = (room.settings.randomPlayers
        ? doShuffle(room.users.toArray())
        : room.users
    ).reduce((result, userId, index) => result.set(userId, PlayerModel.new(userId, index)), OrderedMap());

    let deck = generateDeck(deckConfig, true);
    if (room.settings.addon_plantarium) {
      deck = deck.update(deck => deck.map(immcard => immcard.withMutations(card => {
        if (card.trait1 && getTraitDataModel(card.trait1).replaceOnPlantarium) {
          card.trait1 = getTraitDataModel(card.trait1).replaceOnPlantarium;
        }
        if (card.trait2 && getTraitDataModel(card.trait2).replaceOnPlantarium) {
          card.trait2 = getTraitDataModel(card.trait2).replaceOnPlantarium;
        }
        return card;
      })));
    }

    const deckPlants = generatePlantDeck(deckPlantsConfig, true);

    return new GameModel({
      id: uuid.v4()
      , roomId: room.id
      , timeCreated: Date.now()
      , deck
      , deckPlants
      , players
      , settings: room.settings
    })
      .setIn(['status', 'currentPlayer'], players.first().id)
      .setIn(['status', 'roundPlayer'], players.first().id)
  }

  static fromServer(js) {
    return js == null
      ? null
      : new GameModel({
        ...js
        , deck: List(js.deck).map(c => CardModel.fromServer(c))
        , deckPlants: js.deckPlants ? List(js.deckPlants) : null
        , deckPlantsDiscard: List(js.deckPlantsDiscard)
        , players: OrderedMap(js.players).map(PlayerModel.fromServer).sort((p1, p2) => p1.index > p2.index)
        , areas: Map(js.areas).map(AreaRecord.fromJS)
        , plants: OrderedMap(js.plants).map(PlantModel.fromJS)
        , status: new StatusRecord(js.status)
        , question: QuestionRecord.fromJS(js.question)
        , cooldowns: CooldownList.fromServer(js.cooldowns)
        , settings: SettingsRecord.fromJS(js.settings)
        , log: List(js.log)
        , hunts: List(js.hunts.map(HuntRecord))
        , ambush: AmbushRecord.fromServer(js.ambush)
      });
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
      .set('deckPlants', null)
      .set('players', this.players.map(player => player.toClient()).entrySeq())
      .set('plants', this.plants.map(plant => plant.toClient()).entrySeq())
      .set('areas', this.areas.map(area => area.toClient()))
      .remove('hunts')
  }

  toDatabase(getState, finished) {
    const game = this;
    return Map({
      id: game.id
      , roomId: game.roomId
      , timeCreated: game.timeCreated
      , timeEnd: Date.now()
      , players: game.players.map(player => ({
        id: player.id
        , name: selectUserName(getState, player.id)
        , playing: player.playing
        , index: player.index
      })).toArray()
      , settings: {
        maxPlayers: game.settings.maxPlayers
        , timeTurn: game.settings.timeTurn
        , timeTraitResponse: game.settings.timeTraitResponse
        , timeAmbush: game.settings.timeAmbush
        , randomPlayers: game.settings.randomPlayers
        , halfDeck: game.settings.halfDeck
        , addon_timeToFly: game.settings.addon_timeToFly
        , addon_continents: game.settings.addon_continents
        , addon_bonus: game.settings.addon_bonus
        , addon_plantarium: game.settings.addon_plantarium
      }
      , status: {
        turn: game.status.turn
        , round: game.status.round
      }
      , scoreboardFinal: game.scoreboardFinal
      , winnerId: game.winnerId
      , finished
    }).toJS();
  }

  getActualPlayers() {
    return this.players.filter(p => p.playing);
  }

  getPlayer(pid) {
    return pid.id
      ? this.players.get(pid.id)
      : this.players.get(pid);
  }

  getArea() {
    return this.areas.get(AREA.STANDARD);
  }

  getFood() {
    if (this.isPlantarium()) {
      return 0;
    } else {
      return this.food;
    }
  }

  isPlantarium() {
    return this.settings.addon_plantarium;
  }

  getPlant(plantId) {
    return this.plants.get(plantId);
  }

  getEntity(entityId) {
    return this.getPlant(entityId) || this.locateAnimal(entityId);
  }

  mapPlants(cb) {
    return this.update('plants', plants => plants.map(cb));
  }

  somePlant(cb) {
    return this.plants.some(cb);
  }

  getStartingHandCount() {
    return this.isPlantarium() ? 8 : 6;
  }

  // TODO remove
  getPlayerCard(pid, index) {
    return this.getPlayer(pid).hand.get(index);
  }

  /**
   * This callback is displayed as a global member.
   * @callback GamePerAnimalCallback
   * @param {AnimalModel} animal
   * @param {Continent} continent
   * @param {PlayerModel} player
   */

  /**
   * @param {GamePerAnimalCallback} cb
   */
  someAnimal(cb) {
    return this.get('players').some(player => player.someAnimal((a, c) => cb(a, c, player)));
  }

  locateAnimal(animalId, playerId = null) {
    if (!playerId) playerId = this.players.findKey(player => player.continent.has(animalId));
    return this.getIn(['players', playerId, 'continent', animalId], null);
  }

  locateTrait(traitId, animalId, playerId = null) {
    const animal = this.locateAnimal(animalId, playerId);
    if (animal) {
      return animal.traits.get(traitId);
    }
    const plant = this.getPlant(animalId);
    if (plant) {
      return plant.traits.get(traitId);
    }
    return null;
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

  sortPlayersFromIndex(players, index) {
    const game = this;
    if (index === void 0) index = game.getPlayer(game.status.roundPlayer).index;
    const playersList = players.toList();
    return playersList.slice(index).concat(playersList.slice(0, index));
  }

  gameNextPlayer(playerId) {
    return this
      .setIn(['status', 'currentPlayer'], playerId)
      .update('cooldowns', cooldowns => cooldowns.eventNextPlayer())
      .update('players', players => players.map(player => player
        .update('continent', continent => continent.map(animal => animal
          .update('traits', traits => traits.map(trait => trait.getDataModel().customFns.eventNextPlayer
            ? trait.getDataModel().customFns.eventNextPlayer(trait)
            : trait))
        ))
      ))
  }
}

export class GameModelClient extends Record({
  ...GameModelData
  , userId: null
}) {
  static fromServer(js, userId) {
    const game = GameModel.fromServer(js);
    return !game ? null
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
    if (!userId) userId = this.userId;
    return !!(
      userId
      && userId === this.status.currentPlayer
      && (this.status.phase === PHASE.DEPLOY || this.status.phase === PHASE.FEEDING));
  }
}

GameModelClient.prototype.getFood = GameModel.prototype.getFood;
GameModelClient.prototype.getArea = GameModel.prototype.getArea;
GameModelClient.prototype.getPlant = GameModel.prototype.getPlant;
GameModelClient.prototype.isPlantarium = GameModel.prototype.isPlantarium;
GameModelClient.prototype.sortPlayersFromIndex = GameModel.prototype.sortPlayersFromIndex;
GameModelClient.prototype.getActualPlayers = GameModel.prototype.getActualPlayers;
GameModelClient.prototype.getEntity = GameModel.prototype.getEntity;
GameModelClient.prototype.someAnimal = GameModel.prototype.someAnimal;
GameModelClient.prototype.mapPlants = GameModel.prototype.mapPlants;
GameModelClient.prototype.getPlayerCard = GameModel.prototype.getPlayerCard;
GameModelClient.prototype.locateAnimal = GameModel.prototype.locateAnimal;
GameModelClient.prototype.locateTrait = GameModel.prototype.locateTrait;
GameModelClient.prototype.locateCard = GameModel.prototype.locateCard;
GameModelClient.prototype.gameNextPlayer = GameModel.prototype.gameNextPlayer;

// TODO move to utils
function doShuffle(array) {
  if (!Array.isArray(array)) throw new Error('Not an array!');
  array = array.slice(0);
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