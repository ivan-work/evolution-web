import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';
import {AnimalModel} from '~/shared/models/game/evolution/AnimalModel';

export const reducer = createReducer(null, {
  loginUserSuccess: (state, {game}) => game
  , gameCreateSuccess: (state, {game}) => game
  , gameStart: (state) => state.set('started', true)
  , gamePlayerStatusChange: (game, {userId, status}, user) => game.setIn(['players', userId, 'status'], status)
  , clientDisconnectSelf: (state, data) => null
  // Playing:
  , gameGiveCards: (game, {userId, cards}) => {
    ensureParameter(userId, 'string');
    ensureParameter(cards, List);
    return game
      .updateIn(['players', userId, 'hand'], hand => hand.concat(cards))
      .update('deck', deck => deck - cards.size);
  }
  , gamePlayAnimal: (game, {userId, animal, animalPosition, cardPosition}, currentUserId) => {
    ensureParameter(userId, 'string');
    ensureParameter(animal, AnimalModel);
    ensureParameter(cardPosition, 'number');
    ensureParameter(animalPosition, 'number');
    return game
      .removeIn(['players', userId, 'hand', cardPosition])
      .updateIn(['players', userId, 'continent'], continent => continent.insert(animalPosition, animal))
  }
});