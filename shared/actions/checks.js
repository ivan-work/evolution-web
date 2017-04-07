import logger from '~/shared/utils/logger';
//import {} from '../models/game/evolution/constants';

import {PHASE} from '../models/game/GameModel';

import {ActionCheckError} from '../models/ActionCheckError';
import {selectGame} from '../selectors';

export const passesChecks = (checks) => {
  try {
    checks();
  } catch (e) {
    if (e instanceof ActionCheckError) {
      return false;
    } else throw e;
  }
  return true;
};

export const failsChecks = (checks) => {
  try {
    checks();
  } catch (e) {
    if (e instanceof ActionCheckError) {
      return e;
    } else throw e;
  }
  return false;
};

export const checkGameCanStart = (room) => {
  if (room.validateCanStart() === void 0)
    throw new ActionCheckError(`checkGameDefined`, 'Cannot find game');
};

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
  const {animal} = game.locateAnimal(animalId);
  if (animal.ownerId !== userId) {
    throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Animal#%s not found in Player#%s', animalId, userId);
  }
  return animal;
};

export const checkPlayerTurn = (game, userId) => {
  if (game.players.get(userId).index !== game.status.currentPlayer) {
    throw new ActionCheckError(`checkPlayerTurn@Game(${game.id})`
      , `Player(%s@%s) acting on Player(%s)'s turn`
      , userId, game.players.get(userId).index, game.status.currentPlayer);
  }
};

export const checkPlayerCanAct = (game, userId) => {
  if (!game.question) {
    checkPlayerTurn(game, userId);
  } else {
    const {sourcePid, targetPid} = game.question;
    throw new ActionCheckError(`checkPlayerCanAct@Game(${game.id})`
      , `Player(%s) acting on Target(%s) answering`
      , userId, targetPid);
  }
};

export const checkGamePhase = (game, phase) => {
  if (game.status.phase !== phase) {
    throw new ActionCheckError(`checkGamePhase@Game(${game.id})`, 'Wrong phase (%s)', game.status.phase);
  }
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