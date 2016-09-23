import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {STATUS} from '../models/UserModel';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CardModel, CARD_TARGET_TYPE} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';
import {TRAIT_TARGET_TYPE} from '../models/game/evolution/constants';

import {actionError} from './generic';
import {redirectTo} from '../utils';
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
export const server$gameCreateSuccess = (game) => (dispatch, getState) => {
  dispatch(gameCreateSuccess(game));
  selectPlayers(getState, game.id).forEach(userId => {
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
  dispatch(gameDeployAnimal(gameId, userId, animal, animalPosition, cardPosition));
  dispatch(Object.assign(
    gameDeployAnimal(gameId, userId, animal.toClient(), animalPosition, cardPosition)
    , {meta: {clientOnly: true, userId}}
  ));
  dispatch(Object.assign(
    gameDeployAnimal(gameId, userId, animal.toClient().toOthers(), animalPosition, cardPosition)
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

export const server$gameDeployTrait = (gameId, userId, cardId, animalId, trait) => (dispatch, getState) => {
  dispatch(gameDeployTrait(gameId, userId, cardId, animalId, trait));
  dispatch(Object.assign(
    gameDeployTrait(gameId, userId, cardId, animalId, trait.toClient())
    , {meta: {clientOnly: true, users: selectPlayers(getState, gameId)}}
  ));
};

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
  dispatch(Object.assign(gameEndTurn(gameId, userId), {
    meta: {users: selectPlayers(getState, gameId)}
  }));
  const game = selectGame(getState, gameId);
  if (game.players.every(player => player.ended)) {
    const food = game.generateFood();
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
  if (game.getPlayer(userId).hand.size === 0) {
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
  , gameReadyRequest: ({gameId, ready}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    dispatch(server$gamePlayerStatusChange(gameId, userId, ready ? STATUS.READY : STATUS.LOADING));
    /*
     * Actual starting
     * */
    const newGame = selectGame(getState, gameId);
    if (!newGame.started && newGame.players.every(player => player.status === STATUS.READY)) {
      const INITIAL_HAND_SIZE = 6;
      //new Array(INITIAL_HAND_SIZE).fill().every(() => {
      //  return true;
      //})
      dispatch(server$gameStart(gameId));
      newGame.players.forEach((player) => {
        const cards = newGame.deck.take(INITIAL_HAND_SIZE);
        dispatch(server$gameGiveCards(gameId, player.id, cards));
      });
    }
  }
  , gameEndTurnRequest: ({gameId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId);
    if (game.status.phase === PHASE.DEPLOY) {
      dispatch(server$gameEndDeploy(gameId, userId));
    } else {
      dispatch(server$gameEndEatingAction(gameId, userId));
    }
  }
  , gameDeployAnimalRequest: ({gameId, cardId, animalPosition = 0}, {user: {id: userId}}) => (dispatch, getState) => {
    // console.time('gameDeployAnimalRequest body');
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.DEPLOY);
    checkValidAnimalPosition(game, userId, animalPosition);
    const cardIndex = checkPlayerHasCard(game, userId, cardId);
    const card = game.getPlayer(userId).hand.get(cardIndex);
    const animal = AnimalModel.new(card);
    logger.verbose('selectGame > gameDeployAnimalRequest:', card);
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
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.DEPLOY);

    const cardIndex = checkPlayerHasCard(game, userId, cardId);
    const card = game.players.get(userId).hand.get(cardIndex);
    if (card.target & CARD_TARGET_TYPE.ANIMAL_SELF) {
      const animal = checkPlayerHasAnimal(game, userId, animalId);
      // TODO check if exists
      const trait = TraitModel.new(card.trait1type);
      const animalValidation = animal.validateTrait(trait);
      if (animalValidation !== true) {
        dispatch(actionError(userId, animalValidation));
        return;
      }
      logger.verbose('selectGame > gameDeployTraitRequest:', animal, card, trait);
      dispatch(server$gameDeployTrait(gameId, userId, cardId, animalId, trait));
      dispatch(server$gameEndDeployAction(gameId, userId));
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
};










