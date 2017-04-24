import logger from '~/shared/utils/logger';
import uuid from 'uuid';
import {ActionCheckError} from '../models/ActionCheckError';
import {TraitModel} from '../models/game/evolution/TraitModel';

import {SETTINGS_TIMED_OUT_TURN_TIME} from '../models/game/GameSettings';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
} from '../models/game/evolution/constants';

import {server$game} from './generic';
import {doesPlayerHasOptions} from './ai';
import {server$gameEndTurn, server$addTurnTimeout, server$gameCancelTurnTimeout} from './actions';

import {selectRoom, selectGame, selectUsersInGame} from '../selectors';

import {PHASE, QuestionRecord} from '../models/game/GameModel';
import {TraitCommunication, TraitCooperation, TraitViviparous, TraitCarnivorous, TraitAmbush, TraitIntellect} from '../models/game/evolution/traitTypes';

import {
  checkGameDefined
  , checkGameHasUser
  , checkGamePhase
  , checkPlayerHasAnimal
  , checkPlayerCanAct
  , checkPlayerTurn
  , passesChecks
} from './checks';

import {
  checkAnimalCanEat
  , checkTraitActivation
  , checkAnimalCanTakeShell
  , checkIfTraitDisabledByIntellect
} from './trait.checks';

import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';

/**
 * Activation
 */

export const traitTakeFoodRequest = (animalId) => (dispatch, getState) => dispatch({
  type: 'traitTakeFoodRequest'
  , data: {gameId: getState().get('game').id, animalId}
  , meta: {server: true}
});

export const traitActivateRequest = (sourceAid, traitId, targetId) => (dispatch, getState) => dispatch({
  type: 'traitActivateRequest'
  , data: {gameId: getState().get('game').id, sourceAid, traitId, targetId}
  , meta: {server: true}
});

export const server$traitActivate = (game, sourceAnimal, trait, ...params) => (dispatch, getState) => {
  if (!trait.getDataModel().transient) {
    dispatch(server$traitNotify_Start(game, sourceAnimal, trait, ...params));
  }
  const newGame = selectGame(getState, game.id);
  const {animal: newAnimal} = newGame.locateAnimal(sourceAnimal.id, sourceAnimal.ownerId);
  logger.verbose('server$traitActivate:', sourceAnimal.id, trait.type);
  const traitData = trait.getDataModel();
  const result = dispatch(traitData.action(newGame, newAnimal, trait, ...params));
  logger.silly('server$traitActivate finish:', trait.type, result);
  return result;
};

export const traitTakeShellRequest = (animalId, traitId) => (dispatch, getState) => dispatch({
  type: 'traitTakeShellRequest'
  , data: {gameId: getState().get('game').id, animalId, traitId}
  , meta: {server: true}
});

/**
 * Cooldowns
 */

// Transport action
export const startCooldown = (gameId, link, duration, place, placeId) => ({
  type: 'startCooldown'
  , data: {gameId, link, duration, place, placeId}
});

const clearCooldown = (gameId, link, place, placeId) => ({
  type: 'clearCooldown'
  , data: {gameId, link, place, placeId}
});

const traitMakeCooldownActions = (gameId, trait, sourceAnimal) => {
  const traitData = trait.getDataModel();
  if (!traitData.cooldowns) return []; //Protection against symbiosis
  return traitData.cooldowns.map(([link, place, duration]) => {
    const placeId = (place === TRAIT_COOLDOWN_PLACE.PLAYER ? sourceAnimal.ownerId
      : place === TRAIT_COOLDOWN_PLACE.TRAIT ? trait.id
      : sourceAnimal.id);
    return startCooldown(gameId, link, duration, place, placeId);
  }).toArray();
};

export const server$traitStartCooldown = (gameId, trait, sourceAnimal) => (dispatch) => {
  logger.debug('server$traitStartCooldown:', sourceAnimal.id, trait.type);
  traitMakeCooldownActions(gameId, trait, sourceAnimal)
    .map((cooldownAction) => dispatch(server$game(gameId, cooldownAction)));
};

/**
 * Local Traits
 */

const traitConvertFat = (gameId, sourceAid, traitId) => ({
  type: 'traitConvertFat'
  , data: {gameId, sourceAid, traitId}
});

export const server$traitConvertFat = (gameId, sourceAnimal, trait) => (dispatch) => {
  dispatch(server$game(gameId, traitConvertFat(gameId, sourceAnimal.id, trait.id)));
  dispatch(server$tryViviparous(gameId, sourceAnimal));
};

const traitMoveFood = (gameId, animalId, amount, sourceType, sourceId) => ({
  type: 'traitMoveFood'
  , data: {gameId, animalId, amount, sourceType, sourceId}
});

const traitGrazeFood = (gameId, food, sourceAid) => ({
  type: 'traitGrazeFood'
  , data: {gameId, food, sourceAid}
});

export const server$traitGrazeFood = (gameId, food, sourceAnimal) =>
  server$game(gameId, traitGrazeFood(gameId, food, sourceAnimal.id));

const traitSetAnimalFlag = (gameId, sourceAid, flag, on) => ({
  type: 'traitSetAnimalFlag'
  , data: {gameId, sourceAid, flag, on}
});

export const server$traitSetAnimalFlag = (game, sourceAnimal, flag, on = true) =>
  server$game(game.id, traitSetAnimalFlag(game.id, sourceAnimal.id, flag, on));

const traitSetValue = (gameId, sourceAid, traitId, value) => ({
  type: 'traitSetValue'
  , data: {gameId, sourceAid, traitId, value}
});

// TODO Remove and rewrite calls to traitSetValue with IDs. Because this one is bad fn =\
export const server$traitSetValue = (game, sourceAnimal, trait, value) =>
  server$game(game.id, traitSetValue(game.id, sourceAnimal.id, trait.id, value));

const traitKillAnimal = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => ({
  type: 'traitKillAnimal'
  , data: {gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}
});

export const server$traitKillAnimal = (gameId, sourceAnimal, targetAnimal) => (dispatch, getState) => dispatch(
  Object.assign(traitKillAnimal(gameId
    , sourceAnimal.ownerId, sourceAnimal.id
    , targetAnimal.ownerId, targetAnimal.id)
    , {meta: {users: selectUsersInGame(getState, gameId)}}));

const traitAnimalRemoveTrait = (gameId, sourcePid, sourceAid, traitId) => ({
  type: 'traitAnimalRemoveTrait'
  , data: {gameId, sourcePid, sourceAid, traitId}
});

export const server$traitAnimalRemoveTrait = (game, animal, trait) => (dispatch) => {
  trait.getDataModel().onRemove && dispatch(trait.getDataModel().onRemove(game, animal, trait));
  dispatch(server$game(game.id, traitAnimalRemoveTrait(game.id, animal.ownerId, animal.id, trait.id)));
};

const traitAnimalAttachTrait = (gameId, sourcePid, sourceAid, trait) => ({
  type: 'traitAnimalAttachTrait'
  , data: {gameId, sourcePid, sourceAid, trait}
});

export const server$traitAnimalAttachTrait = (game, animal, trait) =>
  server$game(game.id, traitAnimalAttachTrait(game.id, animal.ownerId, animal.id, trait));

const traitTakeShell = (gameId, continentId, animalId, trait) => ({
  type: 'traitTakeShell'
  , data: {gameId, continentId, animalId, trait}
});

export const server$tryViviparous = (gameId, animal) => (dispatch, getState) => {
  return passesChecks(() => {
    const game = selectGame(getState, gameId);
    const {sourceAnimal, trait} = checkTraitActivation(game, animal.ownerId, animal.id, TraitViviparous);
    return dispatch(server$traitActivate(game, sourceAnimal, trait));
  })
};

export const traitAddHuntingCallback = (gameId, callback) => ({
  type: 'traitAddHuntingCallback'
  , data: {gameId, callback}
});

export const traitClearHuntingCallbacks = (gameId) => ({
  type: 'traitClearHuntingCallbacks'
  , data: {gameId}
});

/**
 * Acted
 * */

const playerActed = (gameId, userId) => ({
  type: 'playerActed'
  , data: {gameId, userId}
});

export const server$playerActed = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  //console.log(userId, game.getPlayer(userId).index, game.status)
  //if (game.getPlayer(userId).index === game.status.currentPlayer) {
    dispatch(server$game(gameId, playerActed(gameId, userId)));
    if (!doesPlayerHasOptions(selectGame(getState, gameId), userId))
      dispatch(server$gameEndTurn(gameId, userId));
  //}
};

/**
 * Notification
 */

const traitNotify_Start = (gameId, sourceAid, traitId, traitType, targetId) => ({
  type: 'traitNotify_Start'
  , data: {gameId, sourceAid, traitId, traitType, targetId}
});

const traitNotify_End = (gameId, sourceAid, traitId, traitType, targetId) => ({
  type: 'traitNotify_End'
  , data: {gameId, sourceAid, traitId, traitType, targetId}
});

export const server$traitNotify_Start = (game, sourceAnimal, trait, target) => {
  logger.debug('server$traitNotify_Start:', trait.type);
  return server$game(game.id, traitNotify_Start(game.id, sourceAnimal.id, trait.id, trait.type, target && target.id || target));
};

//TODO TRAIT
export const server$traitNotify_End = (gameId, sourceAid, trait, targetId) => {
  logger.debug('server$traitNotify_End:', trait.type);
  return server$game(gameId, traitNotify_End(gameId, sourceAid, trait.id, trait.type, targetId));
};

// complexActions

export const server$startFeeding = (gameId, animal, amount, sourceType, sourceId) => (dispatch, getState) => {
  logger.debug(`server$startFeeding: ${sourceId} feeds ${animal.id} through ${sourceType} with (${amount})`);
  if (!animal.canEat(selectGame(getState, gameId))) return false;

  // TODO bug with 2 amount on animal 2/3
  dispatch(server$game(gameId, traitMoveFood(gameId, animal.id, amount, sourceType, sourceId)));

  const game = selectGame(getState, gameId);
  // Cooperation
  if (sourceType === 'GAME' && game.food > 0) {
    animal.traits.filter(trait => trait.type === TraitCooperation && trait.checkAction(game, animal))
      .forEach(traitCooperation => {
        if (selectGame(getState, gameId).food <= 0) return; // Re-check food after each cooperation

        const {animal: linkedAnimal} = game.locateAnimal(traitCooperation.linkAnimalId);
        const linkedTrait = linkedAnimal.traits.find(trait => trait.id === traitCooperation.linkId);

        traitMakeCooldownActions(gameId, traitCooperation, animal)
          .concat(traitMakeCooldownActions(gameId, linkedTrait, linkedAnimal))
          .map(cooldownAction => dispatch(cooldownAction));

        dispatch(server$traitNotify_Start(game, animal, traitCooperation, linkedAnimal));
        dispatch(server$startFeeding(gameId, linkedAnimal, 1, 'GAME', animal.id));
      });
  }

  // Communication
  animal.traits.filter(traitCommunication => traitCommunication.type === TraitCommunication)
    .map(traitCommunication => {
      if (!traitCommunication.checkAction(selectGame(getState, gameId), animal)) return;
      const {animal: linkedAnimal} = game.locateAnimal(traitCommunication.linkAnimalId);
      if (!linkedAnimal) logger.error('linkedAnimal not found', {game, 'select': selectGame(getState, gameId)});
      const linkedTrait = linkedAnimal.traits.find(trait => trait.id === traitCommunication.linkId);

      traitMakeCooldownActions(gameId, traitCommunication, animal)
        .concat(traitMakeCooldownActions(gameId, linkedTrait, linkedAnimal))
        .map(cooldownAction => dispatch(cooldownAction));

      dispatch(server$traitNotify_Start(game, animal, traitCommunication, linkedAnimal));
      dispatch(server$startFeeding(gameId, linkedAnimal, 1, 'TraitCommunication', animal.id));
    });

  dispatch(server$tryViviparous(game.id, animal));

  return true;
};

export const server$takeFoodRequest = (gameId, playerId, animalId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  checkGameDefined(game);
  checkGameHasUser(game, playerId);
  checkGamePhase(game, PHASE.FEEDING);
  checkPlayerCanAct(game, playerId);

  const animal = checkPlayerHasAnimal(game, playerId, animalId);
  checkAnimalCanEat(game, animal);

  logger.debug('traitTakeFoodRequest:', playerId, animalId);

  // Beware, this was copied to TraitInkCloud
  dispatch(server$game(gameId, startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, playerId)));
  dispatch(server$game(gameId, startCooldown(gameId, TraitCarnivorous, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, playerId)));

  dispatch(server$startFeedingFromGame(game.id, animal.id, 1));
};

export const server$startFeedingFromGame = (gameId, animalId, amount) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const {animal} = game.locateAnimal(animalId);
  const ownerId = animal.ownerId;
  const ambushed = game.someAnimalOnContinent('standard', (attackAnimal) => {
    if (attackAnimal.ownerId === animal.ownerId) return;
    const ambush = attackAnimal.hasTrait(TraitAmbush);
    const carnivorous = attackAnimal.hasTrait(TraitCarnivorous);
    if (!ambush || !ambush.value || !carnivorous) return;

    if (game.cooldowns.checkFor(TraitCarnivorous, null, attackAnimal.id)) return;

    const carnivorousData = carnivorous.getDataModel();

    if (!carnivorousData.$checkAction(game, attackAnimal) || !carnivorousData.checkTarget(game, attackAnimal, animal)) return;

    logger.verbose(`${animalId} is ambushed by ${attackAnimal.id}`)
    //dispatch(clearCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, attackAnimal.ownerId));
    dispatch(traitAddHuntingCallback(gameId, (game) => (dispatch) => {
      const {animal} = game.locateAnimal(animalId);

      if (animal) dispatch(server$startFeedingFromGame(game.id, animal.id, 1));

      dispatch(server$playerActed(gameId, ownerId));
    }));
    dispatch(server$traitActivate(game, attackAnimal, carnivorous, animal));
    return true;
  });
  if (!ambushed) {
    dispatch(server$startFeeding(gameId, animal, amount, 'GAME'));
    dispatch(server$playerActed(gameId, animal.ownerId));
  }
};

/**
 * Question
 * */

export const traitQuestion = (gameId, question) => ({type: 'traitQuestion', data: {gameId, question}});

const makeTraitQuestionTimeout = (gameId, questionId) => `traitQuestion#${gameId}#${questionId}`;

export const traitAnswerRequest = (traitId, targetId) => (dispatch, getState) => dispatch({
  type: 'traitAnswerRequest'
  , data: {gameId: getState().getIn(['game', 'id']), questionId: getState().getIn(['game', 'question', 'id']), traitId, targetId}
  , meta: {server: true}
});

export const traitAnswerSuccess = (gameId, questionId) => ({
  type: 'traitAnswerSuccess'
  , data: {gameId, questionId}
});

export const server$traitQuestion = (gameId, userId, questionType, attackAnimal, trait, defenceAnimal, defaultAction) => (dispatch, getState) => {
  const turnRemainingTime = dispatch(server$gameCancelTurnTimeout(gameId));

  const question = QuestionRecord.new(questionType
    , userId
    , attackAnimal, trait.id, defenceAnimal
    , turnRemainingTime
    , defaultAction
  );

  dispatch(server$questionResumeTimeout(gameId, question))
};

const server$traitQuestionDefaultAction = (gameId, questionId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (!game) {
    logger.error('NO GAME');
    logger.error('NO GAME', getState().toJS());
    return;
  }
  if (!game.question) {
    // logger.error('NO QUESTION');
    logger.error('NO QUESTION', getState().toJS());
    return;
  }
  if (game.question.id !== questionId) {
    logger.error('QUESTION WRONG ID', game.question.id, questionId);
    return;
  }
  const defaultAction = game.getIn(['question', 'defaultAction']);
  if (defaultAction) dispatch(defaultAction(questionId));
};

export const server$traitAnswerSuccess = (gameId, questionId) => (dispatch, getState) => {
  const question = selectGame(getState, gameId).question;
  if (question) {
    dispatch(cancelTimeout(makeTraitQuestionTimeout(gameId, questionId)));
    dispatch(server$game(gameId, traitAnswerSuccess(gameId, questionId)));
    dispatch(server$addTurnTimeout(gameId, void 0, question.turnRemainingTime));
  }
};

export const server$questionPauseTimeout = (game) => (dispatch, getState) => {
  const gameId = game.id;
  if (!!game.question && !!game.question.id) {
    dispatch(cancelTimeout(makeTraitQuestionTimeout(gameId, game.question.id)));
  }
};

export const server$questionResumeTimeout = (gameId, question) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);

  const userId = question.userId;
  const player = game.getPlayer(userId);

  const timeTraitResponse = !player.timedOut ? game.settings.timeTraitResponse : SETTINGS_TIMED_OUT_TURN_TIME;

  question = question.set('time', Date.now());

  logger.verbose('server$traitQuestion', question.toJS());

  dispatch(traitQuestion(gameId, question));
  // Notify all users
  dispatch(Object.assign(traitQuestion(gameId, question.toOthers().toClient())
    , {meta: {clientOnly: true, users: selectUsersInGame(getState, gameId)}}));
  // Notify defending user
  dispatch(Object.assign(traitQuestion(gameId, question.toClient())
    , {meta: {clientOnly: true, userId}}));

  if (game.status.paused) return;
  dispatch(addTimeout(timeTraitResponse
    , makeTraitQuestionTimeout(gameId, question.id)
    , server$traitQuestionDefaultAction(gameId, question.id)));
};

/**
 * Defence
 */

export const server$traitDefenceQuestion = (gameId, attackAnimal, trait, defenceAnimal, defaultAction) =>
  server$traitQuestion(gameId, defenceAnimal.ownerId
    , QuestionRecord.DEFENSE, attackAnimal, trait, defenceAnimal
    , defaultAction
  );

export const server$traitDefenceAnswer = (gameId, questionId, traitId, targetId) => (dispatch, getState) => {
  logger.debug('server$traitDefenceAnswer', questionId, traitId, targetId);
  const game = selectGame(getState, gameId);
  if (!game.get('question')) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'Game doesnt have Question(%s)', questionId)
  }
  const question = game.get('question');
  if (question.id !== questionId) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'QuesionID is incorrect (%s)', questionId)
  }

  const attackAnimal = checkPlayerHasAnimal(game, question.sourcePid, question.sourceAid);
  const attackTrait = attackAnimal.hasTrait(question.traitId);
  if (!attackTrait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', question.sourceAid, traitId)
  }

  const {sourceAnimal: defenceAnimal, trait: defenceTrait, target} =
    checkTraitActivation(game, question.targetPid, question.targetAid, traitId, targetId);

  if (checkIfTraitDisabledByIntellect(attackAnimal, defenceTrait))
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'Trait disabled by intellect');

  dispatch(server$traitAnswerSuccess(game.id, questionId));
  const result = dispatch(server$traitActivate(game, defenceAnimal, defenceTrait, target, attackAnimal, attackTrait));
  logger.debug('server$traitDefenceAnswer result:', attackTrait.type, defenceTrait.type, result, game.status.toJS());

  // TODO line below possibly belongs to somewhere else
  // Because player should not get "acted" if it happens in another players turns
  if (game.getPlayer(attackAnimal.ownerId).index === game.status.currentPlayer)
    if (result)
      dispatch(server$playerActed(gameId, attackAnimal.ownerId));
  return result;
};

/**
 * Intellect
 */

export const server$traitIntellectQuestion = (gameId, attackAnimal, trait, defenceAnimal, defaultAction) =>
  server$traitQuestion(gameId, attackAnimal.ownerId
    , QuestionRecord.INTELLECT, attackAnimal, trait, defenceAnimal
    , defaultAction
  );

export const server$traitIntellectAnswer = (gameId, questionId, traitId, targetId) => (dispatch, getState) => {
  logger.debug('server$traitIntellectAnswer', questionId, traitId, targetId);
  const game = selectGame(getState, gameId);
  if (!game.get('question')) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`
      , 'Game doesnt have Question(%s)', questionId)
  }
  const question = game.get('question');
  if (question.id !== questionId) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`
      , 'QuesionID is incorrect (%s)', questionId)
  }

  const attackAnimal = checkPlayerHasAnimal(game, question.sourcePid, question.sourceAid);
  const attackTrait = attackAnimal.hasTrait(question.traitId);
  if (!attackTrait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', question.sourceAid, traitId)
  }
  const targetAnimal = checkPlayerHasAnimal(game, question.targetPid, question.targetAid);

  const traitIntellect = attackAnimal.hasTrait(TraitIntellect);

  if (!targetId) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`, 'Wrong target trait')
  }
  if (!traitIntellect.checkAction(game, attackAnimal)) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`, 'Intellect has cooldown')
  }

  dispatch(server$traitActivate(game, attackAnimal, traitIntellect, targetId));
  dispatch(server$traitAnswerSuccess(game.id, questionId));

  // Reselecting animal from new game to refresh intellect value
  const newGame = selectGame(getState, gameId);
  const {animal: sourceAnimal} = newGame.locateAnimal(attackAnimal.id);

  const result = dispatch(server$traitActivate(newGame, sourceAnimal, attackTrait, targetAnimal));
  logger.debug('server$traitIntellectAnswer result:', attackTrait.type, result);
  if (result) dispatch(server$playerActed(gameId, attackAnimal.ownerId));
  return result;
};

//

export const traitClientToServer = {
  traitTakeFoodRequest: ({gameId, animalId}, {userId}) => (dispatch, getState) => {
    dispatch(server$takeFoodRequest(gameId, userId, animalId));
  }
  , traitTakeShellRequest: ({gameId, animalId, traitId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    checkPlayerCanAct(game, userId);

    const animal = checkPlayerHasAnimal(game, userId, animalId);

    checkAnimalCanTakeShell(game, animal);

    const trait = game.getContinent().shells.get(traitId);
    if (!trait)
      throw new ActionCheckError(`traitTakeShellRequest@Game(${game.id})`, 'Game doesnt have Trait(%s)', traitId);

    dispatch(server$game(gameId, startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId)));
    dispatch(server$game(gameId, traitTakeShell(gameId, 'standard', animalId, trait)));
    dispatch(server$playerActed(gameId, userId));
  }
  , traitActivateRequest: ({gameId, sourceAid, traitId, targetId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    const {sourceAnimal, trait, target} = checkTraitActivation(game, userId, sourceAid, traitId, targetId);
    if (!trait.getDataModel().transient) checkPlayerCanAct(game, userId);

    const result = dispatch(server$traitActivate(game, sourceAnimal, trait, target));
    if (result === void 0) {
      throw new Error(`traitActivateRequest@Game(${gameId}): Animal(${sourceAid})-${trait.type}-Animal(${targetId}) result undefined`);
    }
    //logger.silly('traitActivateRequest: ' + result);
    if (result) {
      dispatch(server$playerActed(gameId, userId));
    }
  }
  , traitAnswerRequest: ({gameId, questionId, traitId, targetId}, {userId}) => (dispatch, getState) => {
    logger.verbose('traitAnswerRequest', gameId, questionId, traitId, targetId);
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGamePhase(game, PHASE.FEEDING);

    if (!game.get('question')) {
      throw new ActionCheckError(`traitAnswerRequest@Game(${game.id})`
        , 'Game doesnt have Question(%s)', questionId)
    }

    const {type, sourcePid, targetPid} = game.question;
    //checkPlayerTurn(game, sourcePid);
    switch (type) {
      case QuestionRecord.DEFENSE:
        if (userId !== targetPid) {
          throw new ActionCheckError(`checkPlayerCanAct@Game(${game.id})`
            , `Player(%s) answering instead of Player(%s)`
            , userId, targetPid);
        }
        dispatch(server$traitDefenceAnswer(gameId, questionId, traitId, targetId));
        break;
      case QuestionRecord.INTELLECT:
        if (userId !== sourcePid) {
          throw new ActionCheckError(`checkPlayerCanAct@Game(${game.id})`
            , `Player(%s) answering instead of Player(%s)`
            , userId, sourcePid);
        }
        dispatch(server$traitIntellectAnswer(gameId, questionId, traitId, targetId));
        break;
    }
  }
};

export const traitServerToClient = {
  traitMoveFood: ({gameId, animalId, amount, sourceType, sourceId}) =>
    traitMoveFood(gameId, animalId, amount, sourceType, sourceId)
  , startCooldown: ({gameId, link, duration, place, placeId}) =>
    startCooldown(gameId, link, duration, place, placeId)
  , traitKillAnimal: ({gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}) =>
    traitKillAnimal(gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId)
  , playerActed: ({gameId, userId}) =>
    playerActed(gameId, userId)
  , traitQuestion: ({gameId, question}, currentUserId) =>
    traitQuestion(gameId, QuestionRecord.fromJS(question))
  , traitAnswerSuccess: ({gameId, questionId}, currentUserId) =>
    traitAnswerSuccess(gameId, questionId)
  , traitNotify_Start: ({gameId, sourceAid, traitId, traitType, targetId}, currentUserId) =>
    traitNotify_Start(gameId, sourceAid, traitId, traitType, targetId)
  , traitNotify_End: ({gameId, sourceAid, traitId, traitType, targetId}, currentUserId) =>
    traitNotify_End(gameId, sourceAid, traitId, traitType, targetId)
  , traitAnimalRemoveTrait: ({gameId, sourcePid, sourceAid, traitId}) =>
    traitAnimalRemoveTrait(gameId, sourcePid, sourceAid, traitId)
  , traitAnimalAttachTrait: ({gameId, sourcePid, sourceAid, trait}) =>
    traitAnimalAttachTrait(gameId, sourcePid, sourceAid, TraitModel.fromServer(trait))
  , traitGrazeFood: ({gameId, food, sourceAid}) => traitGrazeFood(gameId, food, sourceAid)
  , traitConvertFat: ({gameId, sourceAid, traitId}) => traitConvertFat(gameId, sourceAid, traitId)
  , traitSetAnimalFlag: ({gameId, sourceAid, flag, on}) =>
    traitSetAnimalFlag(gameId, sourceAid, flag, on)
  , traitTakeShell: ({gameId, continentId, animalId, trait}) =>
    traitTakeShell(gameId, continentId, animalId, TraitModel.fromServer(trait))
  , traitSetValue: ({gameId, sourceAid, traitId, value}) =>
    traitSetValue(gameId, sourceAid, traitId, value)
};