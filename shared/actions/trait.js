import logger from '~/shared/utils/logger';
import uuid from 'uuid';
import {ActionCheckError} from '~/shared/models/ActionCheckError';

import {
  FOOD_SOURCE_TYPE
  , TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
} from '../models/game/evolution/constants';

import {server$game} from './generic';
import {endTurnIfNoOptions} from './ai';
import {server$gameEndTurn} from './actions';

import {selectRoom, selectGame, selectPlayers4Sockets} from '../selectors';

import {PHASE} from '../models/game/GameModel';
import {checkAction} from '../models/game/evolution/TraitDataModel';
import {TraitCommunication, TraitCooperation, TraitCarnivorous} from '../models/game/evolution/traitsData/index';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasAnimal
  , checkPlayerTurnAndPhase
} from './checks';

import {checkAnimalCanEat, checkTraitActivation} from './trait.checks';

import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';

// Activation

export const traitTakeFoodRequest = (animalId) => (dispatch, getState) => dispatch({
  type: 'traitTakeFoodRequest'
  , data: {gameId: getState().get('game').id, animalId}
  , meta: {server: true}
});

export const traitActivateRequest = (sourceAid, traitType, targetId) => (dispatch, getState) => dispatch({
  type: 'traitActivateRequest'
  , data: {gameId: getState().get('game').id, sourceAid, traitType, targetId}
  , meta: {server: true}
});

export const server$traitActivate = (game, sourceAnimal, traitData, ...params) => (dispatch, getState) => {
  logger.verbose('server$traitActivate:', sourceAnimal.id, traitData.type)
  let result = false;
  switch (traitData.targetType) {
    case TRAIT_TARGET_TYPE.ANIMAL:
      result = dispatch(server$traitActivate_Animal(game, sourceAnimal, traitData, ...params));
      break;
    case TRAIT_TARGET_TYPE.TRAIT:
      result = dispatch(server$traitActivate_Trait(game, sourceAnimal, traitData, ...params));
      break;
    case TRAIT_TARGET_TYPE.NONE:
      result = dispatch(server$traitActivate_None(game, sourceAnimal, traitData, ...params));
      break;
    default:
      throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
        , 'Animal(%s):Trait(%s) unknown target type %s', sourceAnimal.id, traitData.type, traitData.targetType)
  }
  logger.silly('server$traitActivate finish:', traitData.type, result);
  return result;
};

const server$traitActivate_Animal = (game, sourceAnimal, traitData, targetAnimal, ...params) => {
  return traitData.action(game, sourceAnimal, targetAnimal, ...params);
};

const server$traitActivate_Trait = (game, sourceAnimal, traitData, traitIndex, ...params) => {
  return traitData.action(game, sourceAnimal, traitIndex, ...params);
};

const server$traitActivate_None = (game, sourceAnimal, traitData, ...params) => {
  return traitData.action(game, sourceAnimal, ...params);
};


const local$traitStartCooldown = (gameId, traitData, sourceAnimal) => (dispatch) => {
  traitData.cooldowns.forEach(([link, place, duration]) => {
    const placeId = (place === TRAIT_COOLDOWN_PLACE.PLAYER
      ? sourceAnimal.ownerId
      : sourceAnimal.id);
    dispatch(startCooldown(gameId, link, duration, place, placeId));
  });
};

export const server$traitStartCooldown = (gameId, traitData, sourceAnimal) => (dispatch) => {
  logger.debug('server$traitStartCooldown:', sourceAnimal.id, traitData.type);
  traitData.cooldowns.forEach(([link, place, duration]) => {
    const placeId = (place === TRAIT_COOLDOWN_PLACE.PLAYER
      ? sourceAnimal.ownerId
      : sourceAnimal.id);
    dispatch(server$startCooldown(gameId, link, duration, place, placeId));
  });
};

// simpleActions
export const makeTraitTuple = (sourceAnimal, traitType, targetAnimal) => ({
  sourcePid: sourceAnimal.ownerId
  , sourceAid: sourceAnimal.id
  , traitType
  , targetPid: targetAnimal.ownerId
  , targetAid: targetAnimal.id
});

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

const traitKillAnimal = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => ({
  type: 'traitKillAnimal'
  , data: {gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}
});

export const server$traitKillAnimal = (gameId, sourceAnimal, targetAnimal) => (dispatch, getState) => dispatch(
  Object.assign(traitKillAnimal(gameId
    , sourceAnimal.ownerId, sourceAnimal.id
    , targetAnimal.ownerId, targetAnimal.id)
    , {meta: {users: selectPlayers4Sockets(getState, gameId)}}));

const traitAnimalRemoveTrait = (gameId, sourcePid, sourceAid, traitIndex) => ({
  type: 'traitAnimalRemoveTrait'
  , data: {gameId, sourcePid, sourceAid, traitIndex}
});

export const server$traitAnimalRemoveTrait = (gameId, sourceAnimal, traitIndex) => (dispatch, getState) => dispatch(
  Object.assign(traitAnimalRemoveTrait(gameId
    , sourceAnimal.ownerId, sourceAnimal.id
    , traitIndex)
    , {meta: {users: selectPlayers4Sockets(getState, gameId)}}));

const playerActed = (gameId, userId) => ({
  type: 'playerActed'
  , data: {gameId, userId}
});

export const server$playerActed = (gameId, userId) => (dispatch, getState) => {
  dispatch(server$game(gameId, playerActed(gameId, userId)));
  dispatch(endTurnIfNoOptions(gameId, userId));
};

// Notification

const traitNotify_Start = (gameId, sourceAid, traitType, targetId) => ({
  type: 'traitNotify_Start'
  , data: {gameId, sourceAid, traitType, targetId}
});

const traitNotify_End = (gameId, sourceAid, traitType, targetId) => ({
  type: 'traitNotify_End'
  , data: {gameId, sourceAid, traitType, targetId}
});

export const server$traitNotify_Start = (game, sourceAnimal, traitType, targetId) => (dispatch, getState) => dispatch(
  Object.assign(traitNotify_Start(game.id, sourceAnimal.id, traitType, targetId)
    , {meta: {users: selectPlayers4Sockets(getState, game.id)}}));

export const server$traitNotify_End = (gameId, sourceAid, traitType, targetId) => (dispatch, getState) => {
  logger.debug('server$traitNotify_End');
  dispatch(server$game(gameId, traitNotify_End(gameId, sourceAid, traitType, targetId)));
};

const client$traitNotify_End = (gameId, sourceAid, traitType, targetId) => ({
  type: 'traitNotify_End_' + traitType
  , data: {gameId, sourceAid, traitType, targetId}
});

const client$traitNotify_Start = (gameId, sourceAid, traitType, targetId) => ({
  type: 'traitNotify_Start_' + traitType
  , data: {gameId, sourceAid, traitType, targetId}
});

// complexActions

export const server$startFeeding = (gameId, animal, amount, sourceType, sourceId) => (dispatch, getState) => {
  const neededFood = animal.needsFood();

  if (!animal.canEat(selectGame(getState, gameId)) || neededFood === 0) return false;

  // TODO bug with 2 amount on animal 2/3
  dispatch(server$game(gameId, traitMoveFood(gameId, animal.id, Math.min(amount, neededFood), sourceType, sourceId)));

  // Cooperation
  if (sourceType === FOOD_SOURCE_TYPE.GAME && selectGame(getState, gameId).food > 0) {
    dispatch(local$traitStartCooldown(gameId, TraitCooperation, animal));
    animal.traits.filter(trait => trait.type === TraitCooperation.type)
      .forEach(trait => {
        const game = selectGame(getState, gameId);
        const {animal: linkedAnimal} = game.locateAnimal(trait.linkAnimalId);
        if (checkAction(game, TraitCooperation, linkedAnimal)) {
          dispatch(server$startFeeding(gameId, linkedAnimal, 1, FOOD_SOURCE_TYPE.GAME, animal.id));
        }
      });
  }

  // Communication
  dispatch(local$traitStartCooldown(gameId, TraitCommunication, animal));
  animal.traits.filter(trait => trait.type === TraitCommunication.type)
    .forEach(trait => {
      const game = selectGame(getState, gameId);
      const {animal: linkedAnimal} = game.locateAnimal(trait.linkAnimalId);
      if (checkAction(game, TraitCommunication, linkedAnimal)) {
        dispatch(server$startFeeding(gameId, linkedAnimal, 1, FOOD_SOURCE_TYPE.ANIMAL_COPY, animal.id));
      }
    });
  return true;
};

// Cooldowns

// Cooldown to Server Only
const startCooldown = (gameId, link, duration, place, placeId) => ({
  type: 'startCooldown'
  , data: {gameId, link, duration, place, placeId}
});

// low level
export const server$startCooldown = (gameId, link, duration, place, placeId) => (dispatch, getState) => dispatch(
  Object.assign(startCooldown(gameId, link, duration, place, placeId), {
    meta: {users: selectPlayers4Sockets(getState, gameId)}
  }));

// Defence

const traitDefenceQuestion = (gameId, questionId, traitTuple) => ({
  type: 'traitDefenceQuestion'
  , data: {gameId, questionId, traitTuple}
});

export const server$traitDefenceQuestionInstant = (gameId, attackAnimal, traitType, defenceAnimal, defaultDefence) => (dispatch) => {
  const questionId = uuid.v4();
  logger.debug('server$traitDefenceQuestionInstant', questionId, attackAnimal.id, traitType, defenceAnimal.id);
  dispatch(traitDefenceQuestion(gameId, questionId, makeTraitTuple(attackAnimal, traitType, defenceAnimal)));
  const result = dispatch(defaultDefence(questionId));
  dispatch(server$traitDefenceAnswerSuccess(gameId, questionId));
  return result;
};

const makeTraitDefenceQuestionTimeout = (gameId, questionId) => `traitDefenceQuestion#${gameId}#${questionId}`;

export const server$traitDefenceQuestion = (gameId, attackAnimal, traitType, defenceAnimal, defaultDefence) => (dispatch, getState) => {
  const questionId = uuid.v4();
  const game = selectGame(getState, gameId);
  logger.debug('server$traitDefenceQuestion', questionId, attackAnimal.id, traitType, defenceAnimal.id);
  dispatch(
    Object.assign(traitDefenceQuestion(gameId, null, makeTraitTuple(attackAnimal, traitType, defenceAnimal))
      , {meta: {clientOnly: true, users: selectPlayers4Sockets(getState, gameId)}}));
  dispatch(addTimeout(game.settings.timeTraitResponse
    , makeTraitDefenceQuestionTimeout(game.id, questionId)
    , defaultDefence(questionId)));
  dispatch(
    Object.assign(traitDefenceQuestion(gameId, questionId, makeTraitTuple(attackAnimal, traitType, defenceAnimal))
      , {meta: {userId: defenceAnimal.ownerId}}));
};

export const traitDefenceAnswerRequest = (questionId, traitType, targetId) => (dispatch, getState) => dispatch({
  type: 'traitDefenceAnswerRequest'
  , data: {gameId: getState().get('game').id, questionId, traitType, targetId}
  , meta: {server: true}
});

export const traitDefenceAnswerSuccess = (gameId, questionId) => ({
  type: 'traitDefenceAnswerSuccess'
  , data: {gameId, questionId}
});

export const server$traitDefenceAnswerSuccess = (gameId, questionId) => (dispatch, getState) => {
  dispatch(cancelTimeout(makeTraitDefenceQuestionTimeout(gameId, questionId)));
  dispatch(Object.assign(traitDefenceAnswerSuccess(gameId, questionId)
    , {meta: {users: selectPlayers4Sockets(getState, gameId)}}));
};


export const server$traitDefenceAnswer = (gameId, questionId, traitType, targetId) => (dispatch, getState) => {
  logger.debug('server$traitDefenceAnswer', questionId, traitType, targetId);
  const game = selectGame(getState, gameId);
  if (!game.get('question')) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'Game doesnt have Question(%s)', questionId)
  }
  const question = game.get('question').toJS();
  if (question.id !== questionId) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'QuesionID is incorrect (%s)', questionId)
  }
  const {sourceAnimal: attackAnimal, traitData: attackTraitData} =
    checkTraitActivation(game, question.sourcePid, question.sourceAid, question.traitType, question.targetAid);
  checkPlayerTurnAndPhase(game, attackAnimal.ownerId, PHASE.FEEDING);

  const {sourceAnimal: defenceAnimal, traitData: defenceTraitData, target} =
    checkTraitActivation(game, question.targetPid, question.targetAid, traitType, targetId);

  dispatch(server$traitDefenceAnswerSuccess(game.id, questionId));
  const result = dispatch(server$traitActivate(game, defenceAnimal, defenceTraitData, target, attackAnimal, attackTraitData));
  logger.debug('server$traitDefenceAnswer result:', attackTraitData.type, defenceTraitData.type, result);
  if (result) dispatch(server$playerActed(gameId, attackAnimal.ownerId));
  return result;
};

//

export const traitClientToServer = {
  traitTakeFoodRequest: ({gameId, animalId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.FEEDING);
    const animal = checkPlayerHasAnimal(game, userId, animalId);
    checkAnimalCanEat(game, animal);

    logger.debug('traitTakeFoodRequest');

    dispatch(server$startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));
    dispatch(server$startCooldown(gameId, 'TraitCarnivorous', TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));

    dispatch(server$startFeeding(gameId, animal, 1, FOOD_SOURCE_TYPE.GAME));
    dispatch(server$playerActed(gameId, userId));
  }
  ,
  traitActivateRequest: ({gameId, sourceAid, traitType, targetId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    const {sourceAnimal, traitData, target} = checkTraitActivation(game, userId, sourceAid, traitType, targetId);
    checkPlayerTurnAndPhase(game, userId, PHASE.FEEDING);
    dispatch(server$traitNotify_Start(game, sourceAnimal, traitType, targetId));
    const result = dispatch(server$traitActivate(game, sourceAnimal, traitData, target));
    if (result === void 0) {
      throw new Error(`traitActivateRequest@Game(${gameId}): Animal(${sourceAid})-${traitType}-Animal(${targetId}) result undefined`);
    }
    //logger.silly('traitActivateRequest: ' + result);
    if (result) {
      dispatch(server$playerActed(gameId, userId));
    }
  }
  , traitDefenceAnswerRequest: ({gameId, questionId, traitType, targetId}) =>
    server$traitDefenceAnswer(gameId, questionId, traitType, targetId)
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
  , traitDefenceQuestion: ({gameId, questionId, traitTuple}, currentUserId) =>
    traitDefenceQuestion(gameId, questionId, traitTuple)
  , traitDefenceAnswerSuccess: ({gameId, questionId}, currentUserId) =>
    traitDefenceAnswerSuccess(gameId, questionId)
  , traitNotify_Start: ({gameId, sourceAid, traitType, targetId}, currentUserId) =>
    client$traitNotify_Start(gameId, sourceAid, traitType, targetId)
  , traitNotify_End: ({gameId, sourceAid, traitType, targetId}, currentUserId) =>
    client$traitNotify_End(gameId, sourceAid, traitType, targetId)
  , traitAnimalRemoveTrait: ({gameId, sourcePid, sourceAid, traitIndex}) =>
    traitAnimalRemoveTrait(gameId, sourcePid, sourceAid, traitIndex)
  , traitGrazeFood: ({gameId, food, sourceAid}) => traitGrazeFood(gameId, food, sourceAid)
  , traitSetAnimalFlag: ({gameId, sourceAid, flag, on}) =>
    traitSetAnimalFlag(gameId, sourceAid, flag, on)
};