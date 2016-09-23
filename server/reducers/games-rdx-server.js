import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter, validateParameter} from '~/shared/utils';
import {Map, List} from 'immutable';
import {GameModel, PHASE} from '../../shared/models/game/GameModel';
import {CardModel} from '../../shared/models/game/CardModel';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../shared/models/game/evolution/TraitModel';

export const gameStart = game => game.start();

export const gamePlayerStatusChange = (game, {userId, status}) => game
  .setIn(['players', userId, 'status'], status);

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

export const gameDeployTrait = (game, {userId, cardId, animalId, trait}) => {
  ensureParameter(userId, 'string');
  ensureParameter(cardId, 'string');
  ensureParameter(animalId, 'string');
  ensureParameter(trait, TraitModel);
  const cardIndex = game.getIn(['players', userId, 'hand']).findIndex(card => card.id === cardId);
  const animalIndex = game.getIn(['players', userId, 'continent']).findIndex(animal => animal.id === animalId);
  return game
    .removeIn(['players', userId, 'hand', cardIndex])
    .updateIn(['players', userId, 'continent', animalIndex, 'traits'], traits => traits.push(trait))
};

export const gameNextPlayer = (game) => {
  let playerIndex = game.getIn(['status', 'player']);
  let emergencyCount = game.players.size;
  let totalPlayers = game.players.size;
  let round = game.getIn(['status', 'round']);
  do {
    --emergencyCount;
    ++playerIndex;
    if (playerIndex >= totalPlayers) {
      ++round;
      playerIndex = 0;
    }
    const player = game.players.find(player => player.index === playerIndex);
    if (player && !player.ended) {
      break;
    }
  } while (emergencyCount >= 0);

  return emergencyCount < 0 ? game : game
    .setIn(['status', 'round'], round)
    .setIn(['status', 'player'], playerIndex);
};

export const gameEndTurn = (game, {userId}) => {
  ensureParameter(userId, 'string');
  return game
    .setIn(['players', userId, 'ended'], true);
};

export const gameStartEat = (game, {food}) => {
  ensureParameter(food, 'number');
  return game
    .setIn(['food'], food)
    .setIn(['status', 'phase'], PHASE.EAT)
    .setIn(['status', 'round'], 0)
    .setIn(['status', 'player'], 0);
};

export const gameGiveFood = (game, {animalIds}) => {
  validateParameter(animalIds, Array.isArray(animalIds), 'Animals is not Array');
  return game
    .update(game => {
      return animalIds.reduce((game, animalId) => {
        const {playerId, animalIndex} = game.locateAnimal(animalId);
        return game.updateIn(['players', playerId, 'continent', animalIndex, 'food'], food => food + 1);
      }, game)
    })
    .update('food', food => food - animalIds.length);
};

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => state.set(game.id, game)
  , roomExitSuccess: (state, {roomId, userId}) => {
    let game = state.find(game => game.roomId === roomId);
    if (!game) return state;
    const updGame = game.leave(userId);
    return !updGame
      ? state.remove(game.id)
      : state.set(game.id, updGame);
  }
  , gameStart: (state, data) => state.update(data.gameId, game => gameStart(game, data))
  , gamePlayerStatusChange: (state, data) => state.update(data.gameId, game => gamePlayerStatusChange(game, data))
  , gameGiveCards: (state, data) => state.update(data.gameId, game => gameGiveCards(game, data))
  , gameNextPlayer: (state, data) => state.update(data.gameId, game => gameNextPlayer(game, data))
  , gameDeployAnimal: (state, data) => state.update(data.gameId, game => gameDeployAnimal(game, data))
  , gameDeployTrait: (state, data) => state.update(data.gameId, game => gameDeployTrait(game, data))
  , gameEndTurn: (state, data) => state.update(data.gameId, game => gameEndTurn(game, data))
  , gameStartEat: (state, data) => state.update(data.gameId, game => gameStartEat(game, data))
  , gameGiveFood: (state, data) => state.update(data.gameId, game => gameGiveFood(game, data))
});