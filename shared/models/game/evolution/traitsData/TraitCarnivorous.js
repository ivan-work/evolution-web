import logger from '~/shared/utils/logger';
import {fromJS} from 'immutable';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , FOOD_SOURCE_TYPE
} from '../constants';
import {
  server$traitKillAnimal
  , server$startFeeding
  , server$traitStartCooldown
  , server$traitActivate
  , server$traitDefenceQuestion
  , server$traitDefenceQuestionInstant
  , server$traitDefenceAnswer
  , server$traitNotify_End
} from '../../../../actions/actions';

import {endTurnIfNoOptions} from '../../../../actions/ai';

import {checkAction} from '../TraitDataModel';
import {
  TraitMimicry
  , TraitRunning
  , TraitPoisonous
  , TraitTailLoss
} from './index';

import {
  TraitScavenger
  , TraitSymbiosis
  , TraitSharpVision
  , TraitCamouflage
  , TraitMassive
  , TraitBurrowing
  , TraitSwimming
} from '../traitTypes/index';

const endHunt = (game, sourceAnimal, targetAnimal) => (dispatch) => {
  dispatch(server$traitStartCooldown(game.id, TraitCarnivorous, sourceAnimal));
  dispatch(server$traitNotify_End(game.id, sourceAnimal.id, TraitCarnivorous.type, targetAnimal.id));
};

export const TraitCarnivorous = {
  type: 'TraitCarnivorous'
  , food: 1
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , playerControllable: true
  , checkTraitPlacement: (animal) => !animal.hasTrait(TraitScavenger)
  , cooldowns: fromJS([
    ['TraitCarnivorous', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, targetAnimal) => (dispatch, getState) => {
    logger.debug(`TraitCarnivorous: ${sourceAnimal.id} > ${targetAnimal.id}`);
    let needToAskTargetUser;
    let traitMimicry, traitTailLoss;

    let ended = targetAnimal.traits.some((trait) => {
      if (trait.type === TraitRunning.type) {
        if (dispatch(TraitRunning.action(game, targetAnimal, sourceAnimal))) {
          dispatch(endHunt(game, sourceAnimal, targetAnimal));
          return true;
        }
      } else if (trait.type === TraitMimicry.type && checkAction(game, TraitMimicry, targetAnimal)) {
        traitMimicry = TraitMimicry.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
        if (traitMimicry.size > 1) needToAskTargetUser = true;
        if (traitMimicry.size === 0) traitMimicry = void 0;
      } else if (trait.type === TraitTailLoss.type && checkAction(game, TraitTailLoss, targetAnimal)) {
        traitTailLoss = targetAnimal.traits;
        if (traitTailLoss.size > 1) needToAskTargetUser = true;
        if (traitTailLoss.size === 0) traitTailLoss = void 0;
      }
    });

    if (ended) return true;

    const defaultDefence = (questionId) => (dispatch, getState) => {
      if (traitTailLoss) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , TraitTailLoss.type
          , traitTailLoss.size - 1
        ));
        return true;
      } else if (traitMimicry) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , TraitMimicry.type
          , traitMimicry.get(0).id
        ));
        return false;
      } else {
        dispatch(server$traitKillAnimal(game.id, sourceAnimal, targetAnimal));

        if (targetAnimal.hasTrait(TraitPoisonous.type)) {
          dispatch(server$traitActivate(game, targetAnimal, TraitPoisonous, sourceAnimal));
        }

        // Scavenge
        dispatch(server$startFeeding(game.id, sourceAnimal, 2, FOOD_SOURCE_TYPE.ANIMAL_HUNT, targetAnimal.id));

        const currentPlayerIndex = game.getPlayer(sourceAnimal.ownerId).index;
        game.constructor.sortPlayersFromIndex(game, currentPlayerIndex).some(player => player.continent.some(animal => {
          const traitScavenger = animal.hasTrait(TraitScavenger);
          if (traitScavenger && animal.canEat(game) > 0) {
            dispatch(server$startFeeding(game.id, animal, 1));
            return true;
          }
        }));

        dispatch(endHunt(game, sourceAnimal, targetAnimal));
        return true;
      }
      //dispatch(endTurnIfNoOptions())
    };

    if (needToAskTargetUser) {
      dispatch(server$traitDefenceQuestion(game.id, sourceAnimal, TraitCarnivorous.type, targetAnimal, defaultDefence));
      return false;
    } else {
      return dispatch(server$traitDefenceQuestionInstant(game.id, sourceAnimal, TraitCarnivorous.type, targetAnimal, defaultDefence));
    }
  }
  , $checkAction: (game, sourceAnimal) => {
    return sourceAnimal.canEat(game)
  }
  , checkTarget: (game, sourceAnimal, targetAnimal) => (
    (sourceAnimal.hasTrait(TraitSharpVision) || !targetAnimal.hasTrait(TraitCamouflage))
    && (!targetAnimal.traits.some(trait => trait.type === TraitSymbiosis && trait.linkSource && trait.hostAnimalId === targetAnimal.id))
    && (sourceAnimal.hasTrait(TraitMassive) || !targetAnimal.hasTrait(TraitMassive))
    && !(targetAnimal.canSurvive() && targetAnimal.hasTrait(TraitBurrowing))
    && (
      (sourceAnimal.hasTrait(TraitSwimming) && targetAnimal.hasTrait(TraitSwimming))
      || (!sourceAnimal.hasTrait(TraitSwimming) && !targetAnimal.hasTrait(TraitSwimming))
    )
  )
};