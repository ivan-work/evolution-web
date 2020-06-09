import logger from '~/shared/utils/logger';
import {List, fromJS} from 'immutable';
import {PHASE} from '../../GameModel';
import {AnimalModel} from '../AnimalModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , CARD_SOURCE
  , TRAIT_ANIMAL_FLAG, HUNT_FLAG
} from '../constants';
import ERRORS from '../../../../actions/errors';

import {
  server$startFeeding
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitSetAnimalFlag
  , server$traitSetValue
  , startCooldown
  , server$gameDeployAnimalFromDeck
  , server$startCooldownList
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import {
  getStaticDefenses,
  getActiveDefenses,
  getAffectiveDefenses
} from './TraitCarnivorous';
import * as tt from '../traitTypes';
import {allHuntsSetFlag, huntSetFlag, server$huntEnd} from "./hunt";

export const TraitMetamorphose = {
  type: tt.TraitMetamorphose
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitMetamorphose, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitMetamorphose, targetTrait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, traitMetamorphose, sourceAnimal));

    dispatch(server$startFeeding(game.id, sourceAnimal.id, 1, tt.TraitMetamorphose));

    dispatch(server$traitAnimalRemoveTrait(game, sourceAnimal, targetTrait));

    return true;
  }
  , _getErrorOfUse: (game, sourceAnimal) => {
    if (sourceAnimal.getWantedFood() === 0) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    if (sourceAnimal.getEatingBlockers(game).length > 1) return ERRORS.ANIMAL_BLOCKED_FROM_FOOD;
    return false;
  }
  , getErrorOfUseOnTarget: (game, sourceAnimal, targetTrait) => {
    if (targetTrait.getDataModel().food > 0) return ERRORS.TRAIT_TARGETING_NO_FOOD_ON_TRAIT;
    if (targetTrait.getDataModel().hidden) return ERRORS.TRAIT_ACTION_NO_TRAIT;
    const eatingBlockers = sourceAnimal.getEatingBlockers(game);
    if (eatingBlockers.length > 1) return ERRORS.ANIMAL_BLOCKED_FROM_FOOD;
    if (eatingBlockers.length === 1 && targetTrait.id !== eatingBlockers[0].id) return ERRORS.ANIMAL_BLOCKED_FROM_FOOD;
    return false;
  }
  , getTargets: (game, sourceAnimal, traitMetamorphose) => {
    const eatingBlockers = sourceAnimal.getEatingBlockers(game);
    if (eatingBlockers.length === 0)
      return sourceAnimal.getTraits().filter(trait => trait.getDataModel().food === 0).toList();
    else // length === 1
      return List(eatingBlockers);
  }
};

export const TraitShell = {
  type: tt.TraitShell
  , defense: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , optional: true
  , cooldowns: fromJS([
    [tt.TraitShell, TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , _getErrorOfUse: (game) => {
    if (game.status.phase !== PHASE.FEEDING) return ERRORS.GAME_WRONG_PHASE;
    return false;
  }
  , action: (game, defenseAnimal, defenseTrait, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, defenseTrait, defenseAnimal));
    dispatch(server$traitSetAnimalFlag(game, defenseAnimal, TRAIT_ANIMAL_FLAG.SHELL, true));
    dispatch(server$huntEnd(game.id));
    return true;
  }
  , customFns: {
    onRemove: (game, animal) => (dispatch) => {
      dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.SHELL, false));
    }
  }
};

export const TraitTrematode = {
  type: tt.TraitTrematode
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , linkTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , food: 1
};

export const TraitInkCloud = {
  type: tt.TraitInkCloud
  , defense: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , optional: true
  , cooldowns: fromJS([
    [tt.TraitInkCloud, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, defenseAnimal, defenseTrait, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, defenseTrait, defenseAnimal));
    dispatch(allHuntsSetFlag(game.id, HUNT_FLAG.TRAIT_INK_CLOUD));
    dispatch(server$huntEnd(game.id));
    return true;
  }
};

export const TraitThermosynthesis = {
  type: tt.TraitThermosynthesis
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , _getErrorOfTraitPlacement: (animal) => {
    if (animal.hasTrait(tt.TraitPhotosynthesis, true)) return tt.TraitThermosynthesis;
    return false;
  }
  , replaceOnPlantarium: tt.TraitSpecialization
  , cooldowns: fromJS([
    [tt.TraitThermosynthesis, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, animal, trait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    dispatch(server$startFeeding(game.id, animal.id, 1, trait.type));
    return true;
  }
  , _getErrorOfUse: (game, animal, traitSpec) => {
    if (!animal.canEat(game)) return ERRORS.ANIMAL_BLOCKED_FROM_FOOD;
    if (game.someAnimal((animal) => {
      const trait = animal.hasTrait(traitSpec.type);
      return trait && trait.id !== traitSpec.id;
    })) return ERRORS.TRAIT_ACTION_SPECIFIC;
    return false;
  }
};

export const TraitPhotosynthesis = {
  type: tt.TraitPhotosynthesis
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , _getErrorOfTraitPlacement: (animal) => {
    if (animal.hasTrait(tt.TraitThermosynthesis, true)) return tt.TraitPhotosynthesis;
    return false;
  }
  , replaceOnPlantarium: tt.TraitSpecialization
  , cooldowns: fromJS([
    [tt.TraitPhotosynthesis, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: TraitThermosynthesis.action
  , _getErrorOfUse: TraitThermosynthesis._getErrorOfUse
};

export const TraitFlight = {
  type: tt.TraitFlight
  , _getErrorOfUse: (game, sourceAnimal, traitFlight, targetAnimal) => {
    // console.log(sourceAnimal.toString(), targetAnimal.toString());
    // console.log(sourceAnimal.getTraits(true).size, targetAnimal.getTraits(true).size);
    if (sourceAnimal.getTraits(true).size < targetAnimal.getTraits(true).size) return ERRORS.TRAIT_ACTION_SPECIFIC;
    return false;
  }
};

export const TraitViviparous = {
  type: tt.TraitViviparous
  , targetType: TRAIT_TARGET_TYPE.NONE
  , food: 1
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    // dispatch(server$traitStartCooldown(game.id, trait, sourceAnimal));
    dispatch(server$gameDeployAnimalFromDeck(game.id, sourceAnimal, animal => animal.set('food', 1)));
  }
  , _getErrorOfUse: (game, animal) => {
    if (game.status.phase === PHASE.EXTINCTION) return ERRORS.GAME_WRONG_PHASE;
    if (game.deck.size === 0) return ERRORS.GAME_LAST_TURN;
    if (!animal.isSaturated(game)) return ERRORS.TRAIT_TARGETING_ANIMAL_SATURATED;
    return false;
  }
};

export const TraitAmbush = {
  type: tt.TraitAmbush
  , displayValue: true
};

export const TraitIntellect = {
  type: tt.TraitIntellect
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , food: 1
  , cooldowns: fromJS([
    [tt.TraitIntellect, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , getTargets: (game) => {
    const sourceAnimal = game.locateAnimal(game.question.sourceAid, game.question.sourcePid);
    const attackTrait = game.locateTrait(game.question.traitId, game.question.sourceAid, game.question.sourcePid);
    const targetAnimal = game.locateAnimal(game.question.targetAid, game.question.targetPid);
    return [].concat(
      getStaticDefenses(game, sourceAnimal, targetAnimal)
      , getActiveDefenses(game, sourceAnimal, attackTrait, targetAnimal)
      , getAffectiveDefenses(game, sourceAnimal, targetAnimal)
    );
  }
  , action: (game, sourceAnimal, traitIntellect, targetTraitId) => (dispatch, getState) => {
    dispatch(server$traitSetValue(game, sourceAnimal, traitIntellect, targetTraitId));
    if (targetTraitId !== true) {
      dispatch(server$traitStartCooldown(game.id, traitIntellect, sourceAnimal));
    }
    return false;
  }
  , customFns: {
    defaultTarget: (game, sourceAnimal, attackTrait, targetAnimal) => {
      const activeDefence = getActiveDefenses(game, sourceAnimal, attackTrait, targetAnimal)[0];
      if (activeDefence) {
        return activeDefence.id;
      }
      const affectiveDefence = getAffectiveDefenses(game, sourceAnimal, targetAnimal)[0];
      if (affectiveDefence) {
        return affectiveDefence.id;
      }
      return true;
    }
  }
};

export const TraitAnglerfish = {
  type: tt.TraitAnglerfish
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , transient: true
  , hidden: true
  , score: 0
  , displayValue: true
  , _getErrorOfUse: (game, animal) => {
    if (animal.getTraits(true).size > 0) return ERRORS.TRAIT_ACTION_SPECIFIC;
    return false;
  }
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    dispatch(server$traitSetValue(game, sourceAnimal, trait, !trait.value));
    return false;
  }
};

export const TraitSpecialization = {
  type: tt.TraitSpecialization
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF
  , linkTargetType: CARD_TARGET_TYPE.PLANT
};