import {createReducer, ensureParameter} from '~/shared/utils';
import {Map, List} from 'immutable';
import {STATE_READY} from '~/shared/models/game/PlayerModel';

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => {
    console.log('gameCreateSuccess')
    return state.set(game.id, game)}
  , gamePlayerStatusChange: (state, {gameId, userId, status}) => state.setIn([gameId, 'players', userId, 'status'], status)
  , gameGiveCards: (state, {gameId, userId, cards}) => {
    ensureParameter(gameId, 'string');
    ensureParameter(userId, 'string');
    ensureParameter(cards, List);
    return state.update(gameId, game => game
      .update('deck', deck => deck.skip(cards.size))
      .updateIn(['players', userId, 'hand'], hand => hand.concat(cards))
    );
  }
});