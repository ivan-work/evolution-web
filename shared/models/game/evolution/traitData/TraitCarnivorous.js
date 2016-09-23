import {TRAIT_TARGET_TYPE, TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from './constants';
import {traitKillAnimal} from '~/shared/actions/actions';
import {traitGiveFood} from '~/shared/actions/actions';

export const TraitCarnivorous = {
  type: 'TraitCarnivorous'
  , food: 1
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldownCost: TRAIT_COOLDOWN_DURATION.PHASE
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownLink: 'TraitCarnivorous'
  , action: ({game, sourcePlayerId, sourceAnimal, targetPlayerId, targetAnimalId}) => (getState, dispatch) => {
      //if (mimicry) {
      //  askUser()
      //    .then()
      //}

      dispatch(traitKillAnimal({game, sourcePlayerId, sourceAnimal, targetPlayerId, targetAnimal}));

      // dispatch(traitMimicryAsk)
      // dispatch(traitMimicryRequest)
      // dispatch(traitScavenger)
  }
  , checkAction: (game, sourceAnimal) => sourceAnimal.canEat()
  , checkTarget: (game, sourceAnimal, targetAnimal) => (
    (sourceAnimal.hasTrait('TraitSharpVision') || !targetAnimal.hasTrait('TraitCamouflage'))
    && (sourceAnimal.hasTrait('TraitMassive') || !targetAnimal.hasTrait('TraitMassive'))
    //&& (!targetAnimal.canSurvive() || targetAnimal.hasTrait('TraitBurrowing'))
    && (
      (sourceAnimal.hasTrait('TraitSwimming') && targetAnimal.hasTrait('TraitSwimming'))
      || (!sourceAnimal.hasTrait('TraitSwimming') && !targetAnimal.hasTrait('TraitSwimming'))
    )
  )
};