import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';
import {AnimalModel} from '~/shared/models/game/evolution/AnimalModel';

import {
  gameStart
  , gamePlayerReadyChange
  , gameGiveCards
  , gameNextPlayer
  , gameDeployAnimal
  , gameDeployTrait
  , gameEndTurn
  , gameEnd
  , gamePlayerLeft
  , gameStartEat
  , gameStartDeploy
  , playerActed
  , traitMoveFood
  , startCooldown
  , traitKillAnimal
  , animalStarve
} from '../../server/reducers/games-rdx-server';

export const reducer = createReducer(null, {
  loginUserSuccess: (state, {game}) => game
  , gameCreateSuccess: (state, {game}) => game
  //, roomExitSuccess: (state, {userId}, currentUserId) => userId === currentUserId ? state : null //TODO do something
  , clientDisconnectSelf: (state, data) => null
  , gameStart
  , gamePlayerReadyChange
  , gameGiveCards
  , gameNextPlayer
  , gameDeployAnimal
  , gameDeployTrait
  , gameEndTurn
  , gameEnd
  , gamePlayerLeft: (game) => null
  , gamePlayerLeftNotification: gamePlayerLeft
  , gameStartEat
  , gameStartDeploy
  , playerActed
  , traitMoveFood
  , startCooldown
  , traitKillAnimal
  , animalStarve
});