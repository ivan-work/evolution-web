import {fromJS} from 'immutable';
import {PHASE} from '../../GameModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , TRAIT_ANIMAL_FLAG, HUNT_FLAG
} from '../constants';
import ERRORS from '../../../../actions/errors';

import {
  server$startFeeding
  , server$traitActivate
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitGrazeFood
  , server$traitSetAnimalFlag
  , server$startFeedingFromGame
  , server$traitSetValue
  , server$traitNotify_End
  , server$traitConvertFat
  , server$gamePlantUpdateFood
} from '../../../../actions/actions';

import {getIntRandom} from '../../../../utils/randomGenerator';

import * as tt from '../traitTypes';

import {TraitCarnivorous} from './TraitCarnivorous';
import {huntSetFlag, server$huntEnd, server$huntProcess} from "./hunt";
import {getErrorOfAnimalEatingFromPlantNoCD} from "../../../../actions/trait.checks";
import {server$activateViviparous} from "../../../../actions/trait";

export {TraitCarnivorous};
export * from './ttf';
export * from './cons';
export * from './bonus';

export const TraitWaiter = {
  type: tt.TraitWaiter
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([[tt.TraitWaiter, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]])
  , action: () => (dispatch) => true
};

export const TraitParasite = {
  type: tt.TraitParasite
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , food: 2
};

export const TraitFatTissue = {
  type: tt.TraitFatTissue
  , multiple: true
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitFatTissue, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitFatTissue) => (dispatch) => {
    dispatch(server$traitConvertFat(game.id, sourceAnimal, traitFatTissue));
    dispatch(server$traitStartCooldown(game.id, traitFatTissue, sourceAnimal));
    return true;
  }
  , _getErrorOfUse: (game, sourceAnimal, trait) => {
    if (!trait.value) return ERRORS.TRAIT_ACTION_NO_VALUE;
    if (sourceAnimal.isSaturated()) return ERRORS.ANIMAL_DONT_NEED_FOOD;
    return false;
  }
};

//

export const TraitSwimming = {
  type: tt.TraitSwimming
};

export const TraitRunning = {
  type: tt.TraitRunning
  , defense: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitRunning, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , action: (game, defenseAnimal, traitRunning, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitRunning, defenseAnimal));
    if (getIntRandom(0, 1) > 0) {
      dispatch(server$huntEnd(game.id));
      return true;
    } else {
      return dispatch(server$huntProcess(game.id));
    }
  }
};

export const TraitMimicry = {
  type: tt.TraitMimicry
  , defense: true
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldowns: fromJS([
    [tt.TraitMimicry, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , getErrorOfUseOnTarget: (game, mimicryAnimal, targetAnimal, attackAnimal, attackTrait) => {
    if (targetAnimal.id === mimicryAnimal.id) return ERRORS.TRAIT_TARGETING_SAME_ANIMAL;
    if (targetAnimal.id === attackAnimal.id) return ERRORS.TRAIT_TARGETING_SAME_ANIMAL;

    return attackTrait.getDataModel().getErrorOfUseOnTarget(game, attackAnimal, targetAnimal);
  }
  , getTargets: (game, mimicryAnimal, traitMimicry, attackAnimal, attackTrait) => {
    return game.getPlayer(mimicryAnimal.ownerId).continent.filter((targetAnimal) => (
      !TraitMimicry.getErrorOfUseOnTarget(game, mimicryAnimal, targetAnimal, attackAnimal, attackTrait)
    )).toList();
  }
  , _getErrorOfUse: (game, mimicryAnimal, traitMimicry, attackAnimal, attackTrait) => {
    const targets = TraitMimicry.getTargets(game, mimicryAnimal, traitMimicry, attackAnimal, attackTrait);
    if (targets.size === 0) return ERRORS.TRAIT_ACTION_NO_TARGETS;
    return false;
  }
  , action: (game, mimicryAnimal, traitMimicry, newTargetAnimal, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, traitMimicry, mimicryAnimal));
    dispatch(server$traitActivate(game.id, attackAnimal.id, attackTrait, newTargetAnimal));
    return false;
  }
};

export const TraitScavenger = {
  type: tt.TraitScavenger
  , checkTraitPlacement: (animal) => !animal.hasTrait(tt.TraitCarnivorous, true)
};

//

export const TraitSymbiosis = {
  type: tt.TraitSymbiosis
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF_ONEWAY
};

export const TraitPiracy = {
  type: tt.TraitPiracy
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitPiracy, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, sourceAnimal, traitPiracy, targetAnimal) => dispatch => {
    dispatch(server$traitStartCooldown(game.id, traitPiracy, sourceAnimal));
    dispatch(server$startFeeding(game.id, sourceAnimal.id, 1, tt.TraitPiracy, targetAnimal.id));
    dispatch(server$traitNotify_End(game.id, sourceAnimal.id, traitPiracy, targetAnimal.id));
    return true;
  }
  , _getErrorOfUse: (game, sourceAnimal) => {
    if (!sourceAnimal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    if (sourceAnimal.getNeededFood() === 0) return ERRORS.ANIMAL_DONT_NEED_FOOD;
    return false;
  }
  , getErrorOfUseOnTarget: (game, sourceAnimal, targetAnimal) => {
    if (targetAnimal.food === 0) return ERRORS.TRAIT_TARGETING_ANIMAL_NO_FOOD;
    if (targetAnimal.isSaturated()) return ERRORS.TRAIT_TARGETING_ANIMAL_SATURATED;
  }
};

export const TraitTailLoss = {
  type: tt.TraitTailLoss
  , defense: true
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , cooldowns: fromJS([
    [tt.TraitTailLoss, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , getErrorOfUseOnTarget: (game, sourceAnimal, targetTrait) => {
    if (targetTrait.type === tt.TraitTrematode) return ERRORS.TRAIT_TYPE_DENIED;
  }
  , getTargets: (game, defenseAnimal, defenseTrait, attackAnimal, attackTrait) => defenseAnimal.getTraits()
    .toList()
    .filter(t => !TraitTailLoss.getErrorOfUseOnTarget(game, defenseAnimal, t))
  // , _getErrorOfUse: (game, defenseAnimal, defenseTrait, attackAnimal, attackTrait) => {
  //   return false; // optimisation since TraitTailLoss is always available;
  //   // const targets = TraitTailLoss.getTargets(game, defenseAnimal, defenseTrait, attackAnimal, attackTrait);
  //   // return targets > 0;
  // }
  , action: (game, targetAnimal, trait, targetTrait, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitAnimalRemoveTrait(game, targetAnimal, targetTrait));

    dispatch(huntSetFlag(game.id, HUNT_FLAG.FEED_FROM_TAIL_LOSS));

    dispatch(server$huntEnd(game.id));
    return true;
  }
};

//

export const TraitGrazing = {
  type: tt.TraitGrazing
  , replaceOnPlantarium: tt.TraitPlantGrazing
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitGrazing, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitGrazing) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitGrazing, sourceAnimal));
    dispatch(server$traitGrazeFood(game.id, 1, sourceAnimal));
    return true;
  }
  , _getErrorOfUse: (game, sourceAnimal) => {
    if (game.getFood() === 0) return ERRORS.GAME_FOOD;
    return false;
  }
};

export const TraitPlantGrazing = {
  type: tt.TraitPlantGrazing
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitGrazing, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: (game, animal, trait) => {
    if (!trait.value) return ERRORS.TRAIT_ACTION_NO_VALUE;
    const plant = game.getPlant(trait.value);
    if (plant.getFood() === 0) return ERRORS.TRAIT_ACTION_NO_TARGETS;
    return false;
  }
  , action: (game, sourceAnimal, traitGrazing) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitGrazing, sourceAnimal));
    dispatch(server$gamePlantUpdateFood(game.id, traitGrazing.value, -1));
    dispatch(server$traitSetValue(game, sourceAnimal, traitGrazing, false));
    return true;
  }
  , customFns: {
    eventNextPlayer: (trait) => trait.set('value', false)
  }
};

export const TraitMassive = {
  type: tt.TraitMassive
  , food: 1
};

export const TraitHibernation = {
  type: tt.TraitHibernation
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitHibernation, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TWO_TURNS]
  ])
  , action: (game, animal, traitHibernation) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitHibernation, animal));
    dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.HIBERNATED));
    if (!animal.isSaturated(game)) {
      dispatch(server$activateViviparous(game.id, animal.id));
    }
    return true;
  }
  , _getErrorOfUse: (game, sourceAnimal) => {
    if (sourceAnimal.isFull()) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    if (game.deck.size === 0) return ERRORS.GAME_LAST_TURN;
    return false;
  }
  , customFns: {
    onRemove: (game, animal) => (dispatch) => {
      dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.HIBERNATED, false))
    }
  }
};

export const TraitPoisonous = {
  type: tt.TraitPoisonous
  , targetType: TRAIT_TARGET_TYPE.NONE
  , action: (game, sourceAnimal, trait, targetAnimal) => (dispatch) => {
    dispatch(server$traitSetAnimalFlag(game, targetAnimal, TRAIT_ANIMAL_FLAG.POISONED));
    return true;
  }
};

//

export const TraitCooperation = {
  type: tt.TraitCooperation
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitCooperation, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: (game, animal, trait) => {
    const linkedAnimal = trait.findLinkedAnimal(game, animal);
    if (!trait.value) return ERRORS.TRAIT_ACTION_NO_VALUE;
    if (!linkedAnimal) return ERRORS.TRAIT_ACTION_NO_TARGETS;
    if (!linkedAnimal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;

    const {sourceType, sourceId} = trait.value;
    if (sourceType === 'GAME') {
      if (game.getFood() === 0) return ERRORS.GAME_FOOD;
    } else if (sourceType === 'PLANT') {
      const plant = game.getPlant(sourceId);
      return getErrorOfAnimalEatingFromPlantNoCD(game, linkedAnimal, plant)
    }
    return false;
  }
  , action: (game, animal, trait) => (dispatch) => {
    const animal1 = animal;
    const animal2 = trait.findLinkedAnimal(game, animal);
    const trait1 = trait;
    const trait2 = trait.findLinkedTrait(game);

    const {sourceType, sourceId, autoShare} = trait.value;

    dispatch(server$traitSetValue(game, animal1, trait1, false));

    dispatch(server$traitStartCooldown(game.id, trait1, animal1));
    dispatch(server$traitStartCooldown(game.id, trait2, animal2));

    return dispatch(server$startFeedingFromGame(game.id, animal2.id, 1, sourceType, sourceId, animal.id, autoShare));
  }
  , customFns: {
    eventNextPlayer: (trait) => trait.set('value', false)
  }
};

export const TraitCommunication = {
  type: tt.TraitCommunication
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitCommunication, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: (game, animal, trait) => {
    const linkedAnimal = trait.findLinkedAnimal(game, animal);
    if (!trait.value) return ERRORS.TRAIT_ACTION_NO_VALUE;
    if (!linkedAnimal) return ERRORS.TRAIT_ACTION_NO_TARGETS;
    if (!linkedAnimal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    return false;
  }
  , action: (game, animal, trait) => (dispatch) => {
    const animal1 = animal;
    const animal2 = trait.findLinkedAnimal(game, animal);
    const trait1 = trait;
    const trait2 = trait.findLinkedTrait(game);

    const {sourceType, sourceId, autoShare} = trait.value;

    dispatch(server$traitSetValue(game, animal1, trait1, false));

    dispatch(server$traitStartCooldown(game.id, trait1, animal1));
    dispatch(server$traitStartCooldown(game.id, trait2, animal2));

    dispatch(server$startFeeding(game.id, animal2.id, 1, tt.TraitCommunication, animal.id, autoShare));

    return true;
  }
  , customFns: {
    eventNextPlayer: (trait) => trait.set('value', false)
  }
};

export const TraitBurrowing = {
  type: tt.TraitBurrowing
};

export const TraitCamouflage = {
  type: tt.TraitCamouflage
};

export const TraitSharpVision = {
  type: tt.TraitSharpVision
};