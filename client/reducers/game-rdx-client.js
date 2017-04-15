import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';
import {AnimalModel} from '~/shared/models/game/evolution/AnimalModel';

import {
  gameStart
  , gameGiveCards
  , gameNextPlayer
  , gameAddTurnTimeout
  , gameDeployAnimalFromHand
  , gameDeployAnimalFromDeck
  , gameDeployTrait
  , gameEndTurn
  , gameEnd
  , gamePlayerLeft
  , gameStartDeploy
  , gameStartEat
  , gameStartExtinct
  , playerActed
  , traitMoveFood
  , startCooldown
  , traitKillAnimal
  , traitQuestion
  , traitAnswerSuccess
  , gameAnimalStarve
  , traitAnimalPoisoned
  , traitAnimalRemoveTrait
  , traitAnimalAttachTrait
  , traitGrazeFood
  , traitConvertFat
  , traitSetAnimalFlag
  , traitSetValue
  , traitNotify_Start
  , traitTakeShell
} from '../../server/reducers/games-rdx-server';

export const reducer = createReducer(null, {
  gameInit: (state, {game}) => game
  , gameCreateSuccess: (state, {game}) => game
  , roomExitSelf: (state) => null
  , gameStart
  , gameGiveCards
  , gameNextPlayer
  , gameAddTurnTimeout
  , gameDeployAnimalFromHand
  , gameDeployAnimalFromDeck
  , gameDeployTrait
  , gameEndTurn
  , gameEnd
  , gamePlayerLeft
  , gameStartDeploy
  , gameStartEat
  , gameStartExtinct
  , playerActed
  , traitMoveFood
  , startCooldown
  , traitKillAnimal
  , traitQuestion
  , traitAnswerSuccess
  , gameAnimalStarve
  , traitAnimalPoisoned
  , traitAnimalRemoveTrait
  , traitAnimalAttachTrait
  , traitGrazeFood
  , traitConvertFat
  , traitSetAnimalFlag
  , traitSetValue
  , traitNotify_Start
  , traitTakeShell
});