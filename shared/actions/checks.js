import logger from '~/shared/utils/logger';
import {
  FOOD_SOURCE_TYPE
  , TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
} from '../models/game/evolution/constants';

import {PHASE} from '../models/game/GameModel';

import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {selectGame} from '../selectors';

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
  const {playerId, animal} = game.locateAnimal(animalId);
  if (playerId !== userId) {
    throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Animal#%s not found in Player#%s', animalId, userId);
  }
  return animal;
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

export const checkTraitActivation = (game, sourcePid, sourceAid, traitType) => {
  checkGameDefined(game);
  const gameId = game.id;
  checkGameHasUser(game, sourcePid);
  //checkPlayerTurnAndPhase(game, sourcePid, PHASE.FEEDING); defence traits
  const sourceAnimal = checkPlayerHasAnimal(game, sourcePid, sourceAid);
  const trait = sourceAnimal.traits.find(trait => trait.type === traitType);
  if (!trait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', sourceAid, traitType)
  }
  const traitData = trait.dataModel;
  if (!traitData.action) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s):Trait(%s) is not active', sourceAid, traitType)
  }
  return {sourceAnimal, traitData};
};

export const checkTraitActivation_Animal = (game, sourceAnimal, traitData, targetAid) => {
  const gameId = game.id;
  if (sourceAnimal.id === targetAid) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant target self', sourceAnimal.id, traitData.type)
  }

  const {animal: targetAnimal} = game.locateAnimal(targetAid);
  if (!targetAnimal) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant locate Animal(%s)', sourceAnimal.id, traitData.type, targetAid)
  }
  if (traitData.checkTarget && !traitData.checkTarget(game, sourceAnimal, targetAnimal)) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Animal(%s) failed', sourceAnimal.id, traitData.type, targetAnimal.id)
  }
  return targetAnimal;
};