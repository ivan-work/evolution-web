import {ActionCheckError} from '../models/ActionCheckError';
import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasAnimal
} from './checks';

import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_LINK
} from '../models/game/evolution/constants';

export const checkTraitActivation = (game, sourcePid, sourceAid, traitType, targetId, ...params) => {
  checkGameDefined(game);
  const gameId = game.id;
  checkGameHasUser(game, sourcePid);
  //checkPlayerTurnAndPhase(game, sourcePid, PHASE.FEEDING); defence traits
  const sourceAnimal = checkPlayerHasAnimal(game, sourcePid, sourceAid);
  const trait = sourceAnimal.traits.find(trait => trait.type === traitType);
  if (!trait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', sourceAid, traitType)
  }
  const traitData = trait.getDataModel();
  if (!traitData.checkAction(game, sourceAnimal)) {
    throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
      , 'Animal(%s):Trait(%s) checkAction failed', sourceAnimal.id, traitData.type)
  }
  let target = null;
  switch (traitData.targetType) {
    case TRAIT_TARGET_TYPE.ANIMAL:
      target = checkTraitActivation_Animal(game, sourceAnimal, traitData, targetId);
      break;
    case TRAIT_TARGET_TYPE.TRAIT:
      target = checkTraitActivation_Trait(game, sourceAnimal, traitData, targetId);
      break;
    case TRAIT_TARGET_TYPE.NONE:
      break;
    default:
      throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
        , 'Animal(%s):Trait(%s) unknown target type %s', sourceAnimal.id, traitData.type, traitData.targetType)
  }
  return {sourceAnimal, traitData, target};
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

export const checkTraitActivation_Trait = (game, sourceAnimal, traitData, traitIndex) => {
  const gameId = game.id;
  if (!(traitIndex >= 0 && traitIndex < sourceAnimal.traits.size)) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant find Trait@%s', sourceAnimal.id, traitData.type, traitIndex)
  }
  const trait = sourceAnimal.traits.get(traitIndex);
  if (traitData.checkTarget && !traitData.checkTarget(game, sourceAnimal, trait)) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Trait@%s failed', sourceAnimal.id, traitData.type, traitIndex)
  }
  return traitIndex;
};

export const checkAnimalCanEat = (game, animal) => {
  if (game.food < 1)
    throw new ActionCheckError(`traitTakeFoodRequest@Game(${game.id})`, 'Not enough food (%s)', game.food)
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, animal.ownerId, animal.id))
    throw new ActionCheckError(`traitTakeFoodRequest@Game(${game.id})`, 'Cooldown active')
  if (!animal.canEat(game))
    throw new ActionCheckError(`traitTakeFoodRequest@Game(${game.id})`, `Animal(%s) can't eat`, animal)
};