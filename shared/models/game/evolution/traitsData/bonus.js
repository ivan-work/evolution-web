import {fromJS} from 'immutable';
import {PHASE} from '../../GameModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , CTT_PARAMETER
  , TRAIT_ANIMAL_FLAG, HUNT_FLAG
} from '../constants';
import ERRORS from '../../../../actions/errors';

import {
  server$startFeedingFromGame
  , server$traitStartCooldown
  , server$traitSetAnimalFlag
  , server$traitNotify_End, server$startCooldownList, getFeedingCooldownList
} from '../../../../actions/actions';

import * as tt from '../traitTypes';
import {
  getErrorOfAnimalEatingFromPlant,
  getErrorOfAnimalEatingFromPlantNoCD,
  getErrorOfPlantCounterAttack
} from "../../../../actions/trait.checks";
import {server$huntStart_Plant} from "./hunt";

export const TraitRstrategy = {
  type: tt.TraitRstrategy
  , cardTargetType: CTT_PARAMETER.ANIMAL
};

export const TraitHomeothermy = {
  type: tt.TraitHomeothermy
  , food: 1
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , replaceOnPlantarium: tt.TraitPlantHomeothermy
  , cooldowns: fromJS([
    [tt.TraitHomeothermy, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: (game, animal, traitSpec) => {
    if (game.getFood() === 0) return ERRORS.GAME_FOOD;
    if (!animal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    if (animal.getNeededFood() === 0) return ERRORS.ANIMAL_DONT_NEED_FOOD;
  }
  , action: (game, animal, trait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    dispatch(server$startFeedingFromGame(game.id, animal.id));
    return true;
  }
};

export const TraitShy = {
  type: tt.TraitShy
  , action: (game, animal, trait) => (dispatch) => {
    dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.SHY, true));
    return false;
  }
  , customFns: {
    onRemove: (game, animal) => (dispatch) => {
      dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.SHY, false));
    }
  }
};

export const TraitPlantHomeothermy = {
  type: tt.TraitPlantHomeothermy
  , food: 1
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.PLANT
  , replaceOnPlantarium: tt.TraitPlantHomeothermy
  , cooldowns: fromJS([
    [tt.TraitHomeothermy, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: (game, animal, traitSpec) => {
    if (!animal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    if (animal.getNeededFood() === 0) return ERRORS.ANIMAL_DONT_NEED_FOOD;
  }
  , getErrorOfUseOnTarget: (game, animal, plant) => {
    return (
      getErrorOfAnimalEatingFromPlantNoCD(game, animal, plant)
    )
  }
  , action: (game, animal, trait, plant) => (dispatch, getState) => {
    const errorOfPlantCounterAttack = !!getErrorOfPlantCounterAttack(game, animal, plant);
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    if (errorOfPlantCounterAttack) {
      dispatch(server$startFeedingFromGame(game.id, animal.id, 1, 'PLANT', plant.id));
    } else {
      dispatch(server$huntStart_Plant(game.id, null, plant, animal
        , HUNT_FLAG.TRAIT_HOMEOTHERMY
        , HUNT_FLAG.PLANT_COUNTERATTACK
      ));
    }
    return true;
  }
};