import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {STATUS} from '../models/UserModel';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CardModel, TARGET_TYPE} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';
import * as traits from '../models/game/evolution/traits';

import {actionError} from './generic';
import {redirectTo} from '../utils';
import {selectRoom, selectGame} from '../selectors';

const getPlayers = (game) => game.players.keySeq().toArray();
const selectPlayers = (getState, gameId) => getState().getIn(['games', gameId, 'players']).keySeq().toArray();

/*
 * Game Create
 * */
export const gameCreateRequest = (roomId) => ({
  type: 'gameCreateRequest'
  , data: {roomId}
  , meta: {server: true}
});
export const gameCreateSuccess = (game) => ({
  type: 'gameCreateSuccess'
  , data: {game}
});
export const server$gameCreateSuccess = (game) => (dispatch) => {
  dispatch(gameCreateSuccess(game));
  getPlayers(game).forEach(userId => {
    dispatch(Object.assign(
      gameCreateSuccess(game.toClient(userId))
      , {meta: {userId, clientOnly: true}}
    ));
  });
};
export const server$gameStart = (gameId) => (dispatch, getState) => dispatch(
  Object.assign(gameStart(gameId), {
    meta: {users: selectPlayers(getState, gameId)}
  })
);
export const gameStart = (gameId) => ({
  type: 'gameStart'
  , data: {gameId}
});
/*
 * Game Ready Request
 * */
export const gameReadyRequest = (ready = true) => (dispatch, getState) => dispatch({
  type: 'gameReadyRequest'
  , data: {gameId: getState().get('game').id, ready}
  , meta: {server: true}
});
export const gamePlayerStatusChange = (gameId, userId, status) => ({
  type: 'gamePlayerStatusChange'
  , data: {gameId, userId, status}
});
export const server$gamePlayerStatusChange = (gameId, userId, status) => (dispatch, getState) => dispatch(
  Object.assign(gamePlayerStatusChange(gameId, userId, status), {
    meta: {users: selectPlayers(getState, gameId)}
  })
);

export const gameGiveCards = (gameId, userId, cards) => ({
  type: 'gameGiveCards'
  , data: {gameId, userId, cards}
});

export const server$gameGiveCards = (gameId, userId, cards) => (dispatch, getState) => {
  dispatch(Object.assign(
    gameGiveCards(gameId, userId, cards)
    , {meta: {userId}}
  ));
  dispatch(Object.assign(
    gameGiveCards(gameId, userId, CardModel.generate(cards.size))
    , {meta: {clientOnly: true, users: selectPlayers(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

/*
 * DEPLOY!
 * */

/* gameDeployAnimal */

export const gameDeployAnimalRequest = (cardId, animalPosition) => (dispatch, getState) =>dispatch({
  type: 'gameDeployAnimalRequest'
  , data: {gameId: getState().get('game').id, cardId, animalPosition}
  , meta: {server: true}
});

export const gameDeployAnimal = (gameId, userId, animal, animalPosition, cardPosition) => ({
  type: 'gameDeployAnimal'
  , data: {gameId, userId, animal, animalPosition, cardPosition}
});

export const server$gameDeployAnimal = (gameId, userId, animal, animalPosition, cardPosition) => (dispatch, getState) => {
  dispatch(Object.assign(
    gameDeployAnimal(gameId, userId, animal, animalPosition, cardPosition)
    , {meta: {userId}}
  ));
  dispatch(Object.assign(
    gameDeployAnimal(gameId, userId, animal.toOthers(), animalPosition, cardPosition)
    , {meta: {clientOnly: true, users: selectPlayers(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

/* gameDeployTrait */

export const gameDeployTraitRequest = (cardId, animalId) => (dispatch, getState) =>dispatch({
  type: 'gameDeployTraitRequest'
  , data: {gameId: getState().get('game').id, cardId, animalId}
  , meta: {server: true}
});

export const gameDeployTrait = (gameId, userId, cardId, animalId, trait) => ({
  type: 'gameDeployTrait'
  , data: {gameId, userId, cardId, animalId, trait}
});

export const server$gameDeployTrait = (gameId, userId, cardId, animalId, trait) => (dispatch, getState) => dispatch(Object.assign(
  gameDeployTrait(gameId, userId, cardId, animalId, trait)
  , {meta: {users: selectPlayers(getState, gameId)}}
));

/* gameNextPlayer */

export const gameNextPlayer = (gameId) => ({
  type: 'gameNextPlayer'
  , data: {gameId}
});
export const server$gameNextPlayer = (gameId, userId) => (dispatch, getState) => dispatch(
  Object.assign(gameNextPlayer(gameId), {
    meta: {users: selectPlayers(getState, gameId)}
  })
);

/* gameEndTurn */

export const gameEndTurnRequest = () => (dispatch, getState) => dispatch({
  type: 'gameEndTurnRequest'
  , data: {gameId: getState().get('game').id}
  , meta: {server: true}
});
export const gameEndTurn = (gameId, userId) => ({
  type: 'gameEndTurn'
  , data: {gameId, userId}
});

export const server$gameEndDeploy = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  dispatch(Object.assign(gameEndTurn(gameId, userId), {
    meta: {users: selectPlayers(getState, gameId)}
  }));
  if (game().players.every(player => player.ended)) {
    const food = game().generateFood();
    dispatch(Object.assign(gameStartEat(gameId, food), {
      meta: {users: selectPlayers(getState, gameId)}
    }));
  } else {
    dispatch(Object.assign(gameNextPlayer(gameId), {
      meta: {users: selectPlayers(getState, gameId)}
    }));
  }
};

/* gameEndTurnDeploy */
export const server$gameEndDeployAction = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (game().getPlayer(userId).hand.size === 0) {
    dispatch(server$gameEndDeploy(gameId, userId));
  } else {
    dispatch(server$gameNextPlayer(gameId));
  }
};

/*
 * EATING
 * */

export const gameStartEat = (gameId, food) => ({
  type: 'gameStartEat'
  , data: {gameId, food}
});

export const gameTakeFoodRequest = (animalId) => (dispatch, getState) => dispatch({
  type: 'gameTakeFoodRequest'
  , data: {gameId: getState().get('game').id, animalId}
  , meta: {server: true}
});

export const gameGiveFood = (gameId, animalIds) => ({
  type: 'gameGiveFood'
  , data: {gameId, animalIds}
});

export const server$gameGiveFood = (gameId, animalIds) => (dispatch, getState) => dispatch(
  Object.assign(gameGiveFood(gameId, animalIds), {
    meta: {users: selectPlayers(getState, gameId)}
  })
);

export const server$gameEndEatingAction = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  // dispatch(Object.assign(gameEndTurn(gameId, userId), {
  //   meta: {users: selectPlayers(getState, gameId)}
  // }));
  // if (game().players.every(player => player.ended)) {
  //   const food = game().generateFood();
  //   dispatch(Object.assign(gameStartEat(gameId, food), {
  //     meta: {users: selectPlayers(getState, gameId)}
  //   }));
  // } else {
  dispatch(Object.assign(gameNextPlayer(gameId), {
    meta: {users: selectPlayers(getState, gameId)}
  }));
  // }
};

export const gameActivateTraitRequest = (animalId, traitType, target) => (dispatch, getState) => dispatch({
  type: 'gameActivateTraitRequest'
  , data: {gameId: getState().get('game').id, animalId, traitType, target}
  , meta: {server: true}
});

// export const gameActivateTrait = (animalId, traitType, target) => ({
//   type: 'gameActivateTrait'
//   , data: {gameId, userId, cardId, animalId, trait}
// });
//
// export const server$gameActivateTrait = (gameId, userId, cardId, animalId, trait) => (dispatch, getState) => dispatch(Object.assign(
//   gameDeployTrait(gameId, userId, cardId, animalId, trait)
//   , {meta: {users: selectPlayers(getState, gameId)}}
// ));
/*
 * gameClientToServer
 * */

export const gameClientToServer = {
  gameCreateRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const roomId = data.roomId;
    const room = getState().getIn(['rooms', roomId]);
    const validation = room.validateCanStart(userId);
    if (validation === true) {
      const game = GameModel.new(room);
      dispatch(server$gameCreateSuccess(game));
    } else {
      dispatch(actionError(userId, validation));
    }
  }
  , gameReadyRequest: ({gameId, ready}, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const game = selectGame(getState, gameId);
    checkGameDefined(getState, gameId);
    checkGameHasUser(getState, gameId, userId);
    dispatch(server$gamePlayerStatusChange(gameId, userId, ready ? STATUS.READY : STATUS.LOADING));
    /*
     * Actual starting
     * */
    if (!game().started && game().players.every(player => player.status === STATUS.READY)) {
      const INITIAL_HAND_SIZE = 6;
      //new Array(INITIAL_HAND_SIZE).fill().every(() => {
      //  return true;
      //})
      dispatch(server$gameStart(gameId));
      game().players.forEach((player) => {
        const cards = game().deck.take(INITIAL_HAND_SIZE);
        dispatch(server$gameGiveCards(gameId, player.id, cards));
      });
    }
  }
  , gameEndTurnRequest: ({gameId}, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const game = selectGame(getState, gameId);
    checkGameDefined(getState, gameId);
    checkGameHasUser(getState, gameId, userId);
    checkPlayerTurnAndPhase(getState, gameId, userId);
    if (game().status.phase === PHASE.DEPLOY) {
      dispatch(server$gameEndDeploy(gameId, userId));
    } else {
      dispatch(server$gameEndEatingAction(gameId, userId));
    }
  }
  , gameDeployAnimalRequest: ({gameId, cardId, animalPosition = 0}, {user: {id: userId}}) => (dispatch, getState) => {
    // console.time('gameDeployAnimalRequest body');
    const game = selectGame(getState, gameId);
    checkGameDefined(getState, gameId);
    checkGameHasUser(getState, gameId, userId);
    checkPlayerTurnAndPhase(getState, gameId, userId, PHASE.DEPLOY);
    checkValidAnimalPosition(getState, gameId, userId, animalPosition);
    const cardIndex = checkPlayerHasCard(getState, gameId, userId, cardId);
    const card = game().getPlayer(userId).hand.get(cardIndex);
    const animal = AnimalModel.new(card);
    logger.verbose('game > gameDeployAnimalRequest:', card);
    // console.timeEnd('gameDeployAnimalRequest body');
    // console.time('server$gameDeployAnimal');
    dispatch(server$gameDeployAnimal(gameId, userId, animal, parseInt(animalPosition), cardIndex));
    // console.timeEnd('server$gameDeployAnimal');
    // console.time('server$gameEndDeployAction');
    dispatch(server$gameEndDeployAction(gameId, userId));
    // console.timeEnd('server$gameEndDeployAction');
  }
  , gameDeployTraitRequest: ({gameId, cardId, animalId}, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const game = selectGame(getState, gameId);
    checkGameDefined(getState, gameId);
    checkGameHasUser(getState, gameId, userId);
    checkPlayerTurnAndPhase(getState, gameId, userId, PHASE.DEPLOY);

    const cardIndex = checkPlayerHasCard(getState, gameId, userId, cardId);
    const card = game().players.get(userId).hand.get(cardIndex);
    if (card.target & TARGET_TYPE.ANIMAL_SELF) {
      const animal = checkPlayerHasAnimal(getState, gameId, userId, animalId);
      const trait = TraitModel.new(traits[card.trait1type]);
      const animalValidation = animal.validateTrait(trait);
      if (animalValidation !== true) {
        dispatch(actionError(userId, animalValidation));
        return;
      }
      logger.verbose('game > gameDeployTraitRequest:', animal, card, trait);
      dispatch(server$gameDeployTrait(gameId, userId, cardId, animalId, trait));
      dispatch(server$gameEndDeployAction(gameId, userId));
    }
  }
  , gameTakeFoodRequest: ({gameId, animalId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    const checkGame = game();
    checkGameDefined(getState, gameId);
    checkGameHasUser(getState, gameId, userId);
    checkPlayerTurnAndPhase(getState, gameId, userId, PHASE.EAT);
    const animal = checkPlayerHasAnimal(getState, gameId, userId, animalId);
    if (checkGame.food < 1) {
      throw new ActionCheckError(`gameTakeFoodRequest@Game(${gameId})`, 'Not enough food (%s)', checkGame.food)
    }
    if (!animal.canEat()) {
      throw new ActionCheckError(`gameTakeFoodRequest@Game(${gameId})`, 'Animal(%s) full', animalId)
    }
    dispatch(server$gameGiveFood(gameId, [animalId]));
  }
  , gameActivateTraitRequest: ({gameId, animalId, traitType, target}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    const checkGame = game();
    checkGameDefined(getState, gameId);
    checkGameHasUser(getState, gameId, userId);
    checkPlayerTurnAndPhase(getState, gameId, userId, PHASE.EAT);
    const animal = checkPlayerHasAnimal(getState, gameId, userId, animalId);
    const trait = animal.traits.find(trait => trait.type === traitType);
    if (!trait) {
      throw new ActionCheckError(`gameActivateTraitRequest@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', animalId, traitType)
    }
    if (trait.action) {
      trait.action();
    }
  }
};

export const gameServerToClient = {
  gameCreateSuccess: (({game}, currentUserId) => (dispatch) => {
    dispatch(gameCreateSuccess(GameModelClient.fromServer(game, currentUserId)));
    dispatch(redirectTo('/game'));
  })
  , gameStart: ({gameId}) => gameStart(gameId)
  , gamePlayerStatusChange: ({gameId, userId, status}) => gamePlayerStatusChange(gameId, userId, status)
  , gameGiveCards: ({gameId, userId, cards}) =>
    gameGiveCards(gameId, userId, List(cards).map(card => CardModel.fromServer(card)))
  , gameDeployAnimal: ({gameId, userId, animal, animalPosition, cardPosition}) =>
    gameDeployAnimal(gameId, userId, AnimalModel.fromServer(animal), animalPosition, cardPosition)
  , gameDeployTrait: ({gameId, userId, cardId, animalId, trait}) =>
    gameDeployTrait(gameId, userId, cardId, animalId, TraitModel.fromServer(trait))
  , gameNextPlayer: ({gameId}) => gameNextPlayer(gameId)
  , gameEndTurn: ({gameId, userId}) => gameEndTurn(gameId, userId)
  , gameStartEat: ({gameId, food}) => gameStartEat(gameId, food)
  , gameGiveFood: ({gameId, animalIds}) => gameGiveFood(gameId, animalIds)
};

/*
 * Checks
 * */

const checkGameDefined = (getState, gameId) => {
  const game = selectGame(getState, gameId)();
  if (game === void 0)
    throw new ActionCheckError(`checkGameDefined(${gameId})`, 'Cannot find game');
};

const checkGameHasUser = (getState, gameId, userId) => {
  const game = selectGame(getState, gameId)();
  if (!game.players.has(userId))
    throw new ActionCheckError(`checkGameHasUser(${gameId})`, 'Game has no player %s', userId);
};

const checkPlayerHasCard = (getState, gameId, userId, cardId) => {
  const game = selectGame(getState, gameId)();
  const cardIndex = game.players.get(userId).hand.findIndex(card => card.id === cardId);
  if (!~cardIndex) {
    throw new ActionCheckError(`checkPlayerHasCard(${gameId})`, 'Card#%s not found in Player#%s', cardId, userId);
  }
  return cardIndex;
};

const checkPlayerHasAnimal = (getState, gameId, userId, animalId) => {
  const game = selectGame(getState, gameId)();
  const animalIndex = game.players.get(userId).continent.findIndex(animal => animal.id === animalId);
  if (!~animalIndex) {
    throw new ActionCheckError(`checkPlayerHasCard(${gameId})`, 'Animal#%s not found in Player#%s', animalId, userId);
  }
  return game.players.get(userId).continent.get(animalIndex);
};

const checkPlayerTurnAndPhase = (getState, gameId, userId, phase = -1) => {
  const game = selectGame(getState, gameId)();
  if (~phase && game.status.phase !== phase) {
    throw new ActionCheckError(`checkPlayerTurnAndPhase@Game(${gameId})`, 'Wrong phase (%s)', game.status.phase);
  }
  if (game.players.get(userId).index !== game.status.player) {
    throw new ActionCheckError(`checkPlayerTurnAndPhase@Game(${gameId})`
      , 'Wrong turn (%s), offender %s (%s)'
      , game.status.player, userId, game.players.get(userId).index);
  }
};

const checkValidAnimalPosition = (getState, gameId, userId, animalPosition) => {
  const game = selectGame(getState, gameId)();
  if (isNaN(parseInt(animalPosition)) || animalPosition < 0 || animalPosition > game.players.get(userId).continent.size) {
    throw new ActionCheckError(`checkValidAnimalPosition@Game(${gameId})`, 'Wrong animal position (%s)', animalPosition);
  }
};










