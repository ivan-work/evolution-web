import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter, validateParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, QuestionRecord, PHASE} from '../../shared/models/game/GameModel';
import {CardModel} from '../../shared/models/game/CardModel';
import {CooldownList} from '../../shared/models/game/CooldownList';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../shared/models/game/evolution/TraitModel';
import {TraitDataModel} from '../../shared/models/game/evolution/TraitDataModel';
import {CTT_PARAMETER, TRAIT_TARGET_TYPE, TRAIT_ANIMAL_FLAG} from '../../shared/models/game/evolution/constants';
import {TraitFatTissue, TraitShell, TraitAnglerfish} from '../../shared/models/game/evolution/traitTypes';

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

const logAnimal = animal => animal && ['$Animal'].concat(animal.traits.toArray()
  .filter(trait => !trait.getDataModel().hidden)
  .map(trait => trait.type));

const logAnimalById = (game, animalId) => {
  const {animal} = game.locateAnimal(animalId);
  return logAnimal(animal);
};

const logTrait = (game, traitId) => {
  const {animal, traitIndex} = game.locateTrait(traitId);
  const animalLog = logAnimal(animal);
  return ['$Trait', traitIndex].concat(animalLog.slice(1));
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
  if (card.trait1 === TraitAnglerfish) {
    animal = animal.traitAttach(TraitModel.new(TraitAnglerfish))
  }
  return game
    .updateIn(['players', animal.ownerId, 'continent'], continent => continent.splice(position, 0, animal))
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
  const {animalIndex, animal: parent} = game.locateAnimal(sourceAid);
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
      const {animalIndex, animal} = game.locateAnimal(trait.hostAnimalId);
      animals.push(logAnimal(animal));
      return game.updateIn(['players', animal.ownerId, 'continent', animalIndex], a => a.traitAttach(trait))
    }, game))
    .update(addToGameLog(['gameDeployTrait', cardOwnerId, traits[0].type].concat(animals)));
};

export const traitAnimalRemoveTrait = (game, {sourcePid, sourceAid, traitId}) => game
  .updateIn(['players', sourcePid, 'continent'], continent => continent
    .map(a => a.traitDetach(trait => trait.id === traitId || trait.linkId === traitId)));

export const traitAnimalAttachTrait = (game, {sourcePid, sourceAid, trait}) => {
  const {animalIndex} = game.locateAnimal(sourceAid, sourcePid);
  return game
    .updateIn(['players', sourcePid, 'continent', animalIndex], animal => animal.traitAttach(trait));
};

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
      if (endedNow) logger.debug(`Player#${player.id} ended by skipping.`);
      return player
        .set('ended', endedNow)
    })
    .update(addToGameLog(['gameEndTurn', userId, endedNow, endedAlready]));
};

export const gameStartEat = (game, {food}) => {
  ensureParameter(food, 'number');
  return game
    .update('players', players => players.map(player => player
      .set('ended', !player.playing)
    ))
    .setIn(['food'], food)
    .setIn(['status', 'phase'], PHASE.FEEDING)
    .setIn(['status', 'round'], 0)
    .update(addToGameLog(['gameStartEat', food]))
};

export const gameStartDeploy = (game) => {
  const roundPlayer = game.status.roundPlayer;
  const nextRoundPlayer = (roundPlayer + 1) % game.players.size;
  return game
    .update('players', players => players.map(player => player
      .set('ended', !player.playing)
      .update('continent', continent => continent.map(animal => animal
        .set('food', 0)
        .set('flags', Map())
        .update('traits', traits => traits.map(trait =>
          trait.type === 'TraitIntellect' ? trait.set('value', false) : trait
        ))
      ))
    ))
    .setIn(['food'], 0)
    .setIn(['status', 'phase'], PHASE.DEPLOY)
    .updateIn(['status', 'turn'], turn => ++turn)
    .setIn(['status', 'round'], 0)
    .setIn(['status', 'roundPlayer'], nextRoundPlayer)
    .update('cooldowns', cooldowns => cooldowns.eventNextTurn())
    .update(addToGameLog(['PhaseDeploy']));
};

export const gameStartExtinct = (game) => game
  .update('players', players => players.map(player => player
    .update('continent', continent => continent.map(animal => animal.digestFood()))
  ))
  .update(addToGameLog(['PhaseExtinct']));

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
 * Traits
 * */

export const traitMoveFood = (game, {animalId, amount, sourceType, sourceId}) => {
  ensureParameter(animalId, 'string');
  ensureParameter(amount, 'number');
  const {animal, animalIndex} = game.locateAnimal(animalId);
  const {animal: another, animalIndex: takenFromAix} = game.locateAnimal(sourceId);

  const updatedGame = game
    .updateIn(['players', animal.ownerId, 'continent', animalIndex], animal => animal.receiveFood(amount))
    .update(addToGameLog(['traitMoveFood', amount, sourceType, logAnimal(animal), logAnimal(another)]));


  return sourceType === 'GAME' ? updatedGame.update('food', food => food - amount)
    : sourceType === 'TraitPiracy' ? updatedGame.updateIn(['players', another.ownerId, 'continent', takenFromAix, 'food'], food => Math.max(food - amount, 0))
      : updatedGame;
};

const animalDies = (playerId, animalIndex, animal) => (game) => {
  const animal = game.getIn(['players', playerId, 'continent', animalIndex]);
  const shell = animal.hasTrait(TraitShell);
  return game
    .updateIn(['players', playerId, 'scoreDead'], scoreDead => scoreDead + animal.countScore())
    .removeIn(['players', playerId, 'continent', animalIndex])
    .updateIn(['players', playerId, 'continent'], continent => continent
      .map(a => a.traitDetach(trait => trait.linkAnimalId === animal.id)))
    .updateIn(['continents', 'standard', 'shells'], shells => shell ? shells.set(shell.id, shell) : shells);
};

export const traitKillAnimal = (game, {targetAnimalId}) => {
  const {animalIndex, animal} = game.locateAnimal(targetAnimalId);
  return game
    .update(animalDies(animal.ownerId, animalIndex, animal))
    .update(addToGameLog(['traitKillAnimal', logAnimal(animal)]))
};

export const gameAnimalStarve = (game, {animalId}) => {
  const {animalIndex, animal} = game.locateAnimal(animalId);
  return game
    .update(animalDies(animal.ownerId, animalIndex, animal))
    .update(addToGameLog(['gameAnimalStarve', logAnimal(animal)]))
};

export const traitAnimalPoisoned = (game, {animalId}) => {
  const {animalIndex, animal} = game.locateAnimal(animalId);
  return game
    .update(animalDies(animal.ownerId, animalIndex, animal))
    .update(addToGameLog(['traitAnimalPoisoned', logAnimal(animal)]))
};

export const startCooldown = (game, {link, duration, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.startCooldown(link, duration, place, placeId));

export const clearCooldown = (game, {link, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.clearCooldown(link, place, placeId));

// Transferring new game for game.end
export const gameEnd = (state, {game}) => game.end();

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

export const traitConvertFat = (game, {sourceAid, traitId}) => {
  const {animal, animalIndex} = game.locateAnimal(sourceAid);
  return game.updateIn(['players', animal.ownerId, 'continent', animalIndex], animal => {
    const traitIndex = animal.traits.findIndex(t => t.id === traitId);
    const availableFat = animal.traits.take(traitIndex + 1).filter(trait => trait.type === TraitFatTissue && trait.value).size;
    let fatCounter = availableFat;
    return animal
      .update('traits', traits => traits.map(trait =>
        (trait.type === TraitFatTissue && trait.value) ? trait.set('value', fatCounter-- <= 0)
          : trait))
      .receiveFood(availableFat)
  });
};

export const traitSetAnimalFlag = (game, {sourceAid, flag, on}) => {
  const {animal, animalIndex} = game.locateAnimal(sourceAid);
  return game
    .setIn(['players', animal.ownerId, 'continent', animalIndex, 'flags', flag], on);
};


export const traitSetValue = (game, {sourceAid, traitId, value}) => {
  const {animal, animalIndex, traitIndex} = game.locateTrait(traitId, sourceAid);
  return game
    .setIn(['players', animal.ownerId, 'continent', animalIndex, 'traits', traitIndex, 'value'], value);
};

const traitNotify_Start_getTarget = {
  'TraitCommunication': logAnimalById
  , 'TraitCooperation': logAnimalById
  , 'TraitPoisonous': logAnimalById
  , [TRAIT_TARGET_TYPE.ANIMAL]: logAnimalById
  , [TRAIT_TARGET_TYPE.TRAIT]: (game, targetId) => logTrait(game, targetId)
};

export const traitNotify_Start = (game, {sourceAid, traitId, traitType, targetId}) => {
  if (targetId === true) return game;
  const {animal} = game.locateAnimal(sourceAid);
  const targetType = TraitDataModel.new(traitType).targetType;
  const getTarget = traitNotify_Start_getTarget[traitType] || traitNotify_Start_getTarget[targetType];
  const target = getTarget && getTarget(game, targetId);
  return game.update(addToGameLog(['traitNotify_Start', logAnimal(animal), traitType, target]));
};

export const traitTakeShell = (game, {continentId, animalId, trait}) => {
  const {animalIndex, animal} = game.locateAnimal(animalId);
  return game
    .removeIn(['continents', continentId, 'shells', trait.id])
    .updateIn(['players', animal.ownerId, 'continent', animalIndex], a => a.traitAttach(trait))
    .update(addToGameLog(['traitTakeShell', logAnimal(animal)]));
};

// No need to exports, serverside-only
const traitAddHuntingCallback = (game, {callback}) => game.update('huntingCallbacks', (list) => list.push(callback));
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
  , gameEndTurn: (state, data) => state.update(data.gameId, game => gameEndTurn(game, data))
  , gameEnd: (state, data) => state.update(data.gameId, game => gameEnd(game, data))
  , gamePlayerLeft: (state, data) => state.update(data.gameId, game => gamePlayerLeft(game, data))
  , gameStartEat: (state, data) => state.update(data.gameId, game => gameStartEat(game, data))
  , gameStartDeploy: (state, data) => state.update(data.gameId, game => gameStartDeploy(game, data))
  , gameStartExtinct: (state, data) => state.update(data.gameId, game => gameStartExtinct(game, data))
  , gameSetUserTimedOut: (state, data) => state.update(data.gameId, game => gameSetUserTimedOut(game, data))
  , gameSetUserWantsPause: (state, data) => state.update(data.gameId, game => gameSetUserWantsPause(game, data))
  , gameSetPaused: (state, data) => state.update(data.gameId, game => gameSetPaused(game, data))
  , playerActed: (state, data) => state.update(data.gameId, game => playerActed(game, data))
  , traitMoveFood: (state, data) => state.update(data.gameId, game => traitMoveFood(game, data))
  , startCooldown: (state, data) => state.update(data.gameId, game => startCooldown(game, data))
  , clearCooldown: (state, data) => state.update(data.gameId, game => clearCooldown(game, data))
  , traitQuestion: (state, data) => state.update(data.gameId, game => traitQuestion(game, data))
  , traitAnswerSuccess: (state, data) => state.update(data.gameId, game => traitAnswerSuccess(game, data))
  , traitKillAnimal: (state, data) => state.update(data.gameId, game => traitKillAnimal(game, data))
  , traitAnimalAttachTrait: (state, data) => state.update(data.gameId, game => traitAnimalAttachTrait(game, data))
  , traitAnimalRemoveTrait: (state, data) => state.update(data.gameId, game => traitAnimalRemoveTrait(game, data))
  , traitConvertFat: (state, data) => state.update(data.gameId, game => traitConvertFat(game, data))
  , traitGrazeFood: (state, data) => state.update(data.gameId, game => traitGrazeFood(game, data))
  , traitSetAnimalFlag: (state, data) => state.update(data.gameId, game => traitSetAnimalFlag(game, data))
  , traitSetValue: (state, data) => state.update(data.gameId, game => traitSetValue(game, data))
  , gameAnimalStarve: (state, data) => state.update(data.gameId, game => gameAnimalStarve(game, data))
  , traitAnimalPoisoned: (state, data) => state.update(data.gameId, game => traitAnimalPoisoned(game, data))
  , traitNotify_Start: (state, data) => state.update(data.gameId, game => traitNotify_Start(game, data))
  , traitTakeShell: (state, data) => state.update(data.gameId, game => traitTakeShell(game, data))
  , traitAddHuntingCallback: (state, data) => state.update(data.gameId, game => traitAddHuntingCallback(game, data))
  , traitClearHuntingCallbacks: (state, data) => state.update(data.gameId, game => traitClearHuntingCallbacks(game, data))
  , testHackGame: (state, data) => state.update(data.gameId, data.callback)
});