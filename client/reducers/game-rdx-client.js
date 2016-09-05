import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';
import {STATE_READY} from '~/shared/models/game/PlayerModel';

export const reducer = createReducer(null, {
  gameUpdate: (state, data) => {
    ensureParameter(data.userId, 'string');
    ensureParameter(data.game, GameModel);
    return GameModelClient.fromGameModel(data.game, data.userId);
  }
  , gameGiveCards: (state, data) => {
    ensureParameter(data.userId, 'string');
    ensureParameter(data.cards, List);
    return state
      .update('hand', hand => hand.concat(data.cards));
  }
  , clientSelfDisconnect: (state, data) => null
});