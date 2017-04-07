import {Map, List} from 'immutable';
import {createReducer} from '~/shared/utils';
import {STATE_READY} from '~/shared/models/game/PlayerModel';

export const reducer = createReducer(Map(), {
  gameStartSuccess: (state, data) => state.set(data.game.id, data.game)
  , gameReadySuccess: (state, data) => state.setIn([data.gameId, 'players', data.userId, 'status'], STATE_READY)
  , gameGiveCards: (state, data) => {
    return state.updateIn([data.gameId, 'deck'], deck => deck.slice(0, 6))
  }
});