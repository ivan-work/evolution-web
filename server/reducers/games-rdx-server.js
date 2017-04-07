import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter} from '~/shared/utils';
import {Map, List} from 'immutable';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';
import {GameModel, PHASE} from '../../shared/models/game/GameModel';

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => state.set(game.id, game)
  , gameStart: (state, {gameId}) => state
    .setIn([gameId, 'started'], true)
    .setIn([gameId, 'status', 'phase'], PHASE.DEPLOY)
  , roomExitSuccess: (state, {roomId, userId}) => {
    let game = state.find(game => game.roomId === roomId);
    if (!game) return state;
    const updGame = game.leave(userId);
    return !updGame
      ? state.remove(game.id)
      : state.set(game.id, updGame);
  }
  , gamePlayerStatusChange: (state, {gameId, userId, status}) =>
    state.setIn([gameId, 'players', userId, 'status'], status)
  , gameGiveCards: (state, {gameId, userId, cards}) => {
    ensureParameter(gameId, 'string');
    ensureParameter(userId, 'string');
    ensureParameter(cards, List);
    return state.update(gameId, game => game
      .update('deck', deck => deck.skip(cards.size))
      .updateIn(['players', userId, 'hand'], hand => hand.concat(cards))
    );
  }
  , gameNextPlayer: (state, {gameId}) => {
    const currentPlayerIndex = state.getIn([gameId, 'status', 'player']);
    const totalPlayers = state.getIn([gameId, 'players']).size;
    return currentPlayerIndex + 1 < totalPlayers
      ? state.setIn([gameId, 'status', 'player'], currentPlayerIndex + 1)
      : state
      .updateIn([gameId, 'status', 'round'], round => round + 1)
      .setIn([gameId, 'status', 'player'], 0);

  }
  , gamePlayAnimal: (state, {gameId, userId, animal, animalPosition, cardPosition}, currentUserId) => {
    ensureParameter(gameId, 'string');
    ensureParameter(userId, 'string');
    ensureParameter(animal, AnimalModel);
    ensureParameter(cardPosition, 'number');
    ensureParameter(animalPosition, 'number');
    return state.update(gameId, game => game
      .removeIn(['players', userId, 'hand', cardPosition])
      .updateIn(['players', userId, 'continent'], continent => continent.insert(animalPosition, animal)))
  }
});