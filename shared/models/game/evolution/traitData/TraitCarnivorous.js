import {fromJS} from 'immutable';
import {TRAIT_TARGET_TYPE, TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from '../constants';
import {
  server$traitKillAnimal
  , server$startFeeding
  , server$startCooldown
} from '../../../../actions/actions';
import {TraitMimicry} from './index';

export const TraitCarnivorous = {
  type: 'TraitCarnivorous'
  , food: 1
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldowns: fromJS([
    ['TraitCarnivorous', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: ({game, sourcePlayerId, sourceAnimal, targetPlayerId, targetAnimal}) => (dispatch, getState) => {
    const mimicryTrait = targetAnimal.hasTrait(TraitMimicry.type);
    if (mimicryTrait) {
      dispatch(mimicryTrait.dataModel.action({game, sourcePlayerId, sourceAnimal, targetPlayerId, targetAnimal}))
    } else {
      TraitCarnivorous.cooldowns.forEach(([link, place, duration]) => {
        const placeId = (place === TRAIT_COOLDOWN_PLACE.PLAYER
          ? sourcePlayerId
          : sourceAnimal.id);
        dispatch(server$startCooldown(game.id, link, duration, place, placeId));
      });
      dispatch(server$traitKillAnimal(game.id, sourcePlayerId, sourceAnimal.id, targetPlayerId, targetAnimal.id));
      dispatch(server$startFeeding(game.id, sourceAnimal, 2));
    }
  }
  , checkAction: (game, sourceAnimal) => {
    if (TraitCarnivorous.cooldowns.some(([link, place]) =>
        game.cooldowns.checkFor(link, sourceAnimal.ownerId, sourceAnimal.id))) {
      return false;
    }
    return sourceAnimal.needsFood() > 0
  }
  , checkTarget: (game, sourceAnimal, targetAnimal) => (
    (sourceAnimal.hasTrait('TraitSharpVision') || !targetAnimal.hasTrait('TraitCamouflage'))
    //&& (sourceAnimal.hasTrait('TraitMassive') || !targetAnimal.hasTrait('TraitMassive'))
    //&& (!targetAnimal.canSurvive() || targetAnimal.hasTrait('TraitBurrowing'))
    //&& (
    //  (sourceAnimal.hasTrait('TraitSwimming') && targetAnimal.hasTrait('TraitSwimming'))
    //  || (!sourceAnimal.hasTrait('TraitSwimming') && !targetAnimal.hasTrait('TraitSwimming'))
    //)
  )
};