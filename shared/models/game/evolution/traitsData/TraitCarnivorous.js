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
  , server$startFeedingFromGame
  , server$traitStartCooldown
  , server$traitActivate
  , traitQuestion
  , server$traitDefenceQuestion
  , server$traitDefenceAnswer
  , server$traitIntellectQuestion
  , server$traitIntellectAnswer
  , server$traitAnswerSuccess
  , server$traitNotify_Start
  , server$traitNotify_End
  , traitAmbushEnd
  , server$traitSetValue
} from '../../../../actions/actions';
import {selectGame} from '../../../../selectors';

import {QuestionRecord} from '../../GameModel';
import {
  TraitMimicry
  , TraitRunning
  , TraitTailLoss
  , TraitShell
  , TraitInkCloud
} from './index';

import {
  TraitScavenger
  , TraitSymbiosis
  , TraitSharpVision
  , TraitCamouflage
  , TraitMassive
  , TraitPoisonous
  , TraitBurrowing
  , TraitSwimming
  , TraitFlight
  , TraitIntellect
} from '../traitTypes/index';

export const endHunt = (game, sourceAnimal, traitCarnivorous, targetAnimal) => (dispatch) => {
  dispatch(server$traitStartCooldown(game.id, traitCarnivorous, sourceAnimal));
  dispatch(endHuntNoCd(game, sourceAnimal, traitCarnivorous, targetAnimal));
};

export const endHuntNoCd = (game, sourceAnimal, traitCarnivorous, targetAnimal) => (dispatch) => {
  if (game.ambush) {
    const {animal} = game.locateAnimal(game.ambush);
    if (animal) {
      dispatch(traitAmbushEnd(game.id, animal));
      dispatch(server$startFeedingFromGame(game.id, animal.id, 1));
    }
  }
  dispatch(server$traitNotify_End(game.id, sourceAnimal.id, traitCarnivorous, targetAnimal.id));
};

const countStaticDefenses = (game, sourceAnimal, targetAnimal) => {
  let defenses = 0;
  if (targetAnimal.hasTrait(TraitCamouflage) && !sourceAnimal.hasTrait(TraitSharpVision))
    defenses++;
  if (targetAnimal.traits.some(trait => trait.type === TraitSymbiosis && trait.linkSource))
    defenses++;
  if (targetAnimal.hasTrait(TraitMassive) && !sourceAnimal.hasTrait(TraitMassive))
    defenses++;
  if (targetAnimal.hasTrait(TraitBurrowing) && targetAnimal.isSaturated())
    defenses++;
  if (sourceAnimal.hasTrait(TraitSwimming) && !targetAnimal.hasTrait(TraitSwimming)
    || (!sourceAnimal.hasTrait(TraitSwimming) && targetAnimal.hasTrait(TraitSwimming)))
    defenses++;
  if (targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL))
    defenses++;
  if (targetAnimal.hasTrait(TraitFlight) && (sourceAnimal.traits.size >= targetAnimal.traits.size))
    defenses++;

  return defenses;
};

const countAffectiveDefenses = (game, sourceAnimal, targetAnimal) => {
  return [
    targetAnimal.hasTrait(TraitPoisonous)
  ].filter(trait => !!trait);
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
    const possibleDefenses = [];
    let possibleDefenseTargets = 0;
    let traitMimicry, traitMimicryTargets, traitTailLoss, traitTailLossTargets, traitRunning, traitShell, traitInkCloud;

    const traitIntellect = sourceAnimal.hasTrait(TraitIntellect);
    let disabledTid = traitIntellect && traitIntellect.value;

    targetAnimal.traits.find((defenseTrait) => {
      if (defenseTrait.id === disabledTid) return;

      if (defenseTrait.type === TraitRunning.type) {
        traitRunning = defenseTrait;
        possibleDefenses.push(defenseTrait);
      } else if (defenseTrait.type === TraitMimicry.type && defenseTrait.checkAction(game, targetAnimal)) {
        traitMimicry = defenseTrait;
        traitMimicryTargets = TraitMimicry.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
        possibleDefenseTargets += traitMimicryTargets.size;
        if (traitMimicryTargets.size > 0) possibleDefenses.push(defenseTrait);
      } else if (defenseTrait.type === TraitTailLoss.type && defenseTrait.checkAction(game, targetAnimal)) {
        traitTailLoss = defenseTrait;
        traitTailLossTargets = targetAnimal.traits;
        possibleDefenseTargets += traitTailLossTargets.size;
        if (traitTailLossTargets.size > 0) possibleDefenses.push(defenseTrait);
      } else if (defenseTrait.type === TraitShell.type && defenseTrait.checkAction(game, targetAnimal)) {
        traitShell = defenseTrait;
        possibleDefenses.push(defenseTrait);
      } else if (defenseTrait.type === TraitInkCloud.type && defenseTrait.checkAction(game, targetAnimal)) {
        traitInkCloud = defenseTrait;
        possibleDefenses.push(defenseTrait);
      }
    });

    if (traitIntellect && !disabledTid) {
      // default intellect found, need to ask
      const staticDefenses = countStaticDefenses(game, sourceAnimal, targetAnimal);
      if (staticDefenses === 0) {
        const affectiveDefenses = countAffectiveDefenses(game, sourceAnimal, targetAnimal);

        if (possibleDefenses.length === 0 && affectiveDefenses.length === 0) {} //do nothing
        else if (possibleDefenses.length === 1 && affectiveDefenses.length === 0) disabledTid = possibleDefenses[0].id;
        else if (possibleDefenses.length === 0 && affectiveDefenses.length === 1) disabledTid = affectiveDefenses[0].id;
        else {
          const defaultIntellect = (questionId) => {
            const targetId = (possibleDefenses.length > 0 ? possibleDefenses[0].id
              : affectiveDefenses.length > 0 ? affectiveDefenses[0].id
              : true);
            return server$traitIntellectAnswer(game.id, questionId, traitIntellect.id, targetId);
          };
          dispatch(server$traitIntellectQuestion(game, sourceAnimal, trait, targetAnimal, defaultIntellect));
          return false;
        }
      }
    }

    if (traitRunning && !!TraitRunning.action()) {
      dispatch(server$traitNotify_Start(game, targetAnimal, traitRunning, sourceAnimal));
      dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));
      return true;
    }

    const defaultDefence = (questionId) => (dispatch, getState) => {
      if (traitTailLoss && traitTailLossTargets.size > 0 && traitTailLoss.id !== disabledTid && disabledTid !== true) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , TraitTailLoss.type
          , traitTailLossTargets.last().id
        ));
        return false;
      } else if (traitMimicry && traitMimicryTargets.size > 0 && traitMimicry.id !== disabledTid && disabledTid !== true) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , TraitMimicry.type
          , traitMimicryTargets.get(0).id
        ));
        return false;
      } else if (traitShell && traitShell.id !== disabledTid && disabledTid !== true) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , traitShell.id
        ));
        return false;
      } else if (traitInkCloud && traitInkCloud.id !== disabledTid && disabledTid !== true) {
        dispatch(server$traitDefenceAnswer(game.id
          , questionId
          , traitInkCloud.id
        ));
        return false;
      } else {
        dispatch(server$traitAnswerSuccess(game.id, questionId));
        dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));

        const poisonous = targetAnimal.hasTrait(TraitPoisonous);
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

    logger.debug(`possibleDefences: ${possibleDefenses.length}/${possibleDefenseTargets}`)
    if (possibleDefenseTargets > 1) {
      dispatch(server$traitDefenceQuestion(game.id, sourceAnimal, trait, targetAnimal, defaultDefence));
      return false;
    } else {
      const question = QuestionRecord.new(QuestionRecord.DEFENSE, sourceAnimal, trait.id, targetAnimal);
      logger.debug('server$traitDefenceQuestionInstant', question.id, sourceAnimal.id, trait.id, targetAnimal.id);
      dispatch(traitQuestion(game.id, question));
      return dispatch(defaultDefence(question.id));
    }
  }
  , $checkAction: (game, sourceAnimal) => {
    return sourceAnimal.canEat(game)
  }
  , checkTarget: (game, sourceAnimal, targetAnimal) => {
    const defenses = countStaticDefenses(game, sourceAnimal, targetAnimal);

    if (sourceAnimal.hasTrait(TraitIntellect)) {
      return defenses < 2;
    } else {
      return defenses < 1;
    }
  }
};