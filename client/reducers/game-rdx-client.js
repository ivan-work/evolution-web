import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';
import {STATE_READY} from '~/shared/models/game/PlayerModel';

export const reducer = createReducer(null, {
  loginState: (state, {game}) => game
  , gameUpdate: (state, {game}) => game
  , gameGiveCards: (state, data) => {
    ensureParameter(data.userId, 'string');
    ensureParameter(data.cards, List);
    return state
      .update('hand', hand => hand.concat(data.cards));
  }
  , clientSelfDisconnect: (state, data) => null
});