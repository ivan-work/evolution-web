import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';

export const checkGameDefined = (game) => {
  if (game === void 0)
    throw new ActionCheckError(`checkGameDefined`, 'Cannot find game');
};

export const checkGameHasUser = (game, userId) => {
  if (!game.players.has(userId))
    throw new ActionCheckError(`checkGameHasUser(${game.id})`, 'Game has no player %s', userId);
};

export const checkPlayerHasCard = (game, userId, cardId) => {
  const cardIndex = game.players.get(userId).hand.findIndex(card => card.id === cardId);
  if (!~cardIndex) {
    throw new ActionCheckError(`checkPlayerHasCard(${game.id})`, 'Card#%s not found in Player#%s', cardId, userId);
  }
  return cardIndex;
};

export const checkPlayerHasAnimal = (game, userId, animalId) => {
  const animalIndex = game.players.get(userId).continent.findIndex(animal => animal.id === animalId);
  if (!~animalIndex) {
    throw new ActionCheckError(`checkPlayerHasCard(${game.id})`, 'Animal#%s not found in Player#%s', animalId, userId);
  }
  return game.players.get(userId).continent.get(animalIndex);
};

export const checkPlayerTurnAndPhase = (game, userId, phase = -1) => {
  if (~phase && game.status.phase !== phase) {
    throw new ActionCheckError(`checkPlayerTurnAndPhase@Game(${game.id})`, 'Wrong phase (%s)', game.status.phase);
  }
  if (game.players.get(userId).index !== game.status.currentPlayer) {
    throw new ActionCheckError(`checkPlayerTurnAndPhase@Game(${game.id})`
      , 'Wrong turn (%s), offender %s (%s)'
      , game.status.currentPlayer, userId, game.players.get(userId).index);
  }
};

export const checkValidAnimalPosition = (game, userId, animalPosition) => {
  if (isNaN(parseInt(animalPosition)) || animalPosition < 0 || animalPosition > game.players.get(userId).continent.size) {
    throw new ActionCheckError(`checkValidAnimalPosition@Game(${game.id})`, 'Wrong animal position (%s)', animalPosition);
  }
};