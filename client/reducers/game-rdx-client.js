import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';
import {AnimalModel} from '~/shared/models/game/evolution/AnimalModel';

import {
  gameStart
  , gamePlayerReadyChange
  , gameGiveCards
  , gameNextPlayer
  , gameAddTurnTimeout
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
  , traitDefenceQuestion
  , traitDefenceAnswerSuccess
  , gameAnimalStarve
  , traitAnimalPoisoned
  , traitAnimalRemoveTrait
  , traitGrazeFood
  , traitConvertFat
  , traitSetAnimalFlag
  , traitNotify_Start
  , traitTakeShell
} from '../../server/reducers/games-rdx-server';

export const reducer = createReducer(null, {
  gameInit: (state, {game}) => game
  , gameCreateSuccess: (state, {game}) => game
  , roomExitSelf: (state) => null
  , gameStart
  , gamePlayerReadyChange
  , gameGiveCards
  , gameNextPlayer
  , gameAddTurnTimeout
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
  , traitDefenceQuestion
  , traitDefenceAnswerSuccess
  , gameAnimalStarve
  , traitAnimalPoisoned
  , traitAnimalRemoveTrait
  , traitGrazeFood
  , traitConvertFat
  , traitSetAnimalFlag
  , traitNotify_Start
  , traitTakeShell
});