import logger from '~/shared/utils/logger';
import uuid from 'uuid';
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
  , traitDefenceQuestion
  , server$traitDefenceQuestion
  , server$traitDefenceAnswer
  , server$traitDefenceAnswerSuccess
  , server$traitNotify_Start
  , server$traitNotify_End
} from '../../../../actions/actions';
import {selectGame} from '../../../../selectors';

import {QuestionRecord} from '../../GameModel';
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

const endHunt = (game, sourceAnimal, trait, targetAnimal) => (dispatch) => {
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
    let needToAskTargetUser;
    let traitMimicry, traitTailLoss;
    let ended = targetAnimal.traits.some((defenseTrait) => {
      if (defenseTrait.type === TraitRunning.type) {
        if (dispatch(TraitRunning.action(game, targetAnimal, sourceAnimal))) {
          dispatch(server$traitNotify_Start(game, targetAnimal, defenseTrait, sourceAnimal));
          dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));
          return true;
        }
      } else if (defenseTrait.type === TraitMimicry.type && checkAction(game, TraitMimicry, targetAnimal)) {
        traitMimicry = TraitMimicry.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
        if (traitMimicry.size > 1) needToAskTargetUser = true;
        if (traitMimicry.size === 0) traitMimicry = void 0;
      } else if (defenseTrait.type === TraitTailLoss.type && checkAction(game, TraitTailLoss, targetAnimal)) {
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
      } else {
        dispatch(server$traitDefenceAnswerSuccess(game.id, questionId));
        dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));

        const poisonous = targetAnimal.hasTrait(TraitPoisonous.type);
        if (poisonous) {
          dispatch(server$traitActivate(game, targetAnimal, poisonous, sourceAnimal));
        }

        dispatch(server$traitKillAnimal(game.id, sourceAnimal, targetAnimal));

        dispatch(server$startFeeding(game.id, sourceAnimal, 2, 'TraitCarnivorous'));

        // Scavenge
        const currentPlayerIndex = game.getPlayer(sourceAnimal.ownerId).index;
        // Selecing new game to not touch killed animal
        game.constructor.sortPlayersFromIndex(selectGame(getState, game.id), currentPlayerIndex).some(player => player.continent.some(animal => {
          const traitScavenger = animal.hasTrait(TraitScavenger);
          if (traitScavenger && animal.canEat(game) > 0) {
            dispatch(server$startFeeding(game.id, animal, 1, 'TraitScavenger', sourceAnimal.id));
            return true;
          }
        }));
        return true;
      }
    };

    if (needToAskTargetUser) {
      dispatch(server$traitDefenceQuestion(game.id, sourceAnimal, trait, targetAnimal, defaultDefence));
      return false;
    } else {
      const questionId = uuid.v4();
      logger.debug('server$traitDefenceQuestionInstant', questionId, sourceAnimal.id, trait.id, targetAnimal.id);
      const question = QuestionRecord.new(questionId, sourceAnimal, trait.id, targetAnimal);
      dispatch(traitDefenceQuestion(game.id, question));
      return dispatch(defaultDefence(questionId));
    }
  }
  , $checkAction: (game, sourceAnimal) => {
    return sourceAnimal.canEat(game)
  }
  , checkTarget: (game, sourceAnimal, targetAnimal) => (
    (sourceAnimal.hasTrait(TraitSharpVision) || !targetAnimal.hasTrait(TraitCamouflage))
    && (!targetAnimal.traits.some(trait => trait.type === TraitSymbiosis && trait.linkSource && trait.hostAnimalId === targetAnimal.id))
    && (sourceAnimal.hasTrait(TraitMassive) || !targetAnimal.hasTrait(TraitMassive))
    && !(targetAnimal.hasTrait(TraitBurrowing) && (targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) || (targetAnimal.food >= targetAnimal.sizeOfNormalFood())))
    && (
      (sourceAnimal.hasTrait(TraitSwimming) && targetAnimal.hasTrait(TraitSwimming))
      || (!sourceAnimal.hasTrait(TraitSwimming) && !targetAnimal.hasTrait(TraitSwimming))
    )
  )
};