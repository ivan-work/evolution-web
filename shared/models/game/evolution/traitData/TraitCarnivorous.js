import {fromJS} from 'immutable';
import {TRAIT_TARGET_TYPE, TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from '../constants';
import {
  server$traitKillAnimal
  , server$startFeeding
  , server$startCooldown
  , server$traitActivate
  , server$traitStartCooldown
} from '../../../../actions/actions';
import {GameModel} from '../../GameModel';
import {TraitMimicry, TraitRunning, TraitScavenger} from './index';

export const TraitCarnivorous = {
  type: 'TraitCarnivorous'
  , food: 1
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , checkTraitPlacement: (animal) => !animal.hasTrait('TraitScavenger')
  , cooldowns: fromJS([
    ['TraitCarnivorous', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, targetAnimal) => (dispatch, getState) => {
    let success = true;
    const traitMimicry = targetAnimal.hasTrait(TraitMimicry.type);
    const traitRunning = targetAnimal.hasTrait(TraitRunning.type);
    if (traitRunning) {
      success = !TraitRunning.action();
      if (!success) {
        dispatch(server$traitStartCooldown(game.id, TraitCarnivorous, sourceAnimal));
        return true;
      }
    }
    if (success && traitMimicry) {
      //dispatch(server$traitActivate(game, sourceAnimal, TraitMimicry, targetAnimal.id))
      success = !dispatch(server$traitActivate(game, targetAnimal, TraitMimicry, sourceAnimal.id, TraitCarnivorous))
    }

    if (success) {
      dispatch(server$traitStartCooldown(game.id, TraitCarnivorous, sourceAnimal));
      dispatch(server$traitKillAnimal(game.id, sourceAnimal, targetAnimal));

      // Scavenge
      const currentPlayerIndex = game.getPlayer(sourceAnimal.ownerId).index;
      GameModel.sortPlayersFromIndex(game, currentPlayerIndex).some(player => player.continent.some(animal => {
        const traitScavenger = animal.hasTrait(TraitScavenger.type);
        if (traitScavenger && animal.canEat(game) > 0) {
          dispatch(server$startFeeding(game.id, animal, 1));
          return true;
        }
      }));

      dispatch(server$startFeeding(game.id, sourceAnimal, 2));
      return true;
    }
  }
  , $checkAction: (game, sourceAnimal) => {
    return sourceAnimal.canEat(game)
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