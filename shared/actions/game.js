import {GameModel} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {push} from 'react-router-redux';
import {List} from 'immutable';

export const gameStartRequest = (roomId) => ({
  type: 'gameStartRequest'
  , data: {roomId}
  , meta: {server: true}
});

export const gameStartSuccess = (game) => ({
  type: 'gameStartSuccess'
  , data: {game: game}
});

export const gameReadyRequest = () => (dispatch, getState) => dispatch({
  type: 'gameReadyRequest'
  , data: {gameId: getState().get('game').id}
  , meta: {server: true}
});


export const gameReadySuccess = (game, userId) => ({
  type: 'gameReadySuccess'
  , data: {userId, gameId: game.id}
  , meta: {users: game.players.keySeq().toArray()}
});

export const gameGiveCards = (gameId, userId, cards) => ({
  type: 'gameGiveCards'
  , data: {gameId, userId, cards}
  , meta: {userId}
});

export const gameUpdate = (game) => ({
  type: 'gameUpdate'
  , data: {game : game.toClient()}
  , meta: {users: game.players.keySeq().toArray()}
});

export const gameClientToServer = {
  gameStartRequest: (data, meta) => (dispatch, getState) => {
    const state = getState();
    const userId = meta.user.id;
    const roomId = data.roomId;
    const room = state.getIn(['rooms', roomId]);
    if (room.canStart(userId)) {
      dispatch(gameStartSuccess(GameModel.new(room)));
    }
  }
  , gameReadyRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const gameId = data.gameId;
    const game = () => getState().getIn(['games', gameId]);
    dispatch(gameReadySuccess(getState().getIn(['games', gameId]), userId));
    /*
     * Actual starting
     * */
    if (getState().getIn(['games', gameId]).players.every(player => player.status > 0)) {
      const INITIAL_HAND_SIZE = 6;
      getState().getIn(['games', gameId]).players.forEach((player) => {
        const cards = game().deck.take(INITIAL_HAND_SIZE);
        dispatch(gameGiveCards(gameId, player.id, cards));
      });
    }
    dispatch(gameUpdate(game()));
  }
};

export const gameServerToClient = {
  gameStartSuccess: (data) => gameStartSuccess(GameModel.fromServer(data.game))
  , gameReadySuccess: (data, user) => ({
    type: 'gameReadySuccess'
    , data: {userId: user.id}
  })
  , gameGiveCards: (data, user) => ({
    type: 'gameGiveCards'
    , data: {
      userId: user.id
      , cards: List(data.cards).map(card => CardModel.fromJS(card))
    }
  })
};