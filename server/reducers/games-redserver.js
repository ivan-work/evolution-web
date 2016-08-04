import {createReducer, ensureParameter} from '~/shared/utils';
import {Map, List} from 'immutable';
import {STATE_READY} from '~/shared/models/game/PlayerModel';

export const reducer = createReducer(Map(), {
  gameStartSuccess: (state, data) => state.set(data.game.id, data.game)
  , gameReadySuccess: (state, data) => state.setIn([data.gameId, 'players', data.userId, 'status'], STATE_READY)
  , gameGiveCards: (state, data) => {
    ensureParameter(data.gameId, 'string');
    ensureParameter(data.userId, 'string');
    ensureParameter(data.cards, List);
    return state.update(data.gameId, game =>game
      .update('deck', deck => deck.slice(0, data.cards.size))
      .updateIn(['players', data.userId, 'hand'], hand => hand.concat(data.cards))
    );
  }
  , gameUpdate: (state, data) => {
    return state.merge(data.game.id, data.game)
  }
});