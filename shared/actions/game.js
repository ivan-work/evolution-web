import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {STATUS} from '../models/UserModel';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';
import {CARD_TARGET_TYPE, TRAIT_TARGET_TYPE} from '../models/game/evolution/constants';

import {actionError} from './generic';
import {server$game} from './generic';
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

// Game Create
export const gameCreateRequest = (roomId, seed) => ({
  type: 'gameCreateRequest'
  , data: {roomId, seed}
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

// Game Start
export const server$gameStart = (gameId) => (dispatch, getState) =>
  dispatch(Object.assign(gameStart(gameId), {
    meta: {users: selectPlayers(getState, gameId)}
  }));
export const gameStart = (gameId) => ({
  type: 'gameStart'
  , data: {gameId}
});

// Game Ready Request
export const gameReadyRequest = (ready = true) => (dispatch, getState) => dispatch({
  type: 'gameReadyRequest'
  , data: {gameId: getState().get('game').id, ready}
  , meta: {server: true}
});
export const gamePlayerStatusChange = (gameId, userId, status) => ({
  type: 'gamePlayerStatusChange'
  , data: {gameId, userId, status}
});
export const server$gamePlayerStatusChange = (gameId, userId, status) => (dispatch, getState) =>
  dispatch(Object.assign(gamePlayerStatusChange(gameId, userId, status), {
    meta: {users: selectPlayers(getState, gameId)}
  }));

// Game Give Cards
export const gameGiveCards = (gameId, userId, cards) => ({
  type: 'gameGiveCards'
  , data: {gameId, userId, cards}
});
export const server$gameGiveCards = (gameId, userId, count) => (dispatch, getState) => {
  const cards = selectGame(getState, gameId).deck.take(count);
  dispatch(Object.assign(
    gameGiveCards(gameId, userId, cards)
    , {meta: {userId}}
  ));
  dispatch(Object.assign(
    gameGiveCards(gameId, userId, CardModel.generate(cards.size))
    , {meta: {clientOnly: true, users: selectPlayers(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

// ===== DEPLOY!

// gameDeployAnimal
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
    gameDeployAnimal(gameId, userId, animal.toOthers().toClient(), animalPosition, cardPosition)
    , {meta: {clientOnly: true, users: selectPlayers(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

// gameDeployTrait
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

// gameDeployAnimal || gameDeployTrait > gameDeployNext > gameNextPlayer || gameFinishDeploy
export const server$gameDeployNext = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (game.getPlayer(userId).hand.size !== 0) {
    dispatch(server$game(gameId, gameNextPlayer(gameId)));
  } else {
    dispatch(server$gameFinishDeploy(gameId, userId));
  }
};

// gameDeployNext || gameEndTurnRequest > gameFinishDeploy > gameEndTurn && (gameNextPlayer || gameStartEat)
export const server$gameFinishDeploy = (gameId, userId) => (dispatch, getState) => {
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
    dispatch(server$game(gameId, gameNextPlayer(gameId)));
  }
};

// gameEndTurn
export const gameEndTurnRequest = () => (dispatch, getState) => dispatch({
  type: 'gameEndTurnRequest'
  , data: {gameId: getState().get('game').id}
  , meta: {server: true}
});
export const gameEndTurn = (gameId, userId) => ({
  type: 'gameEndTurn'
  , data: {gameId, userId}
});

// gameNextPlayer
export const gameNextPlayer = (gameId) => ({
  type: 'gameNextPlayer'
  , data: {gameId}
});

// ===== EATING!

export const gameStartEat = (gameId, food) => ({
  type: 'gameStartEat'
  , data: {gameId, food}
});

export const server$gameFinishFeeding = (gameId, userId) => (dispatch, getState) => {
  dispatch(Object.assign(gameEndTurn(gameId, userId), {
    meta: {users: selectPlayers(getState, gameId)}
  }));
  const game = selectGame(getState, gameId);
  if (game.players.every(player => player.ended)) {
    dispatch(server$gameExtict(gameId));
  } else {
    dispatch(server$game(gameId, gameNextPlayer(gameId)));
  }
};

// ===== EXTINCT!

const animalStarve = (gameId, userId, animalId) => ({
  type: 'animalStarve'
  , data: {gameId, userId, animalId}
});

const gameStartDeploy = (gameId) => ({
  type: 'gameStartDeploy'
  , data: {gameId}
});

export const server$gameExtict = (gameId) => (dispatch, getState) => {
  //console.log('server$gameExtinct')
  const game = selectGame(getState, gameId);
  const actionsList = [];
  const cardNeedToPlayer = {};
  const cardGivePerPlayer = {};
  let deckSize = game.deck.size;
  let lastTurn = deckSize === 0;
  
  game.players.forEach((player, pid) => {
    cardGivePerPlayer[pid] = 0;
    cardNeedToPlayer[pid] = 1;
    player.continent.forEach(animal => {
      if (animal.getFood() < animal.getMaxFood()) {
        dispatch(server$game(gameId, animalStarve(gameId, animal.ownerId, animal.id)));
      } else {
        cardNeedToPlayer[pid] += 1;
      }
    });
    if (player.continent.size === 0 && player.hand.size === 0) {
      cardNeedToPlayer[pid] = 6;
    }
  });

  if (!lastTurn) {
    while (deckSize > 0 && Object.keys(cardNeedToPlayer).length > 0) {
      game.players.forEach((player, pid) => {
        if (deckSize <= 0) return true;
        if (cardNeedToPlayer[pid] > 0) {
          cardNeedToPlayer[pid] -= 1;
          dispatch(server$gameGiveCards(gameId, pid, 1));
          deckSize--;
        } else {
          delete cardNeedToPlayer[pid];
        }
      });
    }
    dispatch(server$game(gameId, gameStartDeploy(gameId)));
  } else {
    dispatch(server$game(gameId, gameEnd(gameId, selectGame(getState, gameId))));
  }
};

// ===== WIN!

const gameEnd = (gameId, game) => ({
  type: 'gameEnd'
  , data: {gameId, game}
});

export const gameClientToServer = {
  gameCreateRequest: ({roomId, seed}, meta) => (dispatch, getState) => {
    if (process.env.NODE_ENV === 'production') seed = null;
    const userId = meta.user.id;
    const room = getState().getIn(['rooms', roomId]);
    const validation = room.validateCanStart(userId);
    if (validation === true) {
      const game = !seed
        ? GameModel.new(room)
        : GameModel.parse(room, seed);
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
        dispatch(server$gameGiveCards(gameId, player.id, INITIAL_HAND_SIZE));
      });
    }
  }
  , gameEndTurnRequest: ({gameId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId);
    if (game.status.phase === PHASE.DEPLOY) {
      dispatch(server$gameFinishDeploy(gameId, userId));
    } else {
      dispatch(server$gameFinishFeeding(gameId, userId));
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
    const animal = AnimalModel.new(userId);
    logger.verbose('selectGame > gameDeployAnimalRequest:', card);
    // console.timeEnd('gameDeployAnimalRequest body');
    // console.time('server$gameDeployAnimal');
    dispatch(server$gameDeployAnimal(gameId, userId, animal, parseInt(animalPosition), cardIndex));
    // console.timeEnd('server$gameDeployAnimal');
    // console.time('server$gameDeployNext');
    dispatch(server$gameDeployNext(gameId, userId));
    // console.timeEnd('server$gameDeployNext');
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
      dispatch(server$gameDeployNext(gameId, userId));
    }
  }
};

/*
 * gameServerToClient
 * */
export const gameServerToClient = {
  gameCreateSuccess: (({game}, currentUserId) => (dispatch) => {
    dispatch(gameCreateSuccess(GameModelClient.fromServer(game, currentUserId)));
    dispatch(redirectTo('/game'));
  })
  , gameStart: ({gameId}) => gameStart(gameId)
  , gameStartDeploy: ({gameId}) => gameStartDeploy(gameId)
  , gameStartEat: ({gameId, food}) => gameStartEat(gameId, food)
  , gamePlayerStatusChange: ({gameId, userId, status}) => gamePlayerStatusChange(gameId, userId, status)
  , gameGiveCards: ({gameId, userId, cards}) =>
    gameGiveCards(gameId, userId, List(cards).map(card => CardModel.fromServer(card)))
  , gameDeployAnimal: ({gameId, userId, animal, animalPosition, cardPosition}) =>
    gameDeployAnimal(gameId, userId, AnimalModel.fromServer(animal), animalPosition, cardPosition)
  , gameDeployTrait: ({gameId, userId, cardId, animalId, trait}) =>
    gameDeployTrait(gameId, userId, cardId, animalId, TraitModel.fromServer(trait))
  , gameNextPlayer: ({gameId}) => gameNextPlayer(gameId)
  , gameEndTurn: ({gameId, userId}) => gameEndTurn(gameId, userId)
  , gameEnd: ({gameId, game}, currentUserId) => gameEnd(gameId, GameModelClient.fromServer(game, currentUserId))
  , animalStarve: ({gameId, userId, ownerId}) => animalStarve(gameId, userId, ownerId)
};










