import {createReducer, ensureParameter} from '~/shared/utils';
import {List} from 'immutable';
import {STATE_READY} from '~/shared/models/game/PlayerModel';

export const reducer = createReducer(null, {
  gameStartSuccess: (state, data) => data.game
  , gameReadySuccess: (state, data) => state.setIn(['players', data.userId, 'status'], STATE_READY)
  , gameGiveCards: (state, data) => {
    ensureParameter(data.userId, 'string');
    ensureParameter(data.cards, List);
    return state
      .update('deck', deck => deck.slice(0, data.cards.size))
      .updateIn(['players', data.userId, 'hand'], hand => hand.concat(data.cards));
  }
});