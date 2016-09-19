import {List} from 'immutable';

import {STATUS} from '../models/UserModel';

import {GameModel, GameModelClient} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';

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
 * Play!
 * */

export const gamePlayCard = (cardId, cardPosition, animalPosition) => (dispatch, getState) =>dispatch({
  type: 'gamePlayCard'
  , data: {gameId: getState().get('game').id, cardId, cardPosition, animalPosition}
  , meta: {server: true}
});

export const gamePlayAnimal = (gameId, userId, animal, animalPosition, cardPosition) => ({
  type: 'gamePlayAnimal'
  , data: {gameId, userId, animal, animalPosition, cardPosition}
});

export const server$gamePlayAnimal = (gameId, userId, animal, cardPosition, animalPosition) => (dispatch, getState) => {
  dispatch(Object.assign(
    gamePlayAnimal(gameId, userId, animal, cardPosition, animalPosition)
    , {meta: {userId}}
  ));
  dispatch(Object.assign(
    gamePlayAnimal(gameId, userId, animal.toOthers(), cardPosition, animalPosition)
    , {meta: {clientOnly: true, users: selectPlayers(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

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
  , gamePlayCard: ({gameId, cardId, cardPosition, animalPosition}, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const game = selectGame(getState, gameId);
    // TODO check if user has card
    const card = game().players.get(user.id).hand.find(card => card.id === cardId);
    console.log('gamePlayCard', card)
    if (card) {
      const animal = AnimalModel.new(card);
      dispatch(server$gamePlayAnimal(gameId, userId, animal, cardPosition, animalPosition))
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
  , gamePlayAnimal: ({gameId, userId, animal, cardPosition, animalPosition}) =>
    gamePlayAnimal(gameId, userId, AnimalModel.fromServer(animal), cardPosition, animalPosition)

};