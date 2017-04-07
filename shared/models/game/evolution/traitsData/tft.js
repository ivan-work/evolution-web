import logger from '~/shared/utils/logger';
import {fromJS} from 'immutable';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , TRAIT_ANIMAL_FLAG
} from '../constants';

import {
  server$startFeeding
  , server$traitActivate
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitGrazeFood
  , server$traitSetAnimalFlag
  , server$traitNotify_End
} from '../../../../actions/actions';

export const TraitMetamorphose = {
  type: 'TraitMetamorphose'
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitCarnivorous', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitMetamorphose, targetTrait) => (dispatch, getState) => {
    dispatch(server$traitAnimalRemoveTrait(game.id, sourceAnimal, targetTrait.id));
    dispatch(server$startFeeding(game.id, sourceAnimal, 1, 'TraitMetamorphose'));
    dispatch(server$traitStartCooldown(game.id, TraitMetamorphose, sourceAnimal));
    return true;
  }
};

//export const TraitShell = {
//  type: 'TraitShell'
//  , cooldowns: fromJS([
//    ['TraitShell', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
//  ])
//  , action: (game, sourceAnimal, trait) => (dispatch) => {
//    dispatch(server$traitSetAnimalFlag(game, sourceAnimal, TRAIT_ANIMAL_FLAG.SHELL))
//    return true;
//  }
//};

export const TraitIntellect = {type: 'TraitIntellect'};
export const TraitAnglerfish = {type: 'TraitAnglerfish'};
export const TraitTrematode = {type: 'TraitTrematode'};
export const TraitInkCloud = {type: 'TraitInkCloud'};
export const TraitViviparous = {type: 'TraitViviparous'};
export const TraitAmbush = {type: 'TraitAmbush'};
export const TraitFlight = {type: 'TraitFlight'};
export const TraitSpecA = {type: 'TraitSpecA'};
export const TraitSpecB = {type: 'TraitSpecB'};
