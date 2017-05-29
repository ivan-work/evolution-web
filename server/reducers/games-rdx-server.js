import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter, validateParameter} from '../../shared/utils';
import {Map, List, OrderedMap} from 'immutable';
import {GameModel, QuestionRecord, PHASE} from '../../shared/models/game/GameModel';
import {CardModel} from '../../shared/models/game/CardModel';
import {CooldownList} from '../../shared/models/game/CooldownList';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';
import {TraitModel, TraitData} from '../../shared/models/game/evolution/TraitModel';
import {TraitDataModel} from '../../shared/models/game/evolution/TraitDataModel';
import {
  CTT_PARAMETER,
  TRAIT_TARGET_TYPE,
  TRAIT_ANIMAL_FLAG,
  ANIMAL_DEATH_REASON
} from '../../shared/models/game/evolution/constants';
import * as tt from '../../shared/models/game/evolution/traitTypes';

import {TraitNeoplasm} from '../../shared/models/game/evolution/traitsData/cons';

/**
 * TRAITS
 */

/**
 * LOGGING
 * */

//const addToGameLog = (message) => (game) => game.update('log', log => log.push(message));
const addToGameLog = (message) => (game) => game.update('log', log => log.push({
  timestamp: Date.now()
  , message
}));

export const logAnimal = animal => animal && ['$Animal'].concat(animal.traits.toArray()
  .filter(trait => !trait.getDataModel().hidden)
  .map(trait => trait.type));

const logAnimalById = (game, animalId) => {
  return logAnimal(game.locateAnimal(animalId));
};

const logTrait = (game, traitId) => {
  if (!!TraitData[traitId]) {
    return traitId;
  } else {
    return traitId;
    // const {trait} = game.locateTrait(traitId);
    // return trait && trait.type;
  }
};

/**
 * OK LETS REDUCE!
 */

export const gameStart = game => game
  .setIn(['status', 'phase'], PHASE.DEPLOY)
  .setIn(['status', 'round'], 0);
//.setIn(['status', 'currentPlayer'], 0); // TODO RANDOMIZE

export const gameGiveCards = (game, {userId, cards}) => {
  ensureParameter(userId, 'string');
  ensureParameter(cards, List);
  return game
    .update('deck', deck => deck.skip(cards.size))
    .updateIn(['players', userId, 'hand'], hand => hand.concat(cards))
    .update(addToGameLog(['gameGiveCards', userId, cards.size]));
};

const gameDeployAnimal = (animal, card, position) => (game) => {
  //console.log('gameDeployAnimal', animal)
  return game
    .updateIn(['players', animal.ownerId, 'continent'], continent => OrderedMap(continent.entrySeq().splice(position, 0, [animal.id, animal])));
};

export const gameDeployAnimalFromHand = (game, {userId, animal, animalPosition, cardId}) => {
  const {card, cardIndex} = game.locateCard(cardId, userId);
  return game
    .removeIn(['players', userId, 'hand', cardIndex])
    .update(gameDeployAnimal(animal, card, animalPosition))
    .update(addToGameLog(['gameDeployAnimal', userId]));
};

export const gameDeployAnimalFromDeck = (game, {animal, sourceAid}) => {
  const ending = game.deck.size === 1;
  const parent = game.locateAnimal(sourceAid);
  const animalIndex = game.getPlayer(parent.ownerId).continent.keySeq().keyOf(sourceAid);
  const card = game.getIn(['deck', 0]);
  return game
    .update(game => !ending ? game
      : game
      .update('players', players => players.map(player => player
        .update('continent', continent => continent.map(animal => animal.setIn(['flags', TRAIT_ANIMAL_FLAG.HIBERNATED], false))))))
    .update('deck', deck => deck.skip(1))
    .update(gameDeployAnimal(animal, card, animalIndex + 1))
    .update(addToGameLog(['traitGiveBirth', logAnimal(parent)]));
};

export const gameDeployTrait = (game, {cardId, traits}) => {
  const {playerId: cardOwnerId, cardIndex} = game.locateCard(cardId);
  const animals = [];
  return game
    .removeIn(['players', cardOwnerId, 'hand', cardIndex])
    .update(game => traits.reduce((game, trait) => {
      const animal = game.locateAnimal(trait.hostAnimalId);
      animals.push(logAnimal(animal));
      return game.updateIn(['players', animal.ownerId, 'continent', trait.hostAnimalId], a => a.traitAttach(trait))
    }, game))
    .update(addToGameLog(['gameDeployTrait', cardOwnerId, traits[0].type].concat(animals)));
};

export const traitAnimalRemoveTrait = (game, {sourcePid, sourceAid, traitId}) => game
  .updateIn(['players', sourcePid, 'continent'], continent => continent
    .map(a => a.traitDetach(trait => trait.id === traitId || trait.linkId === traitId)));

export const traitAnimalAttachTrait = (game, {sourcePid, sourceAid, trait}) => game
  .updateIn(['players', sourcePid, 'continent', sourceAid], animal => animal.traitAttach(trait));

export const playerActed = (game, {userId}) => {
  return game
    .setIn(['players', userId, 'acted'], true)
    .update('cooldowns', cooldowns => cooldowns.eventNextAction());
};

export const gameEndTurn = (game, {userId}) => {
  //console.log('gameEndTurn for ' + userId);
  ensureParameter(userId, 'string');
  let endedAlready, endedNow;
  return game
    .updateIn(['players', userId], player => {
      endedAlready = player.ended;
      endedNow = !player.acted;
      if (endedAlready) logger.silly(`Player#${player.id} already ended.`);
      if (endedNow) logger.silly(`Player#${player.id} ended by skipping.`);
      return player
        .set('ended', endedNow)
    })
    .update(addToGameLog(['gameEndTurn', userId, endedNow, endedAlready]));
};

export const gameNextPlayer = (game, {round, nextPlayerId, nextPlayerIndex, roundChanged, turnTime}) => game
  .setIn(['players', nextPlayerId, 'acted'], false)
  .setIn(['status', 'currentPlayer'], nextPlayerIndex)
  .updateIn(['status', 'round'], round => roundChanged ? round + 1 : round)
  .update('cooldowns', cooldowns => cooldowns.eventNextPlayer(roundChanged))
  .update(addToGameLog(['gameNextPlayer', nextPlayerId]));

export const gameAddTurnTimeout = (game, {turnStartTime, turnDuration}) => game
  .setIn(['status', 'turnStartTime'], turnStartTime)
  .setIn(['status', 'turnDuration'], turnDuration);

export const gameSetUserTimedOut = (game, {playerId, timedOut}) => game.setIn(['players', playerId, 'timedOut'], timedOut);

export const gameSetUserWantsPause = (game, {userId, wantsPause}) => game.setIn(['players', userId, 'wantsPause'], wantsPause);

export const gameSetPaused = (game, {paused}) => game.setIn(['status', 'paused'], paused);

/**
 * GAME PHASES
 * */

export const gameStartTurn = (game) => {
  const roundPlayer = game.status.roundPlayer;
  const nextRoundPlayer = (roundPlayer + 1) % game.players.size;
  return game
    .updateIn(['status', 'turn'], turn => ++turn)
    .setIn(['status', 'roundPlayer'], nextRoundPlayer)
    .setIn(['food'], 0)
    .update('cooldowns', cooldowns => cooldowns.eventNextTurn());
};

export const gameStartDeploy = (game) => {
  return game
    .update('players', players => players.map(player => player
      .set('ended', !player.playing)
      .update('continent', continent => continent.map(animal => animal
        .set('food', 0)
        .set('flags', Map())
        .update('traits', traits => traits
          .map(trait => trait.type === 'TraitIntellect' ? trait.set('value', false) : trait)
        )
        .recalculateDisabling()
      ))
    ))
    .setIn(['status', 'round'], 0)
};

export const gameStartFeeding = (game, {food}) => {
  ensureParameter(food, 'number');
  return game
    .update('players', players => players.map(player => player
      .set('ended', !player.playing)
    ))
    .setIn(['food'], food)
    .setIn(['status', 'round'], 0)
    .update(processNeoplasm)
};

const processNeoplasm = (game) => {
  let deadAnimals = [];
  return game
    .update('players', players => players.map(player => player.update('continent', continent => continent
        .map(animal => {
          const traitNeoplasm = animal.hasTrait(tt.TraitNeoplasm);
          if (!traitNeoplasm) return animal;
          const updatedAnimal = TraitNeoplasm.customFns.actionMoveInAnimal(animal);
          if (updatedAnimal) {
            return updatedAnimal.recalculateDisabling();
          } else {
            deadAnimals.push(animal.id);
            return animal;
          }
        })
      // .map(animal => {
      //   console.log(animal.traits);
      //   return animal;
      // })
    )))
    .update(game => deadAnimals.reduce(
      (game, animalId) => animalDeath(game, {type: ANIMAL_DEATH_REASON.NEOPLASM, animalId})
      , game));
};

export const gameStartExtinct = (game) => game
  .update('players', players => players.map(player => player
    .update('continent', continent => continent.map(animal => animal.digestFood()))
  ));

export const gameStartRegeneration = (game) => game
  .setIn(['status', 'round'], 0);

const gameStartPhaseUpdate = {
  [PHASE.PREPARE]: (game) => game
  , [PHASE.DEPLOY]: gameStartDeploy
  , [PHASE.FEEDING]: gameStartFeeding
  , [PHASE.AMBUSH]: (game) => game
  , [PHASE.EXTINCTION]: gameStartExtinct
  , [PHASE.REGENERATION]: gameStartRegeneration
  , [PHASE.FINAL]: (game) => game
};

export const gameStartPhase = (game, {phase, timestamp, data}) => (game
    .setIn(['status', 'phase'], phase)
    .setIn(['status', 'turnStartTime'], timestamp)
    .update(addToGameLog(['gameStartPhase', phase, data]))
    .update(game => gameStartPhaseUpdate[phase](game, data))
);

/**
 * Traits
 * */

export const gameDeployRegeneratedAnimal = (game, {userId, cardId, animalId, source}) => game
    .update(game => {
      if (source === 'DECK') {
        return game.update('deck', deck => deck.skip(1))
      } else {
        const {cardIndex} = game.locateCard(cardId, userId);
        return game.removeIn(['players', userId, 'hand', cardIndex]);
      }
    })
    .update(game => traitSetAnimalFlag(game, {sourceAid: animalId, flag: TRAIT_ANIMAL_FLAG.REGENERATION, on: false}))
  ;

export const traitMoveFood = (game, {animalId, amount, sourceType, sourceId}) => {
  ensureParameter(animalId, 'string');
  ensureParameter(amount, 'number');
  const animal = game.locateAnimal(animalId);
  const another = game.locateAnimal(sourceId);

  const updatedGame = game
    .updateIn(['players', animal.ownerId, 'continent', animal.id], animal => animal.receiveFood(amount))
    .update(addToGameLog(['traitMoveFood', amount, sourceType, logAnimal(animal), logAnimal(another)]));


  return sourceType === 'GAME' ? updatedGame.update('food', food => food - amount)
    : sourceType === tt.TraitPiracy ? updatedGame.updateIn(['players', another.ownerId, 'continent', sourceId, 'food'], food =>
    Math.max(food - amount, 0))
    : updatedGame;
};

export const animalDeath = (game, {type, animalId, data}) => {
  const animal = game.locateAnimal(animalId);
  const shell = animal.hasTrait(tt.TraitShell);
  return game
    .updateIn(['players', animal.ownerId, 'scoreDead'], scoreDead => scoreDead + 1 + animal.traits.size + (!!shell ? -1 : 0))
    .removeIn(['players', animal.ownerId, 'continent', animalId])
    .updateIn(['players', animal.ownerId, 'continent'], continent => continent
      .map(a => a.traitDetach(trait => trait.linkAnimalId === animal.id)))
    .updateIn(['continents', 'standard', 'shells'], shells => shell ? shells.set(shell.id, shell) : shells)
    .update(addToGameLog(['animalDeath', type, logAnimal(animal)]));
};

export const startCooldown = (game, {link, duration, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.startCooldown(link, duration, place, placeId));

export const clearCooldown = (game, {link, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.clearCooldown(link, place, placeId));

// Transferring new game for game.end
export const gameEnd = (oldGame, {game}) => {
  const scoreboard = game.players.reduce((result, player, playerId) => result.concat([{
    playerId
    , playing: player.playing
    , scoreNormal: player.countScore()
    , scoreDead: player.scoreDead
  }]), []);

  const scoreboardFinal = scoreboard.sort((p1, p2) =>
    !p1.playing ? 1
      : !p2.playing ? -1
      : p2.scoreNormal !== p1.scoreNormal ? p2.scoreNormal - p1.scoreNormal
      : p1.scoreDead !== p2.scoreDead ? p2.scoreDead - p1.scoreDead
      : 1 - Math.round(Math.random()) * 2);

  return game
    .set('scoreboardFinal', scoreboardFinal)
    .set('winnerId', scoreboardFinal[0].playerId)
    .setIn(['status', 'phase'], PHASE.FINAL);
};

export const gamePlayerLeft = (game, {userId}) => game
  .setIn(['players', userId, 'hand'], List())
  .setIn(['players', userId, 'playing'], false)
  .setIn(['players', userId, 'ended'], true);

export const traitQuestion = (game, {question}) => game
  .set('question', question);

export const traitAnswerSuccess = (game, {questionId}) => game
  .remove('question');

export const traitGrazeFood = (game, {food}) => game
  .set('food', Math.max(game.food - 1, 0));

export const traitParalyze = (game, {animalId}) => {
  const animal = game.locateAnimal(animalId);
  return game
    .update(game => traitSetAnimalFlag(game, {sourceAid: animalId, flag: TRAIT_ANIMAL_FLAG.PARALYSED, on: true}))
    .updateIn(['players', animal.ownerId, 'continent', animal.id], animal => animal.recalculateDisabling());
};

export const traitConvertFat = (game, {sourceAid, traitId}) => {
  const animal = game.locateAnimal(sourceAid);

  return game.updateIn(['players', animal.ownerId, 'continent', animal.id], animal => {
    const traitIndex = animal.traits.valueSeq().findIndex(t => t.id === traitId);
    const availableFat = animal.traits.take(traitIndex + 1).filter(trait => trait.type === tt.TraitFatTissue && trait.value).size;
    let fatCounter = availableFat;
    return animal
      .update('traits', traits => traits.map(trait =>
        (trait.type === tt.TraitFatTissue && trait.value) ? trait.set('value', fatCounter-- <= 0)
          : trait))
      .receiveFood(availableFat)
  });
};

export const traitSetAnimalFlag = (game, {sourceAid, flag, on}) => {
  const animal = game.locateAnimal(sourceAid);
  return game
    .setIn(['players', animal.ownerId, 'continent', animal.id, 'flags', flag], on);
};

export const traitSetValue = (game, {sourceAid, traitId, value}) => {
  const animal = game.locateAnimal(sourceAid);
  return game
    .setIn(['players', animal.ownerId, 'continent', animal.id, 'traits', traitId, 'value'], value);
};

const traitNotify_Start_getTarget = {
  'TraitCommunication': (game, animalId) => [logAnimalById(game, animalId)]
  , 'TraitCooperation': (game, animalId) => [logAnimalById(game, animalId)]
  , 'TraitPoisonous': (game, animalId) => [logAnimalById(game, animalId)]
  , [TRAIT_TARGET_TYPE.ANIMAL]: (game, animalId) => [logAnimalById(game, animalId)]
  , [TRAIT_TARGET_TYPE.TRAIT]: (game, targetId) => [logTrait(game, targetId)]
  , [TRAIT_TARGET_TYPE.TWO_TRAITS]: (game, trait1Id, trait2Id) => [logTrait(game, trait1Id), logTrait(game, trait2Id)]
  , default: () => []
};

export const traitNotify_Start = (game, {sourceAid, traitId, traitType, targets}) => {
  if (targets[0] === true) return game;
  const animal = game.locateAnimal(sourceAid);
  const targetType = TraitDataModel.new(traitType).targetType;
  const getTarget = traitNotify_Start_getTarget[traitType]
    || traitNotify_Start_getTarget[targetType]
    || traitNotify_Start_getTarget.default;
  const logTargets = getTarget(game, ...targets);
  return game.update(addToGameLog(['traitNotify_Start', logAnimal(animal), traitType].concat(logTargets)));
};

export const traitTakeShell = (game, {continentId, animalId, trait}) => {
  const animal = game.locateAnimal(animalId);
  return game
    .removeIn(['continents', continentId, 'shells', trait.id])
    .updateIn(['players', animal.ownerId, 'continent', animal.id], a => a.traitAttach(trait))
    .update(addToGameLog(['traitTakeShell', logAnimal(animal)]));
};

export const traitAmbushActivate = (game, {animalId, on}) => game
  .setIn(['ambush', 'ambushers', animalId], on);
export const gameAmbushPushTarget = (game, {animalId}) => game
  .updateIn(['ambush', 'targets'], targets => targets.push(animalId));
export const gameAmbushUnshiftTarget = (game, {animalId}) => game
  .updateIn(['ambush', 'targets'], targets => targets.unshift(animalId));
export const gameAmbushPrepareStart = (game, {ambushRecord}) => game
  .setIn(['ambush'], ambushRecord);
export const gameAmbushPrepareEnd = (game) => game;
export const gameAmbushAttackStart = (game) => game
  .update('cooldowns', cooldowns => cooldowns.eventNextAction());
export const gameAmbushAttackEnd = (game) => game
  .setIn(['status', 'phase'], PHASE.FEEDING)
  .removeIn(['ambush']);

// No need to exports, serverside-only
const traitAddHuntingCallback = (game, {callback}) => game.update('huntingCallbacks', (list) => list.unshift(callback));
const traitClearHuntingCallbacks = (game, {}) => game.set('huntingCallbacks', List());

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => state.set(game.id, game)
  , gameDestroy: (state, data) => state.remove(data.gameId)
  , gameStart: (state, data) => state.update(data.gameId, game => gameStart(game, data))
  , gameGiveCards: (state, data) => state.update(data.gameId, game => gameGiveCards(game, data))
  , gameNextPlayer: (state, data) => state.update(data.gameId, game => gameNextPlayer(game, data))
  , gameAddTurnTimeout: (state, data) => state.update(data.gameId, game => gameAddTurnTimeout(game, data))
  , gameDeployAnimalFromHand: (state, data) => state.update(data.gameId, game => gameDeployAnimalFromHand(game, data))
  , gameDeployAnimalFromDeck: (state, data) => state.update(data.gameId, game => gameDeployAnimalFromDeck(game, data))
  , gameDeployTrait: (state, data) => state.update(data.gameId, game => gameDeployTrait(game, data))
  , gameDeployRegeneratedAnimal: (state, data) => state.update(data.gameId, game =>
    gameDeployRegeneratedAnimal(game, data))
  , gameEndTurn: (state, data) => state.update(data.gameId, game => gameEndTurn(game, data))
  , gameEnd: (state, data) => state.update(data.gameId, game => gameEnd(game, data))
  , gamePlayerLeft: (state, data) => state.update(data.gameId, game => gamePlayerLeft(game, data))
  , gameStartTurn: (state, data) => state.update(data.gameId, game => gameStartTurn(game, data))
  , gameStartPhase: (state, data) => state.update(data.gameId, game => gameStartPhase(game, data))
  , gameSetUserTimedOut: (state, data) => state.update(data.gameId, game => gameSetUserTimedOut(game, data))
  , gameSetUserWantsPause: (state, data) => state.update(data.gameId, game => gameSetUserWantsPause(game, data))
  , gameSetPaused: (state, data) => state.update(data.gameId, game => gameSetPaused(game, data))

  , traitAmbushActivate: (state, data) => state.update(data.gameId, game => traitAmbushActivate(game, data))
  , gameAmbushPushTarget: (state, data) => state.update(data.gameId, game => gameAmbushPushTarget(game, data))
  , gameAmbushUnshiftTarget: (state, data) => state.update(data.gameId, game => gameAmbushUnshiftTarget(game, data))
  , gameAmbushPrepareStart: (state, data) => state.update(data.gameId, game => gameAmbushPrepareStart(game, data))
  , gameAmbushPrepareEnd: (state, data) => state.update(data.gameId, game => gameAmbushPrepareEnd(game, data))
  , gameAmbushAttackStart: (state, data) => state.update(data.gameId, game => gameAmbushAttackStart(game, data))
  , gameAmbushAttackEnd: (state, data) => state.update(data.gameId, game => gameAmbushAttackEnd(game, data))

  , playerActed: (state, data) => state.update(data.gameId, game => playerActed(game, data))
  , animalDeath: (state, data) => state.update(data.gameId, game => animalDeath(game, data))
  , traitMoveFood: (state, data) => state.update(data.gameId, game => traitMoveFood(game, data))
  , startCooldown: (state, data) => state.update(data.gameId, game => startCooldown(game, data))
  , clearCooldown: (state, data) => state.update(data.gameId, game => clearCooldown(game, data))
  , traitQuestion: (state, data) => state.update(data.gameId, game => traitQuestion(game, data))
  , traitAnswerSuccess: (state, data) => state.update(data.gameId, game => traitAnswerSuccess(game, data))
  , traitAnimalAttachTrait: (state, data) => state.update(data.gameId, game => traitAnimalAttachTrait(game, data))
  , traitAnimalRemoveTrait: (state, data) => state.update(data.gameId, game => traitAnimalRemoveTrait(game, data))
  , traitConvertFat: (state, data) => state.update(data.gameId, game => traitConvertFat(game, data))
  , traitGrazeFood: (state, data) => state.update(data.gameId, game => traitGrazeFood(game, data))
  , traitParalyze: (state, data) => state.update(data.gameId, game => traitParalyze(game, data))
  , traitSetAnimalFlag: (state, data) => state.update(data.gameId, game => traitSetAnimalFlag(game, data))
  , traitSetValue: (state, data) => state.update(data.gameId, game => traitSetValue(game, data))
  , traitNotify_Start: (state, data) => state.update(data.gameId, game => traitNotify_Start(game, data))
  // , traitNotify_End: (state, data) => state.update(data.gameId, game => traitNotify_End(game, data))
  , traitTakeShell: (state, data) => state.update(data.gameId, game => traitTakeShell(game, data))
  , traitAddHuntingCallback: (state, data) => state.update(data.gameId, game => traitAddHuntingCallback(game, data))
  , traitClearHuntingCallbacks: (state, data) => state.update(data.gameId, game =>
    traitClearHuntingCallbacks(game, data))
  , testHackGame: (state, data) => state.update(data.gameId, data.callback)
});