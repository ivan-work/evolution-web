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

export const checkTraitActivation = (game, sourcePid, sourceAid, traitType, targetAid) => {
  checkGameDefined(game);
  const gameId = game.id;
  checkGameHasUser(game, sourcePid);
  checkPlayerTurnAndPhase(game, sourcePid, PHASE.FEEDING);
  const sourceAnimal = checkPlayerHasAnimal(game, sourcePid, sourceAid);
  const trait = sourceAnimal.traits.find(trait => trait.type === traitType);
  if (!trait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', sourceAid, traitType)
  }
  const traitData = trait.dataModel;
  if (traitData.cooldowns && traitData.cooldowns.some(([link, place]) =>
      game.cooldowns.checkFor(link, sourcePid, sourceAid))) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s):Trait(%s) has cooldown active', sourceAid, traitType)
  }
  if (!traitData.action) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s):Trait(%s) is not active', sourceAid, traitType)
  }
  if (traitData.checkAction && !traitData.checkAction(game, sourceAnimal)) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s):Trait(%s) checkAction failed', sourceAid, traitType)
  }
  if (!traitData.targetType) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s):Trait(%s) no targetType', sourceAid, traitType)
  }
  if (traitData.targetType === TRAIT_TARGET_TYPE.ANIMAL) {
    if (sourceAid === targetAid) {
      throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) cant target self', sourceAid, traitType)
    }
    const {playerId: targetPid, animal: targetAnimal} = game.locateAnimal(targetAid);
    if (!targetAnimal) {
      throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) cant locate Animal(%s)', sourceAid, traitType, targetId)
    }
    if (traitData.checkTarget && !traitData.checkTarget(game, sourceAnimal, targetAnimal)) {
      throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) checkTarget failed', sourceAid, traitType)
    }
    return {game, sourceAnimal, traitData, targetPid, targetAnimal};
  }
  throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) unknown target type %s', sourceAid, traitType, traitData.targetType)
};