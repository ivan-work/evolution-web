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
  , TRAIT_ANIMAL_FLAG
  , ANIMAL_DEATH_REASON
} from '../models/game/evolution/constants';

import {server$game, to$} from './generic';
import {doesPlayerHasOptions} from './ai';
import {
  server$gameEndTurn
  , server$addTurnTimeout
  , server$gameCancelTurnTimeout
  , animalDeath
  , server$gameStartPhase
} from './actions';

import {selectRoom, selectGame, selectUsersInGame} from '../selectors';

import {PHASE, QuestionRecord, AmbushRecord} from '../models/game/GameModel';
import * as tt from '../models/game/evolution/traitTypes';

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

export const traitActivateRequest = (sourceAid, traitId, ...targets) => (dispatch, getState) => dispatch({
  type: 'traitActivateRequest'
  , data: {gameId: getState().get('game').id, sourceAid, traitId, targets}
  , meta: {server: true}
});

const logTarget = (result = [], target) => {
  if (Array.isArray(target)) target.reduce(logTarget, result)
  else if (!!target && !!target.type) result.push(target.type);
  else if (!!target && !!target.id) result.push(target.id);
  else result.push(target);
  return result;
};
export const server$traitActivate = (game, sourceAnimal, trait, ...targets) => (dispatch, getState) => {
  const logTargets = (targets || []).reduce(logTarget, []);
  if (!trait.getDataModel().transient) {
    dispatch(server$traitNotify_Start(game, sourceAnimal, trait, ...logTargets));
  }
  const newGame = selectGame(getState, game.id);
  const newAnimal = newGame.locateAnimal(sourceAnimal.id, sourceAnimal.ownerId);
  logger.verbose('server$traitActivate:', sourceAnimal.id, trait.type, ...logTargets);
  const traitData = trait.getDataModel();
  const result = dispatch(traitData.action(newGame, newAnimal, trait, ...targets));
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
  dispatch(server$tryViviparous(gameId, sourceAnimal.id));
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
export const server$traitSetValue = (game, sourceAnimal, trait, value) => (dispatch) => {
  const action = traitSetValue(game.id, sourceAnimal.id, trait.id, value);
  if (trait.getDataModel().transient) {
    dispatch(to$({userId: sourceAnimal.ownerId}, action));
  } else {
    dispatch(server$game(game.id, action));
  }
};

export const server$traitKillAnimal = (gameId, sourceAnimal, targetAnimal) => (dispatch, getState) => {
  if (targetAnimal.hasTrait(tt.TraitRegeneration)) {
    dispatch(server$game(gameId, traitSetAnimalFlag(gameId, targetAnimal.id, TRAIT_ANIMAL_FLAG.REGENERATION, true)));
  } else {
    dispatch(server$game(gameId, animalDeath(gameId, ANIMAL_DEATH_REASON.KILL, targetAnimal.id)));
  }
};

const traitAnimalRemoveTrait = (gameId, sourcePid, sourceAid, traitId) => ({
  type: 'traitAnimalRemoveTrait'
  , data: {gameId, sourcePid, sourceAid, traitId}
});

export const server$traitAnimalRemoveTrait = (game, animal, trait) => (dispatch) => {
  const dataModel = trait.getDataModel();
  if (!!dataModel && !!dataModel.customFns && dataModel.customFns.onRemove) {
    dispatch(dataModel.customFns.onRemove(game, animal, trait));
  }
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

export const server$tryViviparous = (gameId, animalId) => (dispatch, getState) => {
  return passesChecks(() => {
    const game = selectGame(getState, gameId);
    const animal = game.locateAnimal(animalId);
    const {trait} = checkTraitActivation(game, animal, tt.TraitViviparous);
    return dispatch(server$traitActivate(game, animal, trait));
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

export const traitParalyze = (gameId, animalId) => ({
  type: 'traitParalyze'
  , data: {gameId, animalId}
});

/**
 * AMBUSH
 * gameAmbushPrepareStart > gameAmbushPrepareEnd > gameAmbushAttackStart > gameAmbushAttackEnd
 * */

const makeAmbushPhaseTimeoutId = (gameId) => `Phase#Ambush#${gameId}`;

export const traitAmbushActivateRequest = (animalId, on = true) => (dispatch, getState) => dispatch({
  type: 'traitAmbushActivateRequest'
  , data: {gameId: getState().getIn(['game', 'id']), animalId, on}
  , meta: {server: true}
});

export const traitAmbushContinueRequest = () => (dispatch, getState) => dispatch({
  type: 'traitAmbushContinueRequest'
  , data: {gameId: getState().getIn(['game', 'id'])}
  , meta: {server: true}
});

const traitAmbushActivate = (gameId, animalId, on) => ({
  type: 'traitAmbushActivate'
  , data: {gameId, animalId, on}
});

const server$traitAmbushActivate = (gameId, animalId, on) => (dispatch, getState) => {
  dispatch(server$game(gameId, traitAmbushActivate(gameId, animalId, on)));
  if (selectGame(getState, gameId).ambush.ambushers.every((ambush) => ambush !== null)) {
    dispatch(server$gameAmbushPrepareEnd(gameId));
  }
};

const gameAmbushPushTarget = (gameId, animalId) => ({
  type: 'gameAmbushPushTarget'
  , data: {gameId, animalId}
});

const gameAmbushUnshiftTarget = (gameId) => ({
  type: 'gameAmbushUnshiftTarget'
  , data: {gameId}
});

const gameAmbushPrepareStart = (gameId, ambushRecord) => ({
  type: 'gameAmbushPrepareStart'
  , data: {gameId, ambushRecord}
});

const gameAmbushPrepareEnd = (gameId) => ({
  type: 'gameAmbushPrepareEnd'
  , data: {gameId}
});

export const server$gameAmbushPrepareStart = (game, animal) => (dispatch, getState) => {
  logger.debug(`Checking ${animal.id} for ambushers`);
  const gameId = game.id;
  let ambushers = [];
  game.constructor.sortPlayersFromIndex(game, game.getPlayer(animal.ownerId).index).some(p => p.someAnimal((attackAnimal, continent) => {
    if (attackAnimal.ownerId === animal.ownerId) return; // Can't ambush self
    const ambush = attackAnimal.hasTrait(tt.TraitAmbush);
    const carnivorous = attackAnimal.hasTrait(tt.TraitCarnivorous);
    if (!ambush || !carnivorous) return;
    if (game.cooldowns.checkFor(tt.TraitCarnivorous, null, attackAnimal.id, carnivorous.id)) return;
    const carnivorousData = carnivorous.getDataModel();
    if (!carnivorousData.$checkAction(game, attackAnimal) || !carnivorousData.checkTarget(game, attackAnimal, animal)) return;

    ambushers.push(attackAnimal.id);
  }));

  if (ambushers.length > 0) {
    logger.verbose(`${animal.id} is possibly ambushed by ${ambushers}`);

    const turnRemainingTime = dispatch(server$gameCancelTurnTimeout(gameId));

    dispatch(server$gameStartPhase(gameId, PHASE.AMBUSH));

    dispatch(server$game(gameId, gameAmbushPrepareStart(gameId, AmbushRecord.new(animal, ambushers, turnRemainingTime))));

    dispatch(addTimeout(game.settings.timeAmbush
      , makeAmbushPhaseTimeoutId(gameId)
      , (dispatch) => dispatch(server$gameAmbushPrepareEnd(gameId))));
  }
  return ambushers.length > 0;
};

export const server$gameAmbushPrepareEnd = (gameId) => (dispatch, getState) => {
  logger.debug(`server$gameAmbushPrepareEnd`);
  dispatch(cancelTimeout(makeAmbushPhaseTimeoutId(gameId)));
  dispatch(server$game(gameId, gameAmbushPrepareEnd(gameId)));
  const game = selectGame(getState, gameId);

  const nextAmbusherId = game.ambush.ambushers.keyOf(true);
  if (nextAmbusherId) {
    dispatch(server$traitAmbushPerform(gameId, nextAmbusherId))
  } else {
    dispatch(server$gameAmbushAttackEnd(gameId));
  }
};

const gameAmbushAttackStart = (gameId) => ({
  type: 'gameAmbushAttackStart'
  , data: {gameId}
});

const gameAmbushAttackEnd = (gameId) => ({
  type: 'gameAmbushAttackEnd'
  , data: {gameId}
});

export const server$gameAmbushAttackStart = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  dispatch(server$game(gameId, gameAmbushAttackStart(gameId)));

  const nextAmbusherId = game.ambush.ambushers.keyOf(true);
  // console.log('nextAmbusherId', nextAmbusherId)
  if (nextAmbusherId) {
    dispatch(server$traitAmbushPerform(gameId, nextAmbusherId))
  } else {
    dispatch(server$gameAmbushAttackEnd(gameId));
  }
};

export const server$gameAmbushAttackEnd = (gameId) => (dispatch, getState) => {
  logger.debug(`server$gameAmbushAttackEnd`);
  const game = selectGame(getState, gameId);
  const {targets, targetPlayerId, turnRemainingTime} = game.ambush;
  const animalId = targets.first();
  dispatch(gameAmbushUnshiftTarget(gameId));

  if (targets.size === 1) {
    dispatch(server$game(gameId, gameAmbushAttackEnd(gameId)));
    dispatch(server$addTurnTimeout(gameId, void 0, turnRemainingTime));

    dispatch(server$startFeeding(gameId, animalId, 1, 'GAME'));
    dispatch(server$game(gameId, gameFoodTake_End(gameId, animalId)));
    dispatch(server$playerActed(gameId, targetPlayerId));
  } else {
    dispatch(server$startFeeding(gameId, animalId, 1, 'GAME'));
    dispatch(server$game(gameId, gameFoodTake_End(gameId, animalId)));

    const nextAnimal = game.locateAnimal(targets.get(1));
    dispatch(server$gameAmbushPrepareStart(game, nextAnimal))
  }
};

export const server$traitAmbushPerform = (gameId, attackAnimalId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const defenceAnimalId = game.ambush.targets.first();
  const defenceAnimal = game.locateAnimal(defenceAnimalId);
  const attackAnimal = game.locateAnimal(attackAnimalId);
  logger.debug(`server$traitAmbushPerform`, defenceAnimalId, attackAnimalId);
  if (defenceAnimal && attackAnimal) {
    try {
      const traitCarnivorous = checkTraitActivation(game, attackAnimal, tt.TraitCarnivorous, defenceAnimalId).trait;
      dispatch(traitAddHuntingCallback(gameId, (game) => (dispatch) => {
        // Several ambushers from one player should have attack
        dispatch(clearCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, attackAnimal.ownerId));
        dispatch(traitAmbushActivate(gameId, attackAnimalId, false));
        dispatch(server$gameAmbushAttackStart(gameId));
      }));
      dispatch(server$traitActivate(game, attackAnimal, traitCarnivorous, defenceAnimal));
    } catch (e) {
      logger.debug(`server$traitAmbushPerform ERROR:`, e);
      dispatch(traitAmbushActivate(gameId, attackAnimalId, false));
      dispatch(server$gameAmbushAttackStart(gameId));
    }
  } else {
    dispatch(server$gameAmbushAttackEnd(gameId));
  }
};

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

const traitNotify_Start = (gameId, sourceAid, traitId, traitType, targets) => ({
  type: 'traitNotify_Start'
  , data: {gameId, sourceAid, traitId, traitType, targets}
});

const traitNotify_End = (gameId, sourceAid, traitId, traitType, targetId) => ({
  type: 'traitNotify_End'
  , data: {gameId, sourceAid, traitId, traitType, targetId}
});

export const server$traitNotify_Start = (game, sourceAnimal, trait, ...targets) => {
  logger.debug('server$traitNotify_Start:', trait.type);
  return server$game(game.id, traitNotify_Start(game.id, sourceAnimal.id, trait.id, trait.type, targets));
};

//TODO TRAIT
export const server$traitNotify_End = (gameId, sourceAid, trait, targetId) => {
  logger.debug('server$traitNotify_End:', trait.type);
  return server$game(gameId, traitNotify_End(gameId, sourceAid, trait.id, trait.type, targetId));
};

/**
 * Complex Actions
 */

export const server$startFeeding = (gameId, animalId, amount, sourceType, sourceId) => (dispatch, getState) => {
  logger.debug(`server$startFeeding: ${sourceId} feeds ${animalId} through ${sourceType} with (${amount})`);
  let game = selectGame(getState, gameId);
  const animal = game.locateAnimal(animalId);
  if (!animal) return false;
  if (!animal.canEat(game)) return false;

  dispatch(server$game(gameId, traitMoveFood(gameId, animal.id, amount, sourceType, sourceId)));

  game = selectGame(getState, gameId);
  // Cooperation
  if (sourceType === 'GAME' && game.food > 0) {
    animal.traits.filter(trait => trait.type === tt.TraitCooperation && trait.checkAction(game, animal))
      .forEach(traitCooperation => {
        if (selectGame(getState, gameId).food <= 0) return; // Re-check food after each cooperation

        const linkedAnimal = game.locateAnimal(traitCooperation.linkAnimalId, traitCooperation.ownerId);
        const linkedTrait = linkedAnimal.traits.find(trait => trait.id === traitCooperation.linkId);

        if (!linkedAnimal.canEat(game)) return;

        traitMakeCooldownActions(gameId, traitCooperation, animal)
          .concat(traitMakeCooldownActions(gameId, linkedTrait, linkedAnimal))
          .map(cooldownAction => dispatch(cooldownAction));

        dispatch(server$traitNotify_Start(game, animal, traitCooperation, linkedAnimal.id));
        dispatch(server$startFeedingFromGame(gameId, linkedAnimal.id, 1));
      });
  }

  // Communication
  animal.traits.filter(traitCommunication => traitCommunication.type === tt.TraitCommunication)
    .map(traitCommunication => {
      if (!traitCommunication.checkAction(selectGame(getState, gameId), animal)) return;
      const linkedAnimal = game.locateAnimal(traitCommunication.linkAnimalId, traitCommunication.ownerId);
      if (!linkedAnimal) {
        // Because "animal" is coming from params, when it kills linkedAnimal, linkedAnimal is null
        // TODO refactor so startFeeding accepts animalId and reselects "animal"
        return;
      }
      const linkedTrait = linkedAnimal.traits.find(trait => trait.id === traitCommunication.linkId);

      traitMakeCooldownActions(gameId, traitCommunication, animal)
        .concat(traitMakeCooldownActions(gameId, linkedTrait, linkedAnimal))
        .map(cooldownAction => dispatch(cooldownAction));

      dispatch(server$traitNotify_Start(game, animal, traitCommunication, linkedAnimal.id));
      dispatch(server$startFeeding(gameId, linkedAnimal.id, 1, tt.TraitCommunication, animal.id));
    });

  dispatch(server$tryViviparous(game.id, animal.id));

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
  dispatch(server$game(gameId, startCooldown(gameId, tt.TraitCarnivorous, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, playerId)));

  dispatch(server$startFeedingFromGame(game.id, animal.id, 1));
};

const gameFoodTake_Start = (gameId, animalId) => ({
  type: 'gameFoodTake_Start'
  , data: {gameId, animalId}
});
const gameFoodTake_End = (gameId, animalId) => ({
  type: 'gameFoodTake_End'
  , data: {gameId, animalId}
});

export const server$startFeedingFromGame = (gameId, animalId, amount) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const animal = game.locateAnimal(animalId);

  if (game.status.phase === PHASE.AMBUSH) {
    dispatch(gameAmbushPushTarget(gameId, animalId));
  } else {
    dispatch(server$game(gameId, gameFoodTake_Start(gameId, animalId)));

    const ambushed = dispatch(server$gameAmbushPrepareStart(game, animal));

    if (!ambushed) {
      dispatch(server$startFeeding(gameId, animal.id, amount, 'GAME'));
      dispatch(server$game(gameId, gameFoodTake_End(gameId, animalId)));
      dispatch(server$playerActed(gameId, animal.ownerId));
    }

    return !ambushed;
  }
};

/**
 * Question
 * */

export const traitQuestion = (gameId, question) => ({type: 'traitQuestion', data: {gameId, question}});

const makeTraitQuestionTimeout = (gameId, questionId) => `traitQuestion#${gameId}#${questionId}`;

export const traitAnswerRequest = (traitId, targetId) => (dispatch, getState) => dispatch({
  type: 'traitAnswerRequest'
  , data: {
    gameId: getState().getIn(['game', 'id']),
    questionId: getState().getIn(['game', 'question', 'id']),
    traitId,
    targetId
  }
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

  logger.verbose('server$traitQuestion:', question.type, question.sourceAid, '>', question.targetAid);

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
  const question = game.get('question');
  if (!question) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'Game doesnt have Question(%s)', questionId)
  }
  if (question.id !== questionId) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'QuesionID is incorrect (%s)', questionId)
  }

  const attackAnimal = checkPlayerHasAnimal(game, question.sourcePid, question.sourceAid);
  const attackTrait = attackAnimal.hasTrait(question.traitId);
  if (!attackTrait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', question.sourceAid, traitId)
  }

  const defenceAnimal = checkPlayerHasAnimal(game, question.targetPid, question.targetAid);
  if (traitId !== true) {
    const {trait: defenceTrait, target} = checkTraitActivation(game, defenceAnimal, traitId, targetId);

    if (checkIfTraitDisabledByIntellect(attackAnimal, defenceTrait))
      throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
        , 'Trait disabled by intellect');

    dispatch(server$traitAnswerSuccess(game.id, questionId));
    const result = dispatch(server$traitActivate(game, defenceAnimal, defenceTrait, target, attackAnimal, attackTrait));
    logger.debug(`server$traitDefenceAnswer result: ${attackTrait.type} ${defenceTrait.type} ${result}`);

    // TODO line below possibly belongs to somewhere else
    // Because player should not get "acted" if it happens in another players turns
    if (game.getPlayer(attackAnimal.ownerId).index === game.status.currentPlayer)
      if (result)
        dispatch(server$playerActed(gameId, attackAnimal.ownerId));
    return result;
  } else {
    dispatch(server$traitAnswerSuccess(game.id, questionId));
    const result = dispatch(server$traitActivate(game, attackAnimal, attackTrait, defenceAnimal, true));

    // TODO line below possibly belongs to somewhere else
    // Because player should not get "acted" if it happens in another players turns
    if (game.getPlayer(attackAnimal.ownerId).index === game.status.currentPlayer)
      if (result)
        dispatch(server$playerActed(gameId, attackAnimal.ownerId));
    return result;
  }
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
  let game = selectGame(getState, gameId);
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

  const traitIntellect = attackAnimal.hasTrait(tt.TraitIntellect);

  if (!targetId) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`, 'Wrong target trait')
  }
  if (!traitIntellect.checkAction(game, attackAnimal)) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`, 'Intellect has cooldown')
  }

  dispatch(server$traitActivate(game, attackAnimal, traitIntellect, targetId));
  dispatch(server$traitAnswerSuccess(game.id, questionId));

  // Reselecting animal from new game to refresh intellect value
  game = selectGame(getState, gameId);
  const sourceAnimal = game.locateAnimal(attackAnimal.id, attackAnimal.ownerId);

  const result = dispatch(server$traitActivate(game, sourceAnimal, attackTrait, targetAnimal));
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
  , traitAmbushActivateRequest: ({gameId, animalId, on}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.AMBUSH);

    checkPlayerHasAnimal(game, userId, animalId);

    if (!game.hasIn(['ambush', 'ambushers', animalId]))
      throw new ActionCheckError(`traitAmbushActivateRequest@Game(${game.id})`, 'Animal#%s is not in ambushers', animalId);

    dispatch(server$traitAmbushActivate(gameId, animalId, on));
  }
  , traitAmbushContinueRequest: ({gameId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.AMBUSH);

    game.getIn(['ambush', 'ambushers']).forEach((wants, animalId) => {
      if (wants === null) {
        const animal = game.locateAnimal(animalId, userId);
        if (animal) {
          dispatch(server$traitAmbushActivate(gameId, animal.id, false));
        }
      }
    });
  }
  , traitActivateRequest: ({gameId, sourceAid, traitId, targets}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    const sourceAnimal = checkPlayerHasAnimal(game, userId, sourceAid);
    const {trait, target} = checkTraitActivation(game, sourceAnimal, traitId, ...targets);
    if (!trait.getDataModel().transient) checkPlayerCanAct(game, userId);
    const result = dispatch(server$traitActivate(game, sourceAnimal, trait, target));
    if (result === void 0) {
      throw new Error(`traitActivateRequest@Game(${gameId}): Animal(${sourceAid})-${trait.type}-(${targets.join(' ')}) result undefined`);
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
    if (game.status.phase !== PHASE.FEEDING && game.status.phase !== PHASE.AMBUSH) {
      throw new ActionCheckError(`checkGamePhase@Game(${game.id})`, 'Wrong phase (%s)', game.status.phase);
    }

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
  , playerActed: ({gameId, userId}) =>
    playerActed(gameId, userId)
  , traitQuestion: ({gameId, question}, currentUserId) =>
    traitQuestion(gameId, QuestionRecord.fromJS(question))
  , traitAnswerSuccess: ({gameId, questionId}, currentUserId) =>
    traitAnswerSuccess(gameId, questionId)
  , traitNotify_Start: ({gameId, sourceAid, traitId, traitType, targets}, currentUserId) =>
    traitNotify_Start(gameId, sourceAid, traitId, traitType, targets)
  , traitNotify_End: ({gameId, sourceAid, traitId, traitType, targetId}, currentUserId) =>
    traitNotify_End(gameId, sourceAid, traitId, traitType, targetId)
  , traitAnimalRemoveTrait: ({gameId, sourcePid, sourceAid, traitId}) =>
    traitAnimalRemoveTrait(gameId, sourcePid, sourceAid, traitId)
  , traitAnimalAttachTrait: ({gameId, sourcePid, sourceAid, trait}) =>
    traitAnimalAttachTrait(gameId, sourcePid, sourceAid, TraitModel.fromServer(trait))
  , traitGrazeFood: ({gameId, food, sourceAid}) => traitGrazeFood(gameId, food, sourceAid)
  , traitParalyze: ({gameId, animalId}) => traitParalyze(gameId, animalId)

  , gameFoodTake_Start: ({gameId, animalId}) => gameFoodTake_Start(gameId, animalId)
  , gameFoodTake_End: ({gameId, animalId}) => gameFoodTake_End(gameId, animalId)

  , traitAmbushActivate: ({gameId, animalId, on}) => traitAmbushActivate(gameId, animalId, on)
  , gameAmbushPrepareStart: ({gameId, ambushRecord}) =>
    gameAmbushPrepareStart(gameId, AmbushRecord.fromServer(ambushRecord))
  , gameAmbushPrepareEnd: ({gameId}) => gameAmbushPrepareEnd(gameId)
  , gameAmbushAttackStart: ({gameId}) => gameAmbushAttackStart(gameId)
  , gameAmbushAttackEnd: ({gameId}) => gameAmbushAttackEnd(gameId)

  , traitConvertFat: ({gameId, sourceAid, traitId}) => traitConvertFat(gameId, sourceAid, traitId)
  , traitSetAnimalFlag: ({gameId, sourceAid, flag, on}) =>
    traitSetAnimalFlag(gameId, sourceAid, flag, on)
  , traitTakeShell: ({gameId, continentId, animalId, trait}) =>
    traitTakeShell(gameId, continentId, animalId, TraitModel.fromServer(trait))
  , traitSetValue: ({gameId, sourceAid, traitId, value}) =>
    traitSetValue(gameId, sourceAid, traitId, value)
};