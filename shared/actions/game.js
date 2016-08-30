import {GameModel, GameModelClient} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {push} from 'react-router-redux';
import {List} from 'immutable';
import {actionError} from './generic';

export const gameStartRequest = (roomId) => ({
  type: 'gameStartRequest'
  , data: {roomId}
  , meta: {server: true}
});

export const gameStartSuccess = (game) => ({
  type: 'gameStartSuccess'
  , data: {game: game}
  //, meta: {users: game.players.keySeq().toArray()}
});

export const gameReadyRequest = () => (dispatch, getState) => dispatch({
  type: 'gameReadyRequest'
  , data: {gameId: getState().get('game').id}
  , meta: {server: true}
});


export const gameReadySuccess = (game, userId) => ({
  type: 'gameReadySuccess'
  , data: {userId, gameId: game.id}
});

export const gameGiveCards = (gameId, userId, cards) => ({
  type: 'gameGiveCards'
  , data: {gameId, userId, cards}
  //, meta: {userId}
});

export const gameUpdate = (game, redirect = false) => (dispatch, getState) => {
  game.players.forEach((player) => {
    dispatch({
      type: 'gameUpdate'
      , data: {game: game.toClient(player.id), redirect}
      , meta: {userId: player.id}
    });
  });
};

export const gameUpdate_Client = (game, userId) => ({
  type: 'gameUpdate',
  data: {userId, game: GameModel.fromServer(game)}
});

export const gameClientToServer = {
  gameStartRequest: (data, meta) => (dispatch, getState) => {
    const state = getState();
    const userId = meta.user.id;
    const roomId = data.roomId;
    const room = state.getIn(['rooms', roomId]);
    const validation = room.validateCanStart(userId);
    if (validation === true) {
      const game = GameModel.new(room);
      dispatch(gameStartSuccess(game));
      dispatch(gameUpdate(game, true));
    } else {
      dispatch(actionError(userId, validation));
    }
  }
  , gameReadyRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const gameId = data.gameId;
    const selectGame = () => getState().getIn(['games', gameId]);
    dispatch(gameReadySuccess(selectGame(), userId));
    /*
     * Actual starting
     * */
    if (getState().getIn(['games', gameId]).players.every(player => player.status > 0)) {
      const INITIAL_HAND_SIZE = 6;
      selectGame().players.forEach((player) => {
        const cards = selectGame().deck.take(INITIAL_HAND_SIZE);
        dispatch(gameGiveCards(gameId, player.id, cards));
      });
    }
    dispatch(gameUpdate(selectGame()));
  }
};

export const gameServerToClient = {
  gameUpdate: (data, user) => (dispatch) => {
    dispatch(gameUpdate_Client(data.game, user.id));
    if (data.redirect) {
      dispatch(push('/game'));
    }
  }
};