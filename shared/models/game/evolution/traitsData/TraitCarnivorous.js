import logger from '~/shared/utils/logger';
import {fromJS} from 'immutable';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , TRAIT_ANIMAL_FLAG
  , HUNT_FLAG
} from '../constants';
import ERRORS from '../../../../actions/errors';

import {PHASE} from '../../GameModel';

import {
  TraitMimicry
  , TraitTailLoss
} from './index';

import * as tt from '../traitTypes/index';
import {
  huntGetFlag,
  server$huntStart_Animal
} from "./hunt";
import * as ptt from "../plantarium/plantTraitTypes";

export const countUnavoidableDefenses = (game, sourceAnimal, targetAnimal) => {
  let defenses = 0;
  if (sourceAnimal.hasTrait(tt.TraitSwimming) && !targetAnimal.hasTrait(tt.TraitSwimming))
    defenses++;
  if (targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION))
    defenses++;
  return defenses;
};

export const getStaticDefenses = (game, sourceAnimal, targetAnimal) =>
  targetAnimal.traits.filter((trait) =>
    !trait.disabled && (
      (trait.type === tt.TraitCamouflage && !sourceAnimal.hasTrait(tt.TraitSharpVision))
      || (trait.type === tt.TraitSymbiosis && trait.linkSource && !trait.findLinkedTrait(game).disabled)
      || (trait.type === tt.TraitMassive && !sourceAnimal.hasTrait(tt.TraitMassive))
      || (trait.type === tt.TraitBurrowing && targetAnimal.isSaturated() && game.status.phase !== PHASE.AMBUSH)
      || (trait.type === tt.TraitSwimming && !sourceAnimal.hasTrait(tt.TraitSwimming))
      || (trait.type === tt.TraitShell && targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL))
      || (trait.type === tt.TraitFlight && !trait.getErrorOfUse(game, sourceAnimal, targetAnimal))
      || (trait.type === tt.TraitShy && targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.SHY))
    )).toArray();

// [tt.TraitRunning, tt.TraitShell, tt.TraitInkCloud, tt.TraitCnidocytes, tt.TraitMimicry, tt.TraitTailLoss, tt.TraitPoisonous];

export const getAffectiveDefenses = (game, sourceAnimal, targetAnimal) =>
  targetAnimal.traits.filter((trait) =>
    !trait.disabled && (
      (trait.type === tt.TraitPoisonous)
    )).toArray();

export const getActiveDefenses = (game, attackEntity, attackTrait, targetAnimal) => {
  const skipOptionalDefence = huntGetFlag(game, HUNT_FLAG.OPTIONAL_DEFENCE_OFF);
  return targetAnimal.traits.filter((trait) => {
    return !trait.disabled && (
      (trait.type === tt.TraitRunning && !trait.getErrorOfUse(game, targetAnimal))
      || (trait.type === tt.TraitShell && !trait.getErrorOfUse(game, targetAnimal) && !skipOptionalDefence)
      || (trait.type === tt.TraitInkCloud && !trait.getErrorOfUse(game, targetAnimal) && !skipOptionalDefence)
      || (trait.type === tt.TraitCnidocytes
        && !trait.getErrorOfUse(game, targetAnimal, attackEntity, attackTrait)
        && !trait.getDataModel().getErrorOfUseOnTarget(game, targetAnimal, trait, attackEntity)
      )
      || (trait.type === tt.TraitMimicry && !trait.getErrorOfUse(game, targetAnimal, attackEntity, attackTrait))
      || (trait.type === tt.TraitTailLoss && !trait.getErrorOfUse(game, targetAnimal, attackEntity, attackTrait))
    );
  }).toArray();
};

export const findAnglerfish = (game, targetAnimal) => {
  if (targetAnimal.getTraits(true).size === 0) {
    return game.getPlayer(targetAnimal.ownerId).continent.find(animal => {
      const traitAnglerfish = animal.hasTrait(tt.TraitAnglerfish);
      return (
        traitAnglerfish
        && !traitAnglerfish.getErrorOfUse(game, animal)
        && (animal === targetAnimal || traitAnglerfish.value)
      );
    })
  }
};

export const getIntellectValue = (attackEntity) => {
  const traitIntellect = attackEntity.hasTrait(tt.TraitIntellect) || attackEntity.hasTrait(ptt.PlantTraitHiddenIntellect);
  return traitIntellect && traitIntellect.value;
};

export const findDefaultActiveDefence = (game, attackAnimal, attackTrait, targetAnimal) => {
  const disabledTid = getIntellectValue(attackAnimal);
  const activeDefense = getActiveDefenses(game, attackAnimal, attackTrait, targetAnimal)
    .filter(t => !t.isEqual(disabledTid))[0];
  if (activeDefense) {
    if (activeDefense.type === tt.TraitTailLoss) {
      return [activeDefense.type, TraitTailLoss.getTargets(game, targetAnimal, activeDefense, attackAnimal, attackTrait).last().id]
    } else if (activeDefense.type === tt.TraitMimicry) {
      return [activeDefense.type, TraitMimicry.getTargets(game, targetAnimal, activeDefense, attackAnimal, attackTrait).first().id]
    }
    return [activeDefense.type];
  }
  return null;
};

export const TraitCarnivorous = {
  type: tt.TraitCarnivorous
  , food: 1
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , playerControllable: true
  , checkTraitPlacement: (animal) => !animal.hasTrait(tt.TraitScavenger, true)
  , cooldowns: fromJS([
    [tt.TraitCarnivorous, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, attackAnimal, attackTrait, targetAnimal, ...flags) => (dispatch, getState) => {
    dispatch(server$huntStart_Animal(game.id, attackAnimal, attackTrait, targetAnimal, ...flags));
    return false;
  }
  , _getErrorOfUse: (game, sourceAnimal) => {
    if (!sourceAnimal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    return false;
  }
  , getErrorOfUseOnTarget: (game, sourceAnimal, targetAnimal) => {
    const unavoidable = countUnavoidableDefenses(game, sourceAnimal, targetAnimal);
    if (unavoidable > 0) return ERRORS.TRAIT_ATTACK_UNAVOIDABLE;

    const defenses = getStaticDefenses(game, sourceAnimal, targetAnimal);
    if (defenses.length > 1) return ERRORS.TRAIT_ATTACK_TOO_MUCH_DEFENSES;
    if (defenses.length === 1) {
      const traitIntellect = sourceAnimal.hasTrait(tt.TraitIntellect);
      if (!traitIntellect) return ERRORS.TRAIT_ATTACK_TOO_MUCH_DEFENSES;

      const intellectIsUnavailable = traitIntellect.getErrorOfUse(game, sourceAnimal);
      const intellectTargetsDefense = defenses[0].id === traitIntellect.value;

      if (!intellectTargetsDefense && intellectIsUnavailable) return ERRORS.TRAIT_ATTACK_TOO_MUCH_DEFENSES;
    }
    return false;
  }
};