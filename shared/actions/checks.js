import logger from '~/shared/utils/logger';
//import {} from '../models/game/evolution/constants';

import {PHASE} from '../models/game/GameModel';

import {ActionCheckError} from '../models/ActionCheckError';
import {selectGame} from '../selectors';

/**
 * PLEASE READ
 *
 * Currently, there's a two types of checks in a project.
 * Old one, when check = (f() => throws error), which is used by request handlers
 * and uses passesChecks and failsChecks when you don't need to throw and error.
 *
 * And the new one, when check = (fFails() => string OR false), which returns some string when it fails
 * and returns false otherwise.
 * Advantages over the old one: no need to "passesChecks" try catching gimmicks
 */

// TODO remove and replace with throwError
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

// TODO remove and replace with throwError
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

export const throwError = (possibleError) => {
  let result = possibleError;
  if (result) throw new ActionCheckError('ActionCheckError', result);
};

export const getErrorInList = (list, cb) => {
  let error;
  list.some(item => {
    return error = cb(item);
  });
  return error;
};

export const checkGameHasPlant = (game, plantId) => {
  const plant = game.plants.get(plantId);
  if (!plant) {
    throw new ActionCheckError(`checkGameHasPlant(${game.id})`, 'Plant#%s not found', plantId);
  }
  return plant;
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
  const card = game.getPlayer(userId).findCard(cardId);
  if (!card) {
    throw new ActionCheckError(`checkPlayerHasCard(${game.id})`, 'Card#%s not found in Player#%s', cardId, userId);
  }
  return card;
};

export const checkPlayerHasAnimal = (game, userId, animalId) => {
  const animal = game.locateAnimal(animalId, userId);
  if (!animal) {
    throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Animal#%s not found in Player#%s', animalId, userId);
  }
  return animal;
};

export const checkPlayerTurn = (game, userId) => {
  if (userId !== game.status.currentPlayer) {
    throw new ActionCheckError(`checkPlayerTurn@Game(${game.id})`
      , `Player(%s) [%s] acting on Player(%s)'s [%s] turn`
      , userId, game.getPlayer(userId).index
      , game.status.currentPlayer, game.getPlayer(game.status.currentPlayer).index);
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