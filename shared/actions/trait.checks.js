import {ActionCheckError} from '../models/ActionCheckError';
import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasAnimal, getErrorInList
} from './checks';

import * as tt from '../models/game/evolution/traitTypes';
import * as pt from '../models/game/evolution/plantarium/plantTypes';
import * as ptt from '../models/game/evolution/plantarium/plantTraitTypes';
import ERRORS from './errors'

import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_LINK, TRAIT_ANIMAL_FLAG
} from '../models/game/evolution/constants';
import {
  countUnavoidableDefenses,
  getIntellectValue,
  getStaticDefenses
} from "../models/game/evolution/traitsData/TraitCarnivorous";
import {getTraitDataModel} from "../models/game/evolution/TraitModel";
import {server$traitActivate} from "./trait";

export const checkTraitActivation = (game, animal, traitId, ...targets) => {
  const gameId = game.id;
  const trait = animal.hasTrait(traitId);
  if (!trait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', animal.id, traitId)
  }
  const reason = trait.getErrorOfUse(game, animal, ...targets);
  if (!!reason) {
    throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
      , `Animal(%s):Trait(%s) checkAction ${reason}`, animal.id, trait.type)
  }
  return trait;
};

export const getErrorOfEntityTraitActivation = (game, playerId, entity, trait, ...targets) => {
  if (!trait) return ERRORS.TRAIT_ACTION_NO_TRAIT;
  const traitData = trait.getDataModel();
  if (traitData.cooldowns && traitData.cooldowns.some(([link]) => game.cooldowns.checkFor(link, playerId, entity.id, trait.id)))
    return ERRORS.COOLDOWN;
  return traitData.getErrorOfUse(game, entity, trait, ...targets);
};

export const checkTraitActivation_Target = (game, animal, trait, ...targets) => {
  let target = null;
  switch (trait.getDataModel().targetType) {
    case TRAIT_TARGET_TYPE.ANIMAL:
      target = checkTraitActivation_Animal(game, animal, trait, ...targets);
      break;
    case TRAIT_TARGET_TYPE.PLANT:
      target = checkTraitActivation_Plant(game, animal, trait, ...targets);
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
  return target;
};

export const checkTraitActivation_Animal = (game, sourceAnimal, trait, targetAid, ...targets) => {
  const gameId = game.id;
  let error;
  if (sourceAnimal.id === targetAid) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant target self', sourceAnimal.id, trait.type)
  }

  const targetAnimal = game.locateAnimal(targetAid);
  if (!targetAnimal) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant locate Animal(%s)', sourceAnimal.id, trait.type, targetAid)
  }
  error = trait.getDataModel().getErrorOfUseOnTarget(game, sourceAnimal, targetAnimal, ...targets);
  if (error) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Animal(%s) failed', sourceAnimal.id, trait.type, targetAnimal.id, error)
  }
  return targetAnimal;
};

export const checkTraitActivation_Plant = (game, sourceAnimal, trait, targetEid, ...targets) => {
  const gameId = game.id;
  let error;
  const targetPlant = game.getPlant(targetEid);
  if (!targetPlant) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , 'Animal(%s):Trait(%s) cant locate Plant(%s)', sourceAnimal.id, trait.type, targetEid)
  }
  error = trait.getDataModel().getErrorOfUseOnTarget(game, sourceAnimal, targetPlant, ...targets);
  if (error) {
    throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
      , `Animal(%s):Trait(%s) checkTarget on Plant(%s) failed: %s`, sourceAnimal.id, trait.type, targetPlant.id, error)

    // throw new ActionCheckError(`checkTraitActivation_Animal@Game(${gameId})`
    //   , `Animal(${sourceAnimal.id}):Trait(${trait.type}) checkTarget on Plant(${targetPlant.id}) failed: ${error}`)
  }
  return targetPlant;
};

export const checkTraitActivation_Trait = (game, sourceAnimal, trait, traitId) => {
  const gameId = game.id;
  const targetTrait = sourceAnimal.hasTrait(traitId, true);
  if (!targetTrait) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait#%s cant find Trait#%s', sourceAnimal.id, trait.type, traitId)
  }
  if (trait.getDataModel().getErrorOfUseOnTarget(game, sourceAnimal, targetTrait)) {
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
  if (trait.getDataModel().getErrorOfUseOnTarget(game, sourceAnimal, trait1)) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Trait@%s failed', sourceAnimal.id, trait.type, trait1.type)
  }
  if (trait.getDataModel().getErrorOfUseOnTarget(game, sourceAnimal, trait2)) {
    throw new ActionCheckError(`checkTraitActivation_Trait@Game(${gameId})`
      , 'Animal(%s):Trait(%s) checkTarget on Trait@%s failed', linkedAnimal.id, trait.type, trait2type)
  }
  return [trait1, trait2];
};

export const getErrorOfEatingCooldown = (game, playerId, animalId) => {
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, playerId, animalId)) return ERRORS.COOLDOWN;
  return false;
};

export const getErrorOfAnimalEating = (game, animal) => {
  if (!animal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;
  return false;
};

export const getErrorOfAnimalEatingFromGame = (game, animal) => {
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, animal.ownerId, animal.id)) return ERRORS.COOLDOWN;
  if (game.getFood() < 1) return ERRORS.GAME_FOOD;
  return (
    getErrorOfEatingCooldown(game, animal.ownerId, animal.id)
    || getErrorOfAnimalEating(game, animal)
  );
};

export const getErrorsOfPlantFoodDefence = (game, animal, plant) => plant.getTraits()
  .map(trait => [trait.id, trait.getDataModel().getErrorOfFoodIntake(game, plant, animal)])
  .filter(([traitId, error]) => error);

export const getErrorOfAnimalEatingFromPlantNoCD = (game, animal, plant) => {
  if (plant.getFood() < 1) return ERRORS.PLANT_FOOD;
  if (animal.hasTrait(tt.TraitCarnivorous) && !plant.isFruit()) return ERRORS.PLANT_FOOD_FRUIT;
  const errorOfAnimalEating = getErrorOfAnimalEating(game, animal);
  if (errorOfAnimalEating) return errorOfAnimalEating;

  const traitSpecialization = animal.hasTrait(tt.TraitSpecialization);
  if (traitSpecialization) {
    if (animal.traits.filter(trait => !trait.disabled && trait.type === tt.TraitSpecialization).size > 1) {
      return tt.TraitSpecialization;
    }
    if (plant.id !== traitSpecialization.linkAnimalId) {
      return tt.TraitSpecialization;
    } else {
      return false
    }
  }

  const errorsOfFoodIntake = getErrorsOfPlantFoodDefence(game, animal, plant);

  if (errorsOfFoodIntake.size > 1) {
    const [errorTraitId, errorMessage] = errorsOfFoodIntake.first();
    return errorMessage;
  } else if (errorsOfFoodIntake.size === 1) {
    const [errorTraitId, errorMessage] = errorsOfFoodIntake.first();

    const traitIntellect = animal.hasTrait(tt.TraitIntellect);
    if (!traitIntellect) return errorMessage;

    if (traitIntellect.value !== errorTraitId && traitIntellect.getErrorOfUse(game, animal)) return errorMessage;
  }

  return false;
};

export const getErrorOfAnimalEatingFromPlant = (game, animal, plant) => (
  getErrorOfEatingCooldown(game, animal.ownerId, animal.id)
  || getErrorOfAnimalEatingFromPlantNoCD(game, animal, plant)
);

export const getErrorOfAnimalTakingCover = (game, animal, plant) => {
  if (plant.covers === 0) return ERRORS.PLANT_COVERS_ZERO;
  if (animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) return ERRORS.TRAIT_REGENERATION_DEAD;
  if (animal.hasFlag(TRAIT_ANIMAL_FLAG.IN_COVER)) return ERRORS.ANIMAL_IN_COVER;
  return (
    getErrorOfEatingCooldown(game, animal.ownerId, animal.id)
  );
};

export const getErrorOfPlantAttackBase = (game, animal, plant) => {
  if (plant.type !== pt.PlantCarnivorous) return ERRORS.COUNTERATTACK_WRONG_TYPE;

  const unavoidable = countUnavoidableDefenses(game, plant, animal);
  if (unavoidable > 0) return ERRORS.TRAIT_ATTACK_UNAVOIDABLE;

  return getTraitDataModel(ptt.PlantTraitHiddenCarnivorous).getErrorOfUse(game, plant);
};

export const getErrorOfPlantAttack = (game, animal, plant, playerId) => {
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, playerId)) return ERRORS.COOLDOWN;

  const defenses = getStaticDefenses(game, plant, animal);
  if (defenses.length > 0) return ERRORS.TRAIT_ATTACK_TOO_MUCH_DEFENSES;

  return getErrorOfPlantAttackBase(game, animal, plant);
};

export const getErrorOfPlantCounterAttack = (game, animal, plant) => {
  const defenses = getStaticDefenses(game, plant, animal);
  if (defenses.length > 1) return ERRORS.TRAIT_ATTACK_TOO_MUCH_DEFENSES;

  const traitSpecialization = animal.hasTrait(tt.TraitSpecialization);
  if (traitSpecialization && traitSpecialization.linkAnimalId === plant.id) {
    return tt.TraitSpecialization;
  }

  return getErrorOfPlantAttackBase(game, animal, plant);
};

export const checkAnimalCanTakeShellFails = (game, animal) => {
  if (animal.hasTrait(tt.TraitShell, true)) return ERRORS.TRAIT_MULTIPLE;
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, animal.ownerId, animal.id)) return ERRORS.COOLDOWN;
  if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.TAKE_SHELL, animal.ownerId, animal.id)) return ERRORS.COOLDOWN;
  if (animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) return ERRORS.TRAIT_REGENERATION_DEAD;
  const traitRegeneration = animal.hasTrait(tt.TraitRegeneration, true);
  if (traitRegeneration && traitRegeneration.getDataModel()._getErrorOfTraitPlacement(animal)) return ERRORS.TRAIT_REGENERATION_TRAIT_MAX;
  return false;
};

export const checkIfTraitDisabledByIntellect = (attackEntity, defenseTrait) => {
  const traitIntellectValue = getIntellectValue(attackEntity);
  return traitIntellectValue === defenseTrait.id || traitIntellectValue === defenseTrait.type;
};