import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {
  FOOD_SOURCE_TYPE
  , TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
} from '../models/game/evolution/constants';

import {server$game} from './generic';

import {selectRoom, selectGame, selectPlayers4Sockets} from '../selectors';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {TraitDataModel} from '../models/game/evolution/TraitDataModel';
import {CooldownList} from '../models/game/CooldownList';
import {TraitCommunication, TraitMimicry} from '../models/game/evolution/traitData';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasCard
  , checkPlayerHasAnimal
  , checkPlayerTurnAndPhase
  , checkValidAnimalPosition
  , checkTraitActivation
  , checkTraitActivation_Animal
} from './checks';

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
  logger.silly('server$traitActivate:', sourceAnimal.id, traitData.type, JSON.stringify(...params));
  let result = false;
  if (!TraitDataModel.checkAction(game, traitData, sourceAnimal)) {
    throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
      , 'Animal(%s):Trait(%s) checkAction failed', sourceAnimal.id, traitData.type)
  }
  switch (traitData.targetType) {
    case TRAIT_TARGET_TYPE.ANIMAL:
      result = dispatch(server$traitActivate_Animal(game, sourceAnimal, traitData, ...params));
      break;
    case TRAIT_TARGET_TYPE.TRAIT:
      result = dispatch(server$traitActivate_Trait(game, sourceAnimal, traitData, ...params));
      break;
    default:
      throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
        , 'Animal(%s):Trait(%s) unknown target type %s', sourceAnimal.id, traitData.type, traitData.targetType)
  }
  return result;
};

const server$traitActivate_Animal = (game, sourceAnimal, traitData, targetAid, ...params) => {
  const targetAnimal = checkTraitActivation_Animal(game, sourceAnimal, traitData, targetAid);

  return traitData.action(game, sourceAnimal, targetAnimal, ...params);
};

const server$traitActivate_Trait = (game, sourceAnimal, traitData, traitIndex, ...params) => {
  return traitData.action(game, sourceAnimal, traitIndex, ...params);
};

export const server$traitStartCooldown = (gameId, traitData, sourceAnimal) => (dispatch) => {
  traitData.cooldowns.forEach(([link, place, duration]) => {
    const placeId = (place === TRAIT_COOLDOWN_PLACE.PLAYER
      ? sourceAnimal.ownerId
      : sourceAnimal.id);
    dispatch(server$startCooldown(gameId, link, duration, place, placeId));
  });
};

// simpleActions

const traitMoveFood = (gameId, animalId, amount, sourceType, sourceId) => ({
  type: 'traitMoveFood'
  , data: {gameId, animalId, amount, sourceType, sourceId}
});

const traitKillAnimal = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => ({
  type: 'traitKillAnimal'
  , data: {gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}
});

export const server$traitKillAnimal = (gameId, sourceAnimal, targetAnimal) => (dispatch, getState) => dispatch(
  Object.assign(traitKillAnimal(gameId
    , sourceAnimal.ownerId, sourceAnimal.id
    , targetAnimal.ownerId, targetAnimal.id)
    , {meta: {users: selectPlayers4Sockets(getState, gameId)}}));

const playerActed = (gameId, userId) => ({
  type: 'playerActed'
  , data: {gameId, userId}
});

export const server$playerActed = (gameId, userId) => (dispatch, getState) => dispatch(
  Object.assign(playerActed(gameId, userId)
    , {meta: {users: selectPlayers4Sockets(getState, gameId)}}));

const traitQuestion = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => ({
  type: 'traitQuestion'
  , data: {gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}
});

// complexActions

export const server$startFeeding = (gameId, animal, amount, sourceType, sourceId) => (dispatch, getState) => {
  const neededFood = animal.needsFood();

  if (!animal.canEat(selectGame(getState, gameId)) || neededFood === 0) return false;

  // TODO bug with 2 amount on animal 2/3
  dispatch(server$game(gameId, traitMoveFood(gameId, animal.id, Math.min(amount, neededFood), sourceType, sourceId)));

  // TODO mb move to traitData?
  dispatch(startCooldown(gameId, TraitCommunication.type, TRAIT_COOLDOWN_DURATION.ACTIVATION, TRAIT_COOLDOWN_PLACE.ANIMAL, animal.id));
  animal.traits.filter(trait => trait.type === TraitCommunication.type)
    .forEach(trait => {
      const game = selectGame(getState, gameId);
      const {animal: linkedAnimal} = game.locateAnimal(trait.linkAnimalId);
      if (TraitDataModel.checkAction(game, TraitCommunication, linkedAnimal)) {
        dispatch(server$startFeeding(gameId, linkedAnimal, 1, FOOD_SOURCE_TYPE.ANIMAL_COPY, animal.id));
      }
    });
  return true;
};

// Cooldowns

export const startCooldown = (gameId, link, duration, place, placeId) => ({
  type: 'startCooldown'
  , data: {gameId, link, duration, place, placeId}
});

export const server$startCooldown = (gameId, link, duration, place, placeId) => (dispatch, getState) => dispatch(
  Object.assign(startCooldown(gameId, link, duration, place, placeId), {
    meta: {users: selectPlayers4Sockets(getState, gameId)}
  }));

// Defence

const traitDefenceQuestion = (gameId, attack) => ({
  type: 'traitDefenceQuestion'
  , data: {gameId, attack}
});

const traitDefenceQuestionNotify = (gameId, attack) => ({
  type: 'traitDefenceQuestionNotify'
  , data: {gameId, attack}
});

export const server$traitDefenceQuestion = (gameId, attack) => (dispatch, getState) => dispatch(
  Object.assign(traitDefenceQuestion(gameId, attack)
    , {meta: {clientOnly: true, users: selectPlayers4Sockets(getState, gameId)}}));

export const traitDefenceAnswerRequest = (attack, defence) => (dispatch, getState) => dispatch({
  type: 'traitDefenceAnswerRequest'
  , data: {gameId: getState().get('game').id, attack, defence}
  , meta: {server: true}
});

export const server$traitDefenceAnswer = (gameId
  , attack //{sourcePid, sourceAid, traitType, targetPid, targetAid}
  , defence //{traitType, [traitIndex | targetPid, targetAid ]}
) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const {sourceAnimal: attackAnimal, traitData: attackTraitData} =
    checkTraitActivation(game, attack.sourcePid, attack.sourceAid, attack.traitType);
  checkPlayerTurnAndPhase(game, attack.sourcePid, PHASE.FEEDING);
  const {sourceAnimal: defenceAnimal, traitData: defenceTraitData} =
    checkTraitActivation(game, attack.targetPid, attack.targetAid, defence.traitType);

  dispatch(cancelTimeout('traitAnswer' + gameId));
  switch (defenceTraitData.targetType) {
    case TRAIT_TARGET_TYPE.ANIMAL:
      dispatch(server$traitActivate(game, defenceAnimal, defenceTraitData, defence.targetAid, attackAnimal, attackTraitData));
      break;
    case TRAIT_TARGET_TYPE.TRAIT:
      dispatch(server$traitActivate(game, defenceAnimal, defenceTraitData, defence.targetIndex, attackAnimal, attackTraitData));
      break;
    default:
      //throw new ActionCheckError(`server$traitActivate@Game(${game.id})`
      //  , 'Animal(%s):Trait(%s) unknown target type %s', sourceAnimal.id, traitData.type, traitData.targetType)
  }
};


//

export const traitClientToServer = {
  traitTakeFoodRequest: ({gameId, animalId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.FEEDING);
    const animal = checkPlayerHasAnimal(game, userId, animalId);
    if (game.food < 1) {
      throw new ActionCheckError(`traitTakeFoodRequest@Game(${gameId})`, 'Not enough food (%s)', game.food)
    }
    if (game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, userId, animalId)) {
      throw new ActionCheckError(`traitTakeFoodRequest@Game(${gameId})`, 'Cooldown active')
    }
    if (!animal.canEat(game)) {
      throw new ActionCheckError(`traitTakeFoodRequest@Game(${gameId})`, `Animal(%s) can't eat`, animal)
    }

    dispatch(server$startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));
    dispatch(server$startCooldown(gameId, 'TraitCarnivorous', TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));

    dispatch(server$playerActed(gameId, userId));
    dispatch(server$startFeeding(gameId, animal, 1, FOOD_SOURCE_TYPE.GAME));
  }
  , traitActivateRequest: ({gameId, sourceAid, traitType, targetId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    const {sourceAnimal, traitData} = checkTraitActivation(game, userId, sourceAid, traitType);
    checkPlayerTurnAndPhase(game, userId, PHASE.FEEDING);
    const result = dispatch(server$traitActivate(game, sourceAnimal, traitData, targetId));
    if (result === void 0) {
      throw new Error(`traitActivateRequest@Game(${gameId}): Animal(${sourceAid})-${traitType}-Animal(${targetId}) result undefined`);
    }
    if (result) {
      dispatch(server$playerActed(gameId, userId));
    }
  }
  , traitDefenceAnswerRequest: ({gameId, attack, defence}) => server$traitDefenceAnswer(gameId, attack, defence)
};

export const traitServerToClient = {
  traitMoveFood: ({gameId, animalId, amount, sourceType, sourceId}) => traitMoveFood(gameId, animalId, amount, sourceType, sourceId)
  , startCooldown: ({gameId, link, duration, place, placeId}) => startCooldown(gameId, link, duration, place, placeId)
  , traitKillAnimal: ({gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}) =>
    traitKillAnimal(gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId)
  , playerActed: ({gameId, userId}) =>
    playerActed(gameId, userId)
  , traitDefenceQuestion: ({gameId, attack}, currentUserId) => (dispatch) => {
    dispatch(traitDefenceQuestionNotify(gameId, attack));
    if (currentUserId === attack.targetPid)
      dispatch(traitDefenceQuestion(gameId, attack));
  }
};