import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CooldownList} from '../models/game/CooldownList';
import {
  FOOD_SOURCE_TYPE
  , TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
} from '../models/game/evolution/constants';

import {server$game} from './generic';

import {selectRoom, selectGame, selectPlayers4Sockets} from '../selectors';

import {TraitCommunication, TraitMimicry} from '../models/game/evolution/traitData';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasCard
  , checkPlayerHasAnimal
  , checkPlayerTurnAndPhase
  , checkValidAnimalPosition
  , checkTraitActivation
} from './checks';

// Activation

export const traitTakeFoodRequest = (animalId) => (dispatch, getState) => dispatch({
  type: 'traitTakeFoodRequest'
  , data: {gameId: getState().get('game').id, animalId}
  , meta: {server: true}
});

export const traitActivateRequest = (animalId, traitType, targetId) => (dispatch, getState) => dispatch({
  type: 'traitActivateRequest'
  , data: {gameId: getState().get('game').id, animalId, traitType, targetId}
  , meta: {server: true}
});

// simpleActions

const traitMoveFood = (gameId, animalId, amount, sourceType, sourceId) => ({
  type: 'traitMoveFood'
  , data: {gameId, animalId, amount, sourceType, sourceId}
});

const traitKillAnimal = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => ({
  type: 'traitKillAnimal'
  , data: {gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}
});

export const server$traitKillAnimal = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => (dispatch, getState) => dispatch(
  Object.assign(traitKillAnimal(gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId)
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
  // TODO bug with 2 amount on animal 2/3
  dispatch(server$game(gameId, traitMoveFood(gameId, animal.id, Math.min(amount, neededFood), sourceType, sourceId)));

  // TODO mb move to traitData?
  if (neededFood > 0) {
    dispatch(startCooldown(gameId, 'TraitCommunication', TRAIT_COOLDOWN_DURATION.ACTIVATION, TRAIT_COOLDOWN_PLACE.ANIMAL, animal.id));
    animal.traits.filter(trait => trait.type === 'TraitCommunication')
      .forEach(trait => {
        const game = selectGame(getState, gameId);
        const {animal: linkedAnimal} = game.locateAnimal(trait.linkAnimalId);
        if (!game.cooldowns.checkFor(TraitCommunication.cooldownLink, linkedAnimal.ownerId, linkedAnimal.id)) {
          dispatch(server$startFeeding(gameId, linkedAnimal, 1, FOOD_SOURCE_TYPE.ANIMAL_COPY, animal.id));
        }
      });
  }
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

// Mimicry

const traitMimicryQuestion = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => ({
  type: 'traitMimicryQuestion'
  , data: {gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}
});

const traitMimicryQuestionNotify = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => ({
  type: 'traitMimicryQuestionNotify'
  , data: {gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}
});

export const traitMimicryAnswer = (sourcePid, sourceAid, traitType, targetPid, targetAid, newTargetPid, newTargetAid) => (dispatch, getState) => dispatch({
  type: 'traitMimicryAnswer'
  , data: {gameId: getState().get('game').id, sourcePid, sourceAid, traitType, targetPid, targetAid, newTargetPid, newTargetAid}
  , meta: {server: true}
});

export const server$traitMimicryQuestion = (gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId) => (dispatch, getState) => dispatch(
  Object.assign(traitMimicryQuestion(gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId)
    , {meta: {clientOnly: true, users: selectPlayers4Sockets(getState, gameId)}}));

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
    if (animal.needsFood() <= 0) {
      throw new ActionCheckError(`traitTakeFoodRequest@Game(${gameId})`, 'Animal(%s) full', animal)
    }

    dispatch(server$startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));
    dispatch(server$startCooldown(gameId, 'TraitCarnivorous', TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));

    dispatch(server$playerActed(gameId, userId));
    dispatch(server$startFeeding(gameId, animal, 1, FOOD_SOURCE_TYPE.GAME));
  }
  , traitActivateRequest: ({gameId, animalId, traitType, targetId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    const {sourceAnimal, traitData, targetPid, targetAnimal} =
      checkTraitActivation(game, userId, animalId, traitType, targetId);
    dispatch(server$playerActed(gameId, userId));
    dispatch(traitData.action({
      game: game
      , sourcePlayerId: userId
      , sourceAnimal: sourceAnimal
      , targetPlayerId: targetPid
      , targetAnimal: targetAnimal
    }));
  }
  , traitMimicryAnswer: ({gameId, sourcePid, sourceAid, traitType, targetPid, targetAid, newTargetPid, newTargetAid}) => (dispatch, getState) => {
    console.log(sourcePid, sourceAid, traitType, targetPid, targetAid, newTargetPid, newTargetAid)
    const game = selectGame(getState, gameId);
    const {sourceAnimal, targetAnimal, traitData} =
      checkTraitActivation(game, sourcePid, sourceAid, traitType, targetAid);
    const {targetAnimal: newTargetAnimal} =
      checkTraitActivation(game, sourcePid, sourceAid, traitType, newTargetAid);
    dispatch(traitData.action({
      game: game
      , sourcePlayerId: sourcePid
      , sourceAnimal: sourceAnimal
      , targetPlayerId: newTargetPid
      , targetAnimal: newTargetAnimal
    }));
  }
};

export const traitServerToClient = {
  traitMoveFood: ({gameId, animalId, amount, sourceType, sourceId}) => traitMoveFood(gameId, animalId, amount, sourceType, sourceId)
  , startCooldown: ({gameId, link, duration, place, placeId}) => startCooldown(gameId, link, duration, place, placeId)
  , traitKillAnimal: ({gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}) =>
    traitKillAnimal(gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId)
  , playerActed: ({gameId, userId}) =>
    playerActed(gameId, userId)
  , traitMimicryQuestion: ({gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}, currentUserId) => (dispatch) => {
    if (currentUserId === targetPlayerId)
      dispatch(traitMimicryQuestion({gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}));
    dispatch(traitMimicryQuestionNotify({gameId, sourcePlayerId, sourceAnimalId, targetPlayerId, targetAnimalId}));
  }
};