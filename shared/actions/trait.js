import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CooldownModel, CooldownsList} from '../models/game/CooldownModel';
import {TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from '../models/game/evolution/traitData/constants';

import {selectRoom, selectGame, selectPlayers} from '../selectors';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasCard
  , checkPlayerHasAnimal
  , checkPlayerTurnAndPhase
  , checkValidAnimalPosition
} from './checks';

/*
 * Activation
 * */

export const traitTakeFoodRequest = (animalId) => (dispatch, getState) => dispatch({
  type: 'traitTakeFoodRequest'
  , data: {gameId: getState().get('game').id, animalId}
  , meta: {server: true}
});

export const traitActivateRequest = (animalId, traitType, target) => (dispatch, getState) => dispatch({
  type: 'traitActivateRequest'
  , data: {gameId: getState().get('game').id, animalId, traitType, target}
  , meta: {server: true}
});

/*
 * simpleActions
 * */

const traitGiveFood = (gameId, animalId, amount) => ({
  type: 'traitGiveFood'
  , data: {gameId, animalId, amount}
});

const executeFeeding = (gameId, actionsList) => ({
  type: 'executeFeeding'
  , data: {gameId, actionsList}
});

/*
 * complexActions
 * */

const client$executeFeeding = (gameId, actionsList) => (dispatch, getState) => {
  //actionsList.reduce((result, action) => {
  //  return result.then(dispatch(action))
  //}, Promise.resolve());
  actionsList.forEach((action) => {
    dispatch(action);
  });
};

export const server$executeFeeding = (gameId, actionsList) => (dispatch, getState) => dispatch(
  Object.assign(executeFeeding(gameId, actionsList), {
    meta: {users: selectPlayers(getState, gameId)}
  })
);

export const server$startFeeding = (gameId, animal, amount) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const actionsList = [];
  if (animal.canEat()) {
    //throw new ActionCheckError(`traitTakeFoodRequest@Game(${gameId})`, 'Animal(%s) full', animal)
    actionsList.push(traitGiveFood(gameId, animal.id, amount)) // TODO bug with 2 amount on animal 2/3
  }
  dispatch(server$executeFeeding(gameId, actionsList));
};

/*
 * Cooldowns
 * */

export const startCooldown = (gameId, link, duration, place, placeId) => ({
  type: 'startCooldown'
  , data: {gameId, link, duration, place, placeId}
});

export const server$startCooldown = (gameId, link, duration, place, placeId) => (dispatch, getState) => dispatch(
  Object.assign(startCooldown(gameId, link, duration, place, placeId), {
    meta: {users: selectPlayers(getState, gameId)}
  }));

/*
 * traitClientToServer
 * */

export const traitClientToServer = {
  traitTakeFoodRequest: ({gameId, animalId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.EAT);
    const animal = checkPlayerHasAnimal(game, userId, animalId);
    if (game.food < 1) {
      throw new ActionCheckError(`traitTakeFoodRequest@Game(${gameId})`, 'Not enough food (%s)', game.food)
    }
    if (CooldownsList.checkFor(game, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, userId)) {
      throw new ActionCheckError(`traitTakeFoodRequest@Game(${gameId})`, 'Cooldown active')
    }

    dispatch(server$startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));
    dispatch(server$startCooldown(gameId, 'TraitCarnivorous', TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId));

    dispatch(server$startFeeding(gameId, animal, 1));
  },
  traitActivateRequest: ({gameId, animalId, traitType, target}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.EAT);
    const animal = checkPlayerHasAnimal(game, userId, animalId);
    const trait = animal.traits.find(trait => trait.type === traitType);
    if (!trait) {
      throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', animalId, traitType)
    }
    const traitData = trait.dataModel;
    if (!traitData.action) {
      throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) is not active', animalId, traitType)
    }
    if (traitData.checkAction && !traitData.checkAction(game, animal)) {
      throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) checkAction failed', animalId, traitType)
    }
    if (traitData.targetType !== null) {
      if (traitData.targetType === TRAIT_TARGET_TYPE.ANIMAL) {
        const {playerId, animalIndex} = game.locateAnimal(target);
        const targetAnimal = game.getPlayerAnimal(playerId, animal);
        if (!targetAnimal) {
          throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) cant locate Animal(%s)', animalId, traitType, target)
        }
        if (traitData.checkTarget && !traitData.checkTarget(game, animal, targetAnimal)) {
          throw new ActionCheckError(`traitActivateRequest@Game(${gameId})`, 'Animal(%s):Trait(%s) checkTarget failed', animalId, traitType)
        }
        dispatch(traitData.action({
          game: game
          , sourcePlayerId: userId
          , sourceAnimal: animal
          , targetPlayerId: playerId
          , targetAnimal: targetAnimal
        }));
      }
    }
  }
};

export const traitServerToClient = {
  traitGiveFood: ({gameId, animalId, amount}) => traitGiveFood(gameId, animalId, amount)
  , executeFeeding: ({gameId, actionsList}) => client$executeFeeding(gameId, actionsList)
};