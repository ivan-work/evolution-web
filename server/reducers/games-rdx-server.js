import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter, validateParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, QuestionRecord, PHASE} from '../../shared/models/game/GameModel';
import {CardModel} from '../../shared/models/game/CardModel';
import {CooldownList} from '../../shared/models/game/CooldownList';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../shared/models/game/evolution/TraitModel';
import {FOOD_SOURCE_TYPE, CTT_PARAMETER} from '../../shared/models/game/evolution/constants';

export const gameStart = game => game
  .setIn(['status', 'started'], true)
  .setIn(['status', 'phase'], PHASE.DEPLOY)
  .setIn(['status', 'round'], 0);
//.setIn(['status', 'currentPlayer'], 0); // TODO RANDOMIZE

export const gamePlayerReadyChange = (game, {userId, ready}) => game
  .setIn(['players', userId, 'ready'], ready);

export const gameGiveCards = (game, {userId, cards}) => {
  ensureParameter(userId, 'string');
  ensureParameter(cards, List);
  return game
    .update('deck', deck => deck.skip(cards.size))
    .updateIn(['players', userId, 'hand'], hand => hand.concat(cards));
};

export const gameDeployAnimal = (game, {userId, animal, animalPosition, cardPosition}) => {
  ensureParameter(userId, 'string');
  ensureParameter(animal, AnimalModel);
  ensureParameter(cardPosition, 'number');
  ensureParameter(animalPosition, 'number');
  return game
    .removeIn(['players', userId, 'hand', cardPosition])
    .updateIn(['players', userId, 'continent'], continent => continent.insert(animalPosition, animal))
};

export const gameDeployTrait = (game, {cardId, traits}) => {
  const {playerId: cardOwnerId, cardIndex} = game.locateCard(cardId);
  return game
    .removeIn(['players', cardOwnerId, 'hand', cardIndex])
    .update(game => traits.reduce((game, trait) => {
      const {playerId, animalIndex} = game.locateAnimal(trait.hostAnimalId);
      return game.updateIn(['players', playerId, 'continent', animalIndex, 'traits'], traits => traits.push(trait))
    }, game));
};

export const playerActed = (game, {userId}) => {
  return game
    .setIn(['players', userId, 'acted'], true)
    .update('cooldowns', cooldowns => cooldowns.eventNextAction());
};

export const gameEndTurn = (game, {userId}) => {
  //console.log('gameEndTurn for ' + userId);
  ensureParameter(userId, 'string');
  return game
    .updateIn(['players', userId], player => {
      const ended = !player.acted;
      if (ended) {
        logger.silly(`Player#${player.id} ended by skipping.`);
      }
      return player
        .set('acted', false)
        .set('ended', ended)
    });
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
};

export const gameStartDeploy = (game) => {
  const roundPlayer = game.status.roundPlayer;
  const nextRoundPlayer = (roundPlayer + 1) % game.players.size;
  return game
    .update('players', players => players.map(player => player
      .set('ended', !player.playing)
      .update('continent', continent => continent.map(animal => animal
        .digestFood()
        .set('flags', Map())
      ))
    ))
    .setIn(['food'], 0)
    .setIn(['status', 'phase'], PHASE.DEPLOY)
    .updateIn(['status', 'turn'], turn => ++turn)
    .setIn(['status', 'round'], 0)
    .setIn(['status', 'roundPlayer'], nextRoundPlayer)
    .update('cooldowns', cooldowns => cooldowns.eventNextTurn());
};

export const gameNextPlayer = (game, {round, nextPlayerIndex, roundChanged, turnTime}) => game
    .updateIn(['status', 'round'], round => roundChanged ? round + 1 : round)
    .setIn(['status', 'currentPlayer'], nextPlayerIndex)
    .update('cooldowns', cooldowns => cooldowns.eventNextPlayer(roundChanged));

export const gameAddTurnTimeout = (game, {turnStartTime, turnDuration}) => game
  .setIn(['status', 'turnStartTime'], turnStartTime)
  .setIn(['status', 'turnDuration'], turnDuration);

export const traitMoveFood = (game, {animalId, amount, sourceType, sourceId}) => {
  ensureParameter(animalId, 'string');
  ensureParameter(amount, 'number');
  const {playerId, animalIndex} = game.locateAnimal(animalId);
  const updatedGame = game
    .updateIn(['players', playerId, 'continent', animalIndex], animal => animal.receiveFood(amount));

  switch (sourceType) {
    case FOOD_SOURCE_TYPE.GAME:
      return updatedGame.update('food', food => food - amount);
    case FOOD_SOURCE_TYPE.ANIMAL_TAKE:
      const {playerId: takenFromPid, animalIndex: takenFromAix} = game.locateAnimal(sourceId);
      return updatedGame
        .updateIn(['players', takenFromPid, 'continent', takenFromAix, 'food'], food => Math.max(food - 1, 0));
    default:
      return updatedGame;
  }
};

export const traitKillAnimal = (game, {targetAnimalId}) => {
  ensureParameter(targetAnimalId, 'string');
  const {playerId, animal, animalIndex} = game.locateAnimal(targetAnimalId);
  return game
    .updateIn(['players', playerId, 'scoreDead'], scoreDead => scoreDead + animal.countScore())
    .removeIn(['players', playerId, 'continent', animalIndex])
    .updateIn(['players', playerId, 'continent'], continent => continent
      .map(animal => animal.update('traits', traits => traits
        .filter(trait => trait.linkAnimalId !== targetAnimalId))))
};

export const traitAnimalRemoveTrait = (game, {sourcePid, sourceAid, traitId}) => {
  ensureParameter(sourcePid, 'string');
  ensureParameter(sourceAid, 'string');
  ensureParameter(traitId, 'string');
  const {playerId, animalIndex} = game.locateAnimal(sourceAid);
  return game
    .updateIn(['players', sourcePid, 'continent'], continent => continent
      .map(animal => animal.update('traits', traits => traits
        .filterNot(trait => trait.id === traitId || trait.linkId === traitId))))
};

export const animalStarve = (game, {animalId}) => {
  const {playerId, animal, animalIndex} = game.locateAnimal(animalId);
  return game
    .updateIn(['players', playerId, 'scoreDead'], scoreDead => scoreDead + animal.countScore())
    .removeIn(['players', playerId, 'continent', animalIndex])
    .updateIn(['players', playerId, 'continent'], continent => continent
      .map(animal => animal.update('traits', traits => traits
        .filter(trait => trait.linkAnimalId !== animalId))))
};

export const startCooldown = (game, {link, duration, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.startCooldown(link, duration, place, placeId));

// Transferring new game for game.end
export const gameEnd = (state, {game}) => game.end();

export const gamePlayerLeft = (game, {userId}) => game
  .setIn(['players', userId, 'hand'], List())
  .setIn(['players', userId, 'playing'], false)
  .setIn(['players', userId, 'ended'], true);

export const traitDefenceQuestion = (game, {question}) => game
  .set('question', question);

export const traitDefenceAnswerSuccess = (game, {questionId}) => game
  .remove('question');

export const traitGrazeFood = (game, {food}) => game
  .set('food', Math.max(game.food - 1, 0));

export const traitSetAnimalFlag = (game, {sourceAid, flag, on}) => {
  const {playerId, animalIndex} = game.locateAnimal(sourceAid);
  return game
    .setIn(['players', playerId, 'continent', animalIndex, 'flags', flag], on);
};

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => state.set(game.id, game)
  , gameDestroy: (state, data) => state.remove(data.gameId)
  , gameStart: (state, data) => state.update(data.gameId, game => gameStart(game, data))
  , gamePlayerReadyChange: (state, data) => state.update(data.gameId, game => gamePlayerReadyChange(game, data))
  , gameGiveCards: (state, data) => state.update(data.gameId, game => gameGiveCards(game, data))
  , gameNextPlayer: (state, data) => state.update(data.gameId, game => gameNextPlayer(game, data))
  , gameAddTurnTimeout: (state, data) => state.update(data.gameId, game => gameAddTurnTimeout(game, data))
  , gameDeployAnimal: (state, data) => state.update(data.gameId, game => gameDeployAnimal(game, data))
  , gameDeployTrait: (state, data) => state.update(data.gameId, game => gameDeployTrait(game, data))
  , gameEndTurn: (state, data) => state.update(data.gameId, game => gameEndTurn(game, data))
  , gameEnd: (state, data) => state.update(data.gameId, game => gameEnd(game, data))
  , gamePlayerLeft: (state, data) => state.update(data.gameId, game => gamePlayerLeft(game, data))
  , gameStartEat: (state, data) => state.update(data.gameId, game => gameStartEat(game, data))
  , gameStartDeploy: (state, data) => state.update(data.gameId, game => gameStartDeploy(game, data))
  , playerActed: (state, data) => state.update(data.gameId, game => playerActed(game, data))
  , traitMoveFood: (state, data) => state.update(data.gameId, game => traitMoveFood(game, data))
  , startCooldown: (state, data) => state.update(data.gameId, game => startCooldown(game, data))
  , traitDefenceQuestion: (state, data) => state.update(data.gameId, game => traitDefenceQuestion(game, data))
  , traitDefenceAnswerSuccess: (state, data) => state.update(data.gameId, game => traitDefenceAnswerSuccess(game, data))
  , traitKillAnimal: (state, data) => state.update(data.gameId, game => traitKillAnimal(game, data))
  , traitAnimalRemoveTrait: (state, data) => state.update(data.gameId, game => traitAnimalRemoveTrait(game, data))
  , traitGrazeFood: (state, data) => state.update(data.gameId, game => traitGrazeFood(game, data))
  , traitSetAnimalFlag: (state, data) => state.update(data.gameId, game => traitSetAnimalFlag(game, data))
  , animalStarve: (state, data) => state.update(data.gameId, game => animalStarve(game, data))
});