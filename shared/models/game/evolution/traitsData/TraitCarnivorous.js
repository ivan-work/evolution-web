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
  server$traitKillAnimal
  , server$startFeeding
  , server$traitStartCooldown
  , server$traitActivate
  , server$traitDefenceQuestion
  , server$traitDefenceQuestionInstant
  , server$traitDefenceAnswer
  , server$traitNotify_Start
  , server$traitNotify_End
} from '../../../../actions/actions';

import {checkAction} from '../TraitDataModel';
import {
  TraitMimicry
  , TraitRunning
  , TraitPoisonous
  , TraitTailLoss
  , TraitShell
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

export const endHunt = (game, sourceAnimal, trait, targetAnimal) => (dispatch) => {
  dispatch(server$traitStartCooldown(game.id, TraitCarnivorous, sourceAnimal));
  dispatch(server$traitNotify_End(game.id, sourceAnimal.id, trait, targetAnimal.id));
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
  , action: (game, sourceAnimal, trait, targetAnimal) => (dispatch, getState) => {
    logger.debug(`TraitCarnivorous: ${sourceAnimal.id} > ${targetAnimal.id}`);
    let possibleDefences = 0;
    let traitMimicry, traitTailLoss, traitShell;

    const ended = targetAnimal.traits.some((defenseTrait) => {
      if (defenseTrait.type === TraitRunning.type) {
        if (dispatch(TraitRunning.action(game, targetAnimal, sourceAnimal))) {
          dispatch(server$traitNotify_Start(game, targetAnimal, defenseTrait, sourceAnimal));
          dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));
          return true;
        }
      } else if (defenseTrait.type === TraitMimicry.type && checkAction(game, TraitMimicry, targetAnimal)) {
        traitMimicry = TraitMimicry.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
        if (traitMimicry.size === 0) traitMimicry = void 0;
        else if (traitMimicry.size === 1) possibleDefences += 1;
        else if (traitMimicry.size > 1) possibleDefences += traitMimicry.size;
      } else if (defenseTrait.type === TraitTailLoss.type && checkAction(game, TraitTailLoss, targetAnimal)) {
        traitTailLoss = targetAnimal.traits;
        if (traitTailLoss.size === 0) traitTailLoss = void 0;
        else if (traitTailLoss.size === 1) possibleDefences += 1;
        else if (traitTailLoss.size > 1) possibleDefences += traitTailLoss.size;
      } else if (defenseTrait.type === TraitShell.type && checkAction(game, TraitShell, targetAnimal)) {
        traitShell = true;
        possibleDefences += 1;
      }
    });

    if (ended) return true;

    const defaultDefence = (questionId) => (dispatch, getState) => {
      if (traitTailLoss) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , targetAnimal.hasTrait(TraitTailLoss.type).id
          , traitTailLoss.last().id
        ));
        return true;
      } else if (traitMimicry) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , targetAnimal.hasTrait(TraitMimicry.type).id
          , traitMimicry.get(0).id
        ));
        return false;
      } else if (traitShell) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , targetAnimal.hasTrait(TraitShell.type).id
        ));
        return true;
      } else {
        const poisonous = targetAnimal.hasTrait(TraitPoisonous.type);
        if (poisonous) {
          dispatch(server$traitActivate(game, targetAnimal, poisonous, sourceAnimal));
        }

        // Scavenge
        dispatch(server$startFeeding(game.id, sourceAnimal, 2, 'TraitCarnivorous', targetAnimal.id));

        const currentPlayerIndex = game.getPlayer(sourceAnimal.ownerId).index;
        game.constructor.sortPlayersFromIndex(game, currentPlayerIndex).some(player => player.continent.some(animal => {
          const traitScavenger = animal.hasTrait(TraitScavenger);
          if (traitScavenger && animal.canEat(game) > 0) {
            dispatch(server$startFeeding(game.id, animal, 1, 'TraitScavenger', sourceAnimal.id));
            return true;
          }
        }));

        dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));

        dispatch(server$traitKillAnimal(game.id, sourceAnimal, targetAnimal));
        return true;
      }
    };

    if (possibleDefences > 1) {
      dispatch(server$traitDefenceQuestion(game.id, sourceAnimal, trait, targetAnimal, defaultDefence));
      return false;
    } else {
      return dispatch(server$traitDefenceQuestionInstant(game.id, sourceAnimal, trait, targetAnimal, defaultDefence));
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
    // TFT
    && !targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL)
  )
};