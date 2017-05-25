import {fromJS} from 'immutable';
import {PHASE} from '../../GameModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , CTT_PARAMETER
  , TRAIT_ANIMAL_FLAG
} from '../constants';

import {
  server$startFeedingFromGame
  , server$traitActivate
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitSetAnimalFlag
  , server$traitNotify_End
} from '../../../../actions/actions';

import * as tt from '../traitTypes';

export const TraitRstrategy = {
  type: tt.TraitRstrategy
  , cardTargetType: CTT_PARAMETER.ANIMAL
};
export const TraitHomeothermy = {
  type: tt.TraitHomeothermy
  , food: 1
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitHomeothermy, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , $checkAction: (game, animal, traitSpec) => game.food > 0 && (animal.canEat(game) && animal.getNeededFood() > 0)
  , action: (game, animal, trait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    dispatch(server$startFeedingFromGame(game.id, animal.id, 1));
    return false;
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