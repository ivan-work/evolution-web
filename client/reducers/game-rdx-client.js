import {createReducer, ensureParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, GameModelClient} from '~/shared/models/game/GameModel';
import {AnimalModel} from '~/shared/models/game/evolution/AnimalModel';

import {
  gameStart
  , gameGiveCards
  , gameNextRound
  , gameNextPlayer
  , gameAddTurnTimeout
  , gameDeployAnimalFromHand
  , gameDeployAnimalFromDeck
  , gameDeployTrait
  , gameDeployRegeneratedAnimal
  , gameEndTurn
  , gamePlayerLeft
  , gameStartTurn
  , gameStartPhase
  , gameSetUserTimedOut
  , gameSetUserWantsPause
  , gameSetPaused
  , traitAmbushActivate
  , gameAmbushPrepareStart
  , gameAmbushPrepareEnd
  , gameAmbushAttackStart
  , gameAmbushAttackEnd
  , playerActed
  , animalDeath
  , traitMoveFood
  , startCooldown
  , traitQuestion
  , traitAnswerSuccess
  , traitAnimalRemoveTrait
  , traitAnimalAttachTrait
  , traitGrazeFood
  , traitParalyze
  , traitConvertFat
  , traitSetAnimalFlag
  , traitSetValue
  , traitNotify_Start
  , traitTakeShell
} from '../../server/reducers/games-rdx-server';

export const reducer = createReducer(null, {
  gameInit: (state, {game}) => game
  , gameCreateSuccess: (state, {game}) => game
  , gameEnd: (state, {game}) => game
  , roomExitSelf: (state) => null
  , gameStart
  , gameGiveCards
  , gameNextRound
  , gameNextPlayer
  , gameAddTurnTimeout
  , gameDeployAnimalFromHand
  , gameDeployAnimalFromDeck
  , gameDeployTrait
  , gameDeployRegeneratedAnimal
  , gameEndTurn
  , gamePlayerLeft
  , gameStartTurn
  , gameStartPhase
  , gameSetUserTimedOut
  , gameSetUserWantsPause
  , gameSetPaused
  , traitAmbushActivate
  , gameAmbushPrepareStart
  , gameAmbushPrepareEnd
  , gameAmbushAttackStart
  , gameAmbushAttackEnd
  , playerActed
  , animalDeath
  , traitMoveFood
  , startCooldown
  , traitQuestion
  , traitAnswerSuccess
  , traitAnimalRemoveTrait
  , traitAnimalAttachTrait
  , traitGrazeFood
  , traitParalyze
  , traitConvertFat
  , traitSetAnimalFlag
  , traitSetValue
  , traitNotify_Start
  , traitTakeShell
});