import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';

export const reducer = createReducer(null, {
  loginUserSuccess: (state, {game}) => game
  , gameCreateSuccess: (state, {game}) => game
  , gamePlayerStatusChange: (game, {userId, status}) => game.setIn(['players', userId, 'status'], status)
  , gameGiveCards: (game, {userId, cards}) => {
    ensureParameter(userId, 'string');
    ensureParameter(cards, List);
    return game
      .update('hand', hand => hand.concat(cards))
      .updateIn(['players', userId, 'hand'], hand => hand.concat(cards))
      .update('deck', deck => deck - cards.size);
  }
  , gameGiveCardsNotify: (game, {userId, count}) => {
    ensureParameter(userId, 'string');
    ensureParameter(count, 'number');
    return game
      .updateIn(['players', userId, 'hand'], hand => hand + count)
      .update('deck', deck => deck - count);
  }
  , clientDisconnectSelf: (state, data) => null
});