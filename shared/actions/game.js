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
  , data: {game}
  , meta: {users: game.players.keySeq().toArray()}
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

export const gameGiveCards = (game, cardsCount) => (dispatch, getState) => {
  const cards = game.deck.take(6);
  dispatch({
    type: 'gameGiveCards'
    , data: {gameId: game.id, cards}
    , meta: {users: game.players.keySeq().toArray()}
  });
};

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
    const state = getState();
    const userId = meta.user.id;
    const gameId = data.gameId;
    const game = state.getIn(['games', gameId]);
    dispatch(gameReadySuccess(game, userId));
    if (getState().getIn(['games', gameId]).players.every(player => player.status > 0)) {
      dispatch(gameGiveCards(game, 6));
    }
  }
};

export const gameServerToClient = {
  gameStartSuccess: (data) => gameStartSuccess(GameModel.fromJS(data.game))
  , gameReadySuccess: (data, user) => ({
    type: 'gameReadySuccess'
    , data: {userId: user.id}
  })
  , gameGiveCards: (data, user) => ({
    type: 'gameGiveCards'
    , data: {userId: user.id, cards: data.cards.map(card => CardModel.fromJS(card))}
  })
};