import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter} from '~/shared/utils';
import {Map, List} from 'immutable';
import {GameModel, PHASE} from '../../shared/models/game/GameModel';
import {CardModel} from '../../shared/models/game/CardModel';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';

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

export const gameNextPlayer = (game) => {
  const currentPlayerIndex = game.getIn(['status', 'player']);
  const totalPlayers = game.getIn(['players']).size;
  return (currentPlayerIndex + 1) < totalPlayers
    ? game.setIn(['status', 'player'], currentPlayerIndex + 1)
    : game
    .updateIn(['status', 'round'], round => round + 1)
    .setIn(['status', 'player'], 0);
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

export const gameDeployTrait = (game, {userId, animalId, card}) => {
  ensureParameter(userId, 'string');
  ensureParameter(animalId, 'string');
  ensureParameter(card, CardModel);
  const animalIndex = game.getIn(['players', userId, 'continent']).findIndex(animal => animal.id === animalId);
  return game
    .updateIn(['players', userId, 'continent', animalIndex, 'cards'], cards => cards.push(card))
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
});