import {createReducer} from '~/shared/utils';
import {STATE_READY} from '~/shared/models/game/PlayerModel';

export const reducer = createReducer(null, {
  gameStartSuccess: (state, data) => data.game
  , gameReadySuccess: (state, data) => state.setIn(['players', data.userId, 'status'], STATE_READY)
  , gameGiveCards: (state, data) => {
    return state.updateIn([data.gameId, 'deck'], deck => deck.slice(0, 6))
  }
});