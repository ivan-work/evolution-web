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

import {
  checkTraitActivation
  , checkIfTraitDisabledByIntellect
} from '../../../../actions/trait.checks';

import {selectGame} from '../../../../selectors';

import {TraitModel} from '../TraitModel';
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
  , TraitAnglerfish
} from '../traitTypes/index';

export const endHunt = (game, sourceAnimal, traitCarnivorous, targetAnimal) => (dispatch) => {
  dispatch(server$traitStartCooldown(game.id, traitCarnivorous, sourceAnimal));
  dispatch(endHuntNoCd(game.id, sourceAnimal, traitCarnivorous, targetAnimal));
};

export const endHuntNoCd = (gameId, sourceAnimal, traitCarnivorous, targetAnimal) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const traitIntellect = sourceAnimal.hasTrait('TraitIntellect');
  if (!!traitIntellect && traitIntellect.value === true) dispatch(server$traitSetValue(game, sourceAnimal, traitIntellect, false));
  dispatch(server$traitNotify_End(game.id, sourceAnimal.id, traitCarnivorous, targetAnimal.id));
  if (game.huntingCallbacks.size > 0) {
    dispatch(traitClearHuntingCallbacks(game.id));
    game.huntingCallbacks.forEach((callback) => {
      dispatch(callback(game, sourceAnimal, traitCarnivorous, targetAnimal))
    });
  }
};

const countUnavoidableDefenses = (game, sourceAnimal, targetAnimal) => {
  let defenses = 0;
  if (sourceAnimal.hasTrait(TraitSwimming) && !targetAnimal.hasTrait(TraitSwimming))
    defenses++;
  return defenses;
};

export const getStaticDefenses = (game, sourceAnimal, targetAnimal) =>
  targetAnimal.traits.filter((trait) =>
    (trait.type === TraitCamouflage && !sourceAnimal.hasTrait(TraitSharpVision))
    || (trait.type === TraitSymbiosis && trait.linkSource)
    || (trait.type === TraitMassive && !sourceAnimal.hasTrait(TraitMassive))
    || (trait.type === TraitBurrowing && targetAnimal.isSaturated())
    || (trait.type === TraitSwimming && !sourceAnimal.hasTrait(TraitSwimming))
    || (trait.type === TraitShell.type && targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL))
    || (trait.type === TraitFlight && (sourceAnimal.traits.size >= targetAnimal.traits.size))
  ).toArray();

export const getAffectiveDefenses = (game, sourceAnimal, targetAnimal) => [
  targetAnimal.hasTrait(TraitPoisonous)
].filter(trait => !!trait);

export const getActiveDefenses = (game, sourceAnimal, targetAnimal) =>
  targetAnimal.traits.filter((trait) =>
    (trait.type === TraitRunning.type)
    || (trait.type === TraitMimicry.type && trait.checkAction(game, targetAnimal))
    || (trait.type === TraitTailLoss.type && trait.checkAction(game, targetAnimal))
    || (trait.type === TraitShell.type && trait.checkAction(game, targetAnimal))
    || (trait.type === TraitInkCloud.type && trait.checkAction(game, targetAnimal))
  ).toArray();

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

    /**
     * Check for counter-attack (aka anglerfish)
     */
    const animalAnglerfish = game.getPlayer(targetAnimal.ownerId).continent.filter(animal =>
      animal.traits.size === 1
      && animal.traits.first().type === TraitAnglerfish
      && animal.traits.first().checkAction(game, animal)
      && (targetAnimal === animal || (
        animal.traits.first().value === true
        && targetAnimal.traits.size === 0
      ))
    ).get(0);

    if (animalAnglerfish) {
      const traitAnglerfish = animalAnglerfish.traits.first();
      const newTraitCarnivorous = TraitModel.new('TraitCarnivorous');
      const newTraitIntellect = TraitModel.new(TraitIntellect);

      dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));

      dispatch(server$traitAnimalAttachTrait(game, animalAnglerfish, newTraitCarnivorous));
      dispatch(server$traitAnimalAttachTrait(game, animalAnglerfish, newTraitIntellect));
      dispatch(server$traitAnimalRemoveTrait(game, animalAnglerfish, traitAnglerfish));
      const reselectedGame = selectGame(getState, game.id);
      const {animal: revealledAnglerfish} = reselectedGame.locateAnimal(animalAnglerfish.id, animalAnglerfish.ownerId);
      if (TraitCarnivorous.checkTarget(reselectedGame, revealledAnglerfish, sourceAnimal)) {
        dispatch(traitAddHuntingCallback(game.id, (game) => dispatch => {
          const {animal} = reselectedGame.locateAnimal(animalAnglerfish.id, animalAnglerfish.ownerId);
          if (animal) {
            const traitIntellect = animal.hasTrait(TraitIntellect);
            if (traitIntellect) dispatch(server$traitAnimalRemoveTrait(game, animal, traitIntellect));
          }
        }));
        dispatch(server$traitActivate(game, animalAnglerfish, newTraitCarnivorous, sourceAnimal));
      } else {
        dispatch(server$traitAnimalRemoveTrait(game, animalAnglerfish, newTraitIntellect));
      }
      return true;
    }

    /**
     * Get defenses info
     */

    logger.debug(`TraitCarnivorous: ${sourceAnimal.id} > ${targetAnimal.id}`);
    const possibleDefenses = [];
    let possibleDefenseTargets = 0;
    let traitMimicry, traitMimicryTargets, traitTailLoss, traitTailLossTargets, traitRunning, traitShell, traitInkCloud;

    const traitIntellect = sourceAnimal.hasTrait(TraitIntellect);
    const canUseIntellect = traitIntellect && traitIntellect.checkAction(game, sourceAnimal);
    const disabledTid = !!traitIntellect && traitIntellect.value;
    logger.debug(`traitIntellect: ${traitIntellect}; ${canUseIntellect}; ${disabledTid}`);

    getActiveDefenses(game, sourceAnimal, targetAnimal)
      .forEach((defenseTrait) => {
        if (defenseTrait.isEqual(disabledTid)) return;

        if (defenseTrait.type === TraitRunning.type) {
          traitRunning = defenseTrait;
          possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === TraitInkCloud.type) {
          traitInkCloud = defenseTrait;
          possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === TraitTailLoss.type) {
          traitTailLoss = defenseTrait;
          traitTailLossTargets = TraitTailLoss.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
          possibleDefenseTargets += traitTailLossTargets.size;
          if (traitTailLossTargets.size > 0) possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === TraitShell.type) {
          traitShell = defenseTrait;
          possibleDefenses.push(defenseTrait);
        } else if (defenseTrait.type === TraitMimicry.type) {
          traitMimicry = defenseTrait;
          traitMimicryTargets = TraitMimicry.getTargets(game, sourceAnimal, TraitCarnivorous, targetAnimal);
          possibleDefenseTargets += traitMimicryTargets.size;
          if (traitMimicryTargets.size > 0) possibleDefenses.push(defenseTrait);
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
      const staticDefenses = getStaticDefenses(game, sourceAnimal, targetAnimal)
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
      }
    }
    /**
     * Actual attack started - check for running first
     * */

    if (traitRunning && !!TraitRunning.action() && !traitRunning.isEqual(disabledTid)) {
      dispatch(server$traitNotify_Start(game, targetAnimal, traitRunning, sourceAnimal));
      dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));
      return true;
    }

    /**
     * Make function for default defense
     * */
      // if user has no options or if user didn't respond - outcome will be the same, so we DRY

    const defaultDefence = (questionId) => (dispatch, getState) => {
        if (traitTailLoss && traitTailLossTargets.size > 0 && !traitTailLoss.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , TraitTailLoss.type
            , traitTailLossTargets.last().id
          ));
          return false;
        } else if (traitMimicry && traitMimicryTargets.size > 0 && !traitMimicry.isEqual(disabledTid)) {
          dispatch(server$traitDefenceAnswer(game.id
            , questionId
            , TraitMimicry.type
            , traitMimicryTargets.get(0).id
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
          dispatch(server$traitAnswerSuccess(game.id, questionId));

          const poisonous = targetAnimal.hasTrait(TraitPoisonous);
          if (poisonous && !poisonous.isEqual(disabledTid)) {
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

          dispatch(endHunt(game, sourceAnimal, trait, targetAnimal));
          return true;
        }
      };

    /**
     * Now we determine if we need to ask user at all
     * */

    logger.debug(`Should ask DEFENCE question? ${possibleDefenses.map(t => t.type)} / ${possibleDefenseTargets} = ${(possibleDefenses.length > 1 || possibleDefenseTargets > 1)}`);
    if (possibleDefenses.length > 1 || possibleDefenseTargets > 1) {
      dispatch(server$traitDefenceQuestion(game.id, sourceAnimal, trait, targetAnimal, defaultDefence));
      return false;
    } else {
      const question = QuestionRecord.new(QuestionRecord.DEFENSE, targetAnimal.ownerId, sourceAnimal, trait.id, targetAnimal, 0);
      logger.debug('server$traitDefenceQuestionInstant', question.id, sourceAnimal.id, trait.id, targetAnimal.id);
      dispatch(traitQuestion(game.id, question));
      return dispatch(defaultDefence(question.id));
    }
  }
  , $checkAction: (game, sourceAnimal) => {
    return sourceAnimal.canEat(game)
  }
  , checkTarget: (game, sourceAnimal, targetAnimal) => {
    const unavoidable = countUnavoidableDefenses(game, sourceAnimal, targetAnimal);
    if (unavoidable > 0) return false;

    const defenses = getStaticDefenses(game, sourceAnimal, targetAnimal).length;

    return sourceAnimal.hasTrait(TraitIntellect)
      ? defenses < 2
      : defenses < 1;
  }
};