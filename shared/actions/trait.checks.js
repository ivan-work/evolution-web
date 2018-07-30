import {ActionCheckError} from '../models/ActionCheckError';
import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasAnimal
} from './checks';

import * as tt from '../models/game/evolution/traitTypes';

import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_LINK, TRAIT_ANIMAL_FLAG
} from '../models/game/evolution/constants';

const ERRORS = {
  GAME_FOOD: 'GAME_FOOD'
  , COOLDOWN: 'COOLDOWN'
  , ANIMAL_CANT_EAT: 'ANIMAL_CANT_EAT'
  , TRAIT_MULTIPLE: 'TRAIT_MULTIPLE'
  , TRAIT_REGENERATION_TRAIT_MAX: 'TRAIT_REGENERATION_TRAIT_MAX'
  , TRAIT_REGENERATION_DEAD: 'TRAIT_REGENERATION_DEAD'
};

export const checkTraitActivation = (game, animal, traitId, ...targets) => {
  const gameId = game.id;
  const trait = animal.hasTrait(traitId);
  if (!trait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', animal.id, traitId)
  }
  const reason = trait.checkActionFails(game, animal);
  if (!!reason) {
    throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
      , `Animal(%s):Trait(%s) checkAction ${reason}`, animal.id, trait.type)
  }
  let target = null;
  switch (trait.getDataModel().targetType) {
    case TRAIT_TARGET_TYPE.ANIMAL:
      target = checkTraitActivation_Animal(game, animal, trait, ...targets);
      break;
    case TRAIT_TARGET_TYPE.TRAIT:
      target = checkTraitActivation_Trait(game, animal, trait, ...targets);
      break;
    case TRAIT_TARGET_TYPE.TWO_TRAITS:
      target = checkTraitActivation_TwoTraits(game, animal, trait, ...targets);
      break;
    case TRAIT_TARGET_TYPE.NONE:
      break;
    default:
      throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
        , 'Animal(%s):Trait(%s) unknown target type %s', animal.id, trait.type, trait.getDataModel().targetType)
  }
  return {trait, target};
};

export const checkTraitActivation_Animal = (game, sourceAnimal, trait, targetAid) => {
  const gameId = game.id;
  if (sourceAnimal.id === targetAid) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant target self', sourceAnimal.id, trait.type)
  }

  const targetAnimal = game.locateAnimal(targetAid);
  if (!targetAnimal) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant locate Animal(%s)', sourceAnimal.id, trait.type, targetAid)
  }
  if (trait.getDataModel().checkTarget && !trait.getDataModel().checkTarget(game, sourceAnimal, targetAnimal)) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Animal(%s) failed', sourceAnimal.id, trait.type, targetAnimal.id)
  }
  return targetAnimal;
};

export const checkTraitActivation_Trait = (game, sourceAnimal, trait, traitId) => {
  const gameId = game.id;
  const targetTrait = sourceAnimal.hasTrait(traitId, true);
  if (!targetTrait) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait#%s cant find Trait#%s', sourceAnimal.id, trait.type, traitId)
  }
  if (trait.getDataModel().checkTarget && !trait.getDataModel().checkTarget(game, sourceAnimal, targetTrait)) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Trait@%s failed', sourceAnimal.id, trait.type, targetTrait.type)
  }
  return targetTrait;
};

// Recombination only
export const checkTraitActivation_TwoTraits = (game, sourceAnimal, trait, trait1id, trait2id) => {
  const gameId = game.id;
  const linkedAnimal = game.locateAnimal(
    sourceAnimal.id === trait.hostAnimalId
      ? trait.linkAnimalId
      : trait.hostAnimalId
    , trait.ownerId
  );
  const trait1 = sourceAnimal.hasTrait(trait1id, true);
  if (!trait1) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait#%s cant find Trait#%s', sourceAnimal.id, trait.type, trait1Id)
  }
  const trait2 = linkedAnimal.hasTrait(trait2id, true);
  if (!trait2) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait#%s cant find Trait#%s', sourceAnimal.id, trait.type, trait2Id)
  }
  if (trait.getDataModel().checkTarget && !trait.getDataModel().checkTarget(game, sourceAnimal, trait1)) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Trait@%s failed', sourceAnimal.id, trait.type, trait1.type)
  }
  if (trait.getDataModel().checkTarget && !trait.getDataModel().checkTarget(game, sourceAnimal, trait2)) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Trait@%s failed', linkedAnimal.id, trait.type, trait2type)
  }
  return [trait1, trait2];
};

export const checkAnimalCanEat = (game, animal) => {
  if (game.food < 1)
    throw new ActionCheckError(`traitTakeFoodRequest@Game(${game.id})`, 'Not enough food (%s)', game.food)
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, animal.ownerId, animal.id))
    throw new ActionCheckError(`traitTakeFoodRequest@Game(${game.id})`, 'Cooldown active')
  if (!animal.canEat(game))
    throw new ActionCheckError(`traitTakeFoodRequest@Game(${game.id})`, `Animal(%s) can't eat`, animal)
};

export const checkAnimalCanEatFails = (game, animal) => {
  if (game.food < 1) return ERRORS.GAME_FOOD;
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, animal.ownerId, animal.id)) return ERRORS.COOLDOWN;
  if (!animal.canEat(game)) return ERRORS.ANIMAL_CANT_EAT;
  return false;
};

export const checkAnimalCanTakeShellFails = (game, animal) => {
  if (animal.hasTrait(tt.TraitShell, true)) return ERRORS.TRAIT_MULTIPLE;
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, animal.ownerId, animal.id)) return ERRORS.COOLDOWN;
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.TAKE_SHELL, animal.ownerId, animal.id)) return ERRORS.COOLDOWN;
  if (animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) return ERRORS.TRAIT_REGENERATION_DEAD;
  const traitRegeneration = animal.hasTrait(tt.TraitRegeneration, true);
  if (traitRegeneration && !traitRegeneration.getDataModel().checkTraitPlacement(animal)) return ERRORS.TRAIT_REGENERATION_TRAIT_MAX;
  return false;
};

export const checkIfTraitDisabledByIntellect = (attackAnimal, defenseTrait) => {
  const traitIntellect = attackAnimal.hasTrait('TraitIntellect');
  return traitIntellect && (traitIntellect.value === defenseTrait.id || traitIntellect.value === defenseTrait.type);
};