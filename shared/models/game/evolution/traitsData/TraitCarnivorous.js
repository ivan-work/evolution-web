import logger from '~/shared/utils/logger';
import uuid from 'uuid';
import {List, fromJS} from 'immutable';
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
  , traitQuestion
  , server$traitDefenceQuestion
  , server$traitDefenceAnswer
  , server$traitIntellectQuestion
  , server$traitIntellectAnswer
  , server$traitAnswerSuccess
  , server$traitNotify_Start
  , server$traitNotify_End
  , server$traitAnimalAttachTrait
  , server$traitAnimalRemoveTrait
  , traitAddHuntingCallback
  , traitClearHuntingCallbacks
  , server$traitSetValue
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import {TraitModel} from '../TraitModel';
import {PHASE, QuestionRecord} from '../../GameModel';

import {
  TraitMimicry
  , TraitRunning
  , TraitTailLoss
} from './index';

import * as tt from '../traitTypes/index';

export const endHunt = (game, sourceAnimal, traitCarnivorous, targetAnimal) => (dispatch, getState) => {
  dispatch(server$traitStartCooldown(game.id, traitCarnivorous, sourceAnimal));
  dispatch(endHuntNoCd(game.id, sourceAnimal, traitCarnivorous, targetAnimal));
};

export const endHuntNoCd = (gameId, sourceAnimal, traitCarnivorous, targetAnimal) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const traitIntellect = sourceAnimal.hasTrait(tt.TraitIntellect);
  if (!!traitIntellect && traitIntellect.value === true) dispatch(server$traitSetValue(game, sourceAnimal, traitIntellect, false));
  dispatch(server$traitNotify_End(game.id, sourceAnimal.id, traitCarnivorous, targetAnimal.id));
  if (game.huntingCallbacks.size > 0) {
    dispatch(traitClearHuntingCallbacks(game.id));
    game.huntingCallbacks.forEach((callback) => {
      dispatch(callback(selectGame(getState, gameId), sourceAnimal, traitCarnivorous, targetAnimal))
    });
  }
};

const countUnavoidableDefenses = (game, sourceAnimal, targetAnimal) => {
  let defenses = 0;
  if (sourceAnimal.hasTrait(tt.TraitSwimming) && !targetAnimal.hasTrait(tt.TraitSwimming))
    defenses++;
  if (targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION))
    defenses++;
  return defenses;
};

export const getStaticDefenses = (game, sourceAnimal, targetAnimal) =>
  targetAnimal.traits.filter((trait) =>
  !trait.disabled && (
    (trait.type === tt.TraitCamouflage && !sourceAnimal.hasTrait(tt.TraitSharpVision))
    || (trait.type === tt.TraitSymbiosis && trait.linkSource)
    || (trait.type === tt.TraitMassive && !sourceAnimal.hasTrait(tt.TraitMassive))
    || (trait.type === tt.TraitBurrowing && targetAnimal.isSaturated() && game.status.phase !== PHASE.AMBUSH)
    || (trait.type === tt.TraitSwimming && !sourceAnimal.hasTrait(tt.TraitSwimming))
    || (trait.type === tt.TraitShell && targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL))
    || (trait.type === tt.TraitFlight && (sourceAnimal.traits.size >= targetAnimal.traits.size))
    || (trait.type === tt.TraitShy && targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.SHY))
  )).toArray();

export const getAffectiveDefenses = (game, sourceAnimal, targetAnimal) =>
  targetAnimal.traits.filter((trait) =>
  !trait.disabled && (
    (trait.type === tt.TraitPoisonous)
  )).toArray();

export const getActiveDefenses = (game, sourceAnimal, targetAnimal, passiveDefence = false) =>
  targetAnimal.traits.filter((trait) =>
  !trait.disabled && (
    (trait.type === tt.TraitRunning && !trait.checkActionFails(game, targetAnimal))
    || (trait.type === tt.TraitMimicry && !trait.checkActionFails(game, targetAnimal))
    || (trait.type === tt.TraitTailLoss && !trait.checkActionFails(game, targetAnimal))
    || (trait.type === tt.TraitShell && !trait.checkActionFails(game, targetAnimal) && !passiveDefence)
    || (trait.type === tt.TraitInkCloud && !trait.checkActionFails(game, targetAnimal) && !passiveDefence)
    || (trait.type === tt.TraitCnidocytes && !trait.checkActionFails(game, targetAnimal))
  )).toArray();

export const TraitCarnivorous = {
  type: 'TraitCarnivorous'
  , food: 1
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , playerControllable: true
  , checkTraitPlacement: (animal) => !animal.hasTrait(tt.TraitScavenger, true)
  , cooldowns: fromJS([
    ['TraitCarnivorous', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, trait, targetAnimal, passiveDefence) => (dispatch, getState) => {
    /**
     * Check for counter-attack (aka anglerfish)
     */

    {
      const animalAnglerfish = game.getPlayer(targetAnimal.ownerId).continent.filter(animal =>
        animal.traits.size === 1
        && animal.traits.first().type === tt.TraitAnglerfish
        && animal.traits.first().checkAction(game, animal)
        && (targetAnimal === animal || (
          animal.traits.first().value === true
          && targetAnimal.traits.size === 0
        ))
      ).first();

      if (animalAnglerfish) {
        const traitAnglerfish = animalAnglerfish.traits.first();
        const newTraitCarnivorous = TraitModel.new(tt.TraitCarnivorous);
        const newTraitIntellect = TraitModel.new(tt.TraitIntellect);

        dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));

        dispatch(server$traitAnimalAttachTrait(game, animalAnglerfish, newTraitCarnivorous));
        dispatch(server$traitAnimalAttachTrait(game, animalAnglerfish, newTraitIntellect));
        dispatch(server$traitAnimalRemoveTrait(game, animalAnglerfish, traitAnglerfish));
        game = selectGame(getState, game.id);
        const revealledAnglerfish = game.locateAnimal(animalAnglerfish.id, animalAnglerfish.ownerId);
        if (TraitCarnivorous.checkTarget(game, revealledAnglerfish, sourceAnimal)) {
          dispatch(traitAddHuntingCallback(game.id, (game) => dispatch => {
            const animal = game.locateAnimal(animalAnglerfish.id, animalAnglerfish.ownerId);
            if (animal) {
              const traitIntellect = animal.hasTrait(tt.TraitIntellect);
              if (traitIntellect) dispatch(server$traitAnimalRemoveTrait(game, animal, traitIntellect));
            }
          }));
          dispatch(server$traitActivate(game, animalAnglerfish, newTraitCarnivorous, sourceAnimal));
        } else {
          dispatch(server$traitAnimalRemoveTrait(game, animalAnglerfish, newTraitIntellect));
        }
        return true;
      }
    }

    /**
     * Get defenses info
     */

    logger.debug(`TraitCarnivorous: ${sourceAnimal.id} > ${targetAnimal.id}`);
    const staticDefenses = getStaticDefenses(game, sourceAnimal, targetAnimal);
    const possibleDefenses = [];
    let possibleDefenseTargets = 0;
    let traitMimicry, traitMimicryTargets, traitTailLoss, traitTailLossTargets, traitRunning, traitShell, traitInkCloud, traitCnidocytes;

    const traitIntellect = sourceAnimal.hasTrait(tt.TraitIntellect);
    if (traitIntellect && staticDefenses.length === 1) {
      dispatch(server$traitActivate(game, sourceAnimal, traitIntellect, staticDefenses[0]));
      game = selectGame(getState, game.id);
    }
    const canUseIntellect = traitIntellect && traitIntellect.checkAction(game, sourceAnimal);
    const disabledTid = !!traitIntellect && traitIntellect.value;
    logger.debug(`traitIntellect: ${traitIntellect}; ${canUseIntellect}; ${disabledTid}`);

    getActiveDefenses(game, sourceAnimal, targetAnimal, passiveDefence)
      .forEach((defenseTrait) => {
        if (defenseTrait.isEqual(disabledTid)) return;

        if (defenseTrait.type === tt.TraitRunning) {
          traitRunning = defenseTrait;
          possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === tt.TraitInkCloud) {
          traitInkCloud = defenseTrait;
          possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === tt.TraitTailLoss) {
          traitTailLoss = defenseTrait;
          traitTailLossTargets = TraitTailLoss.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
          possibleDefenseTargets += traitTailLossTargets.size;
          if (traitTailLossTargets.size > 0) possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === tt.TraitShell) {
          traitShell = defenseTrait;
          possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === tt.TraitMimicry) {
          traitMimicry = defenseTrait;
          traitMimicryTargets = TraitMimicry.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
          possibleDefenseTargets += traitMimicryTargets.size;
          if (traitMimicryTargets.size > 0) possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === tt.TraitCnidocytes) {
          traitCnidocytes = defenseTrait;
          possibleDefenses.push(defenseTrait);
        }
      });

    /**
     * Get Intellect info
     * After defences because we need to know, if it will be useful to use intellect.
     * disabledTid = string ID | 'Ignore' | false
     */

    if (canUseIntellect && !disabledTid) {
      // default intellect found, need to ask
      const unavoidableDefenses = countUnavoidableDefenses(game, sourceAnimal, targetAnimal);
      logger.debug(`${sourceAnimal.id} activates Intellect`);
      logger.debug(`unavoidableDefenses: ${unavoidableDefenses}`);
      logger.debug(`staticDefenses: ${staticDefenses.map(t => t.type) || []}`);
      if (unavoidableDefenses === 0 && staticDefenses.length === 0) {
        logger.debug(`possibleDefenses: ${possibleDefenses.map(t => t.type)}`);
        const affectiveDefenses = getAffectiveDefenses(game, sourceAnimal, targetAnimal);
        logger.debug(`affectiveDefenses: ${affectiveDefenses.map(t => t.type)}`);

        const defaultIntellect = (questionId) => {
          const targetId = (possibleDefenses.length > 0 ? possibleDefenses[0].id
            : affectiveDefenses.length > 0 ? affectiveDefenses[0].id
              : true);
          return server$traitIntellectAnswer(game.id, questionId, traitIntellect.id, targetId);
        };

        if (possibleDefenses.length !== 0 || affectiveDefenses.length !== 0) {
          dispatch(server$traitIntellectQuestion(game.id, sourceAnimal, trait, targetAnimal, defaultIntellect));
          return false;
        }
      } else {
        logger.error('unavoidableDefenses + staticDefenses > 0')
      }
    }

    /**
     * Make function for default defense
     * */
      // if user has no options or if user didn't respond - outcome will be the same, so we DRY

    const traitShy = targetAnimal.hasTrait(tt.TraitShy);
    if (traitShy) {
      dispatch(traitAddHuntingCallback(game.id, (game) => dispatch => {
        const animal = game.locateAnimal(targetAnimal.id);
        const traitShy = animal.hasTrait(tt.TraitShy);
        if (traitShy) dispatch(traitShy.getDataModel().action(game, targetAnimal, traitShy));
      }));
    }

    const defaultDefence = (questionId) => (dispatch, getState) => {
        if (traitRunning && !traitRunning.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , tt.TraitRunning
          ));
          return false;
        } else if (traitCnidocytes && !traitCnidocytes.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , tt.TraitCnidocytes
          ));
          return false;
        } else if (traitTailLoss && traitTailLossTargets.size > 0 && !traitTailLoss.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , tt.TraitTailLoss
            , traitTailLossTargets.last().id
          ));
          return false;
        } else if (traitMimicry && traitMimicryTargets.size > 0 && !traitMimicry.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , tt.TraitMimicry
            , traitMimicryTargets.first().id
          ));
          return false;
        } else if (traitShell && !traitShell.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , traitShell.id
          ));
          return false;
        } else if (traitInkCloud && !traitInkCloud.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , traitInkCloud.id
          ));
          return false;
        } else {
          game = selectGame(getState, game.id);

          if (traitCnidocytes && !traitCnidocytes.isEqual(disabledTid) && !traitCnidocytes.checkActionFails(game, sourceAnimal)) {
            dispatch(traitCnidocytes.getDataModel().customFns.paralyze(game.id, targetAnimal, traitCnidocytes, sourceAnimal));
          }

          dispatch(server$traitAnswerSuccess(game.id, questionId));

          const traitPoisonous = targetAnimal.hasTrait(tt.TraitPoisonous);
          if (traitPoisonous && !traitPoisonous.isEqual(disabledTid)) {
            dispatch(server$traitActivate(game, targetAnimal, traitPoisonous, sourceAnimal));
          }

          dispatch(server$traitKillAnimal(game.id, sourceAnimal, targetAnimal));

          dispatch(traitAddHuntingCallback(game.id, (game) => dispatch => {
            dispatch(server$startFeeding(game.id, sourceAnimal.id, 2, 'TraitCarnivorous'));

            // Scavenge
            const currentPlayerIndex = game.getPlayer(sourceAnimal.ownerId).index;

            game.constructor.sortPlayersFromIndex(game, currentPlayerIndex).some(player => player.continent.some(animal => {
              const traitScavenger = animal.hasTrait(tt.TraitScavenger);
              if (traitScavenger && animal.canEat(game) > 0) {
                dispatch(server$startFeeding(game.id, animal.id, 1, tt.TraitScavenger, sourceAnimal.id));
                return true;
              }
            }));
          }));

          dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));
          return true;
        }
      };

    /**
     * Now we determine if we need to ask user at all
     * */

    logger.debug(`Should ask DEFENCE question? ${possibleDefenses.map(t => t.type)} / ${possibleDefenseTargets} = ${(possibleDefenses.length > 1 || possibleDefenseTargets > 1)}`);
    if (possibleDefenses.length > 1
      || possibleDefenseTargets > 1
      || possibleDefenses.some(t => t.getDataModel().optional)) {
      dispatch(server$traitDefenceQuestion(game.id, sourceAnimal, trait, targetAnimal, defaultDefence));
      return false;
    } else {
      const question = QuestionRecord.new(QuestionRecord.DEFENSE, targetAnimal.ownerId, sourceAnimal, trait.id, targetAnimal, 0);
      logger.debug('server$traitDefenceQuestionInstant', question.id, sourceAnimal.id, trait.id, targetAnimal.id);
      dispatch(traitQuestion(game.id, question));
      return dispatch(defaultDefence(question.id));
    }
  }
  , $checkAction: (game, sourceAnimal) => sourceAnimal.canEat(game)
  , checkTarget: (game, sourceAnimal, targetAnimal) => {
    const unavoidable = countUnavoidableDefenses(game, sourceAnimal, targetAnimal);
    if (unavoidable > 0) return false;

    const defenses = getStaticDefenses(game, sourceAnimal, targetAnimal).length;

    const traitIntellect = sourceAnimal.hasTrait(tt.TraitIntellect);

    return (traitIntellect && !traitIntellect.checkActionFails(game, sourceAnimal))
      ? defenses < 2
      : defenses < 1;
  }
};