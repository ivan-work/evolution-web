import logger from '~/shared/utils/logger';

import ActionCheckError from '../models/ActionCheckError';
import * as ERR from "../errors/ERR";

/**
 * PLEASE READ
 *
 * Currently, there's a two types of checks in a project.
 * Old one, when check = (f() => throws error), which is used by request handlers
 * and uses passesChecks and failsChecks when you don't need to throw and error.
 *
 * ~~And the new one, when check = (fFails() => string OR false), which returns some string when it fails~~
 * ~~and returns false otherwise.~~
 * ~~Advantages over the old one: no need to "passesChecks" try catching gimmicks~~
 *
 * ^ disregard that, there're now two new types:
 * 1. getErrorOfX() => string | false; string means error, false means no error
 * 2. getOrThrowX() => X | <throws error>;
 */

// TODO remove and replace with throwError
export const passesChecks = (checks) => {
  try {
    checks();
  } catch (e) {
    if (e.userLevelError) {
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
    if (e.userLevelError) {
      return e;
    } else throw e;
  }
  return false;
};

export const throwError = (possibleError) => {
  let result = possibleError;
  if (result) throw new ActionCheckError(result);
};

export const getErrorInList = (list, cb) => {
  let error;
  list.some(item => {
    return error = cb(item);
  });
  return error;
};

export const getOrThrowGamePlant = (game, plantId) => {
  const plant = game.plants.get(plantId);
  if (!plant) {
    throw new ActionCheckError(ERR.GAME_PLANT_NOTFOUND, {gameId: game.id, plantId});
  }
  return plant;
};

export const checkGameDefined = (game) => {
  if (game === void 0)
    throw new ActionCheckError(ERR.GAME_NOTFOUND);
};

export const checkGameHasUser = (game, userId) => {
  if (!game.players.has(userId))
    throw new ActionCheckError(ERR.GAME_PLAYER_NOTFOUND, {gameId: game.id, userId});
};

export const checkPlayerHasCard = (game, userId, cardId) => {
  const card = game.getPlayer(userId).findCard(cardId);
  if (!card) {
    throw new ActionCheckError(ERR.GAME_CARD_NOTFOUND, {gameId: game.id, userId, cardId});
  }
  return card;
};

export const getOrThrowGameAnimal = (game, animalId) => {
  const animal = game.locateAnimal(animalId);
  if (!animal) {
    throw new ActionCheckError(ERR.GAME_ANIMAL_NOTFOUND, {gameId: game.id, animalId});
  }
  return animal;
};

export const getOrThrowPlayerAnimal = (game, userId, animalId) => {
  const animal = game.locateAnimal(animalId, userId);
  if (!animal) {
    throw new ActionCheckError(ERR.GAME_ANIMAL_OWNER, {gameId: game.id, userId, animalId});
  }
  return animal;
};

export const checkPlayerTurn = (game, userId) => {
  if (userId !== game.status.currentPlayer) {
    throw new ActionCheckError(ERR.GAME_PLAYER_ACT_NOT_CURRENT_PLAYER, {
      gameId: game.id
      , userId
      , currentPlayer: game.status.currentPlayer
      , currentPlayerIndex: game.getPlayer(game.status.currentPlayer).index
    });
  }
};

export const checkPlayerCanAct = (game, userId) => {
  if (!game.question) {
    checkPlayerTurn(game, userId);
  } else {
    const {sourcePid, targetPid} = game.question;
    throw new ActionCheckError(ERR.GAME_PLAYER_ACT_ON_QUESTION, {
      gameId: game.id
      , userId
      , sourcePid
      , targetPid
    });
  }
};

export const checkGamePhase = (game, phase) => {
  if (game.status.phase !== phase) {
    throw new ActionCheckError(ERR.GAME_PHASE, {
      gameId: game.id
      , phase: game.status.phase
      , targetPhase: phase
    });
  }
};

export const getOrThrowAnimalTrait = (gameId, entity, traitId, ignoreDisable) => {
  const trait = entity.hasTrait(traitId, ignoreDisable);
  if (!trait) {
    throw new ActionCheckError(ERR.GAME_ANIMAL_TRAIT_NOTFOUND, {
      gameId
      , entityId: entity.id
      , traitId
      , ignoreDisable
    });
  }
  return trait;
}

export const getOrThrowQuestion = (game, questionId) => {
  const question = game.question;
  if (!question) {
    throw new ActionCheckError(ERR.GAME_QUESTION_NOTFOUND, {
      gameId: game.id
      , questionId
    })
  }
  if (question.id !== questionId) {
    throw new ActionCheckError(ERR.GAME_QUESTION_INCORRECT, {
      gameId: game.id
      , questionId
    })
  }
  return question;
}

export const checkValidAnimalPosition = (game, userId, animalPosition) => {
  const maxAnimalPosition = game.players.get(userId).continent.size;
  if (isNaN(parseInt(animalPosition)) || animalPosition < 0 || animalPosition > maxAnimalPosition) {
    throw new ActionCheckError(ERR.GAME_ANIMAL_POSITION, {
      gameId: game.id
      , userId
      , animalPosition
      , maxAnimalPosition
    });
  }
};