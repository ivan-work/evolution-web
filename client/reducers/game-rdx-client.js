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
  , gameDeployPlantTraits
  , gameDeployRegeneratedAnimal
  , gameEndTurn
  , gamePlayerLeft
  , gameStartTurn
  , gameStartPhase
  , gameSetUserTimedOut
  , gameSetUserWantsPause
  , gameSetPaused
  , gameSpawnPlants
  , gameDeployPlant
  , traitAmbushActivate
  , gameAmbushPrepareStart
  , gameAmbushPrepareEnd
  , gameAmbushAttackStart
  , gameAmbushAttackEnd
  , gameAmbushSetAmbushers
  , gamePlantUpdateFood
  , playerActed
  , animalDeath
  , plantDeath
  , traitMoveFood
  , startCooldown
  , traitQuestion
  , traitAnswerSuccess
  , traitAnimalRemoveTrait
  , traitAnimalAttachTrait
  , traitAttachToPlant
  , traitDetachFromPlant
  , traitGrazeFood
  , traitParalyze
  , traitConvertFat
  , traitSetAnimalFlag
  , traitSetValue
  , traitNotify_Start
  , traitTakeShell
  , traitTakeCover
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
  , gameDeployPlantTraits
  , gameDeployRegeneratedAnimal
  , gameEndTurn
  , gamePlayerLeft
  , gameStartTurn
  , gameStartPhase
  , gameSetUserTimedOut
  , gameSetUserWantsPause
  , gameSetPaused
  , gameSpawnPlants
  , gameDeployPlant
  , traitAmbushActivate
  , gameAmbushPrepareStart
  , gameAmbushPrepareEnd
  , gameAmbushAttackStart
  , gameAmbushAttackEnd
  , gameAmbushSetAmbushers
  , gamePlantUpdateFood
  , playerActed
  , animalDeath
  , plantDeath
  , traitMoveFood
  , startCooldown
  , traitQuestion
  , traitAnswerSuccess
  , traitAnimalRemoveTrait
  , traitAnimalAttachTrait
  , traitAttachToPlant
  , traitDetachFromPlant
  , traitGrazeFood
  , traitParalyze
  , traitConvertFat
  , traitSetAnimalFlag
  , traitSetValue
  , traitNotify_Start
  , traitTakeShell
  , traitTakeCover
  , debugMirrorPlayer: (game, {limit = 100}) => {
    const player = game.players.first();
    const updateId = id => id + '' + game.players.size;
    const newPlayer = player
      .update('id', updateId)
      .update('continent', continent =>
        continent
          .take(limit)
          .mapKeys(updateId)
          .map(animal =>
            animal
              .update('id', updateId)
              .update('ownerId', updateId)
              .update('traits', traits =>
                traits
                  .mapKeys(updateId)
                  .map(trait =>
                    trait
                      .update('id', updateId)
                      .update('ownerId', updateId)
                      .update('linkId', updateId)
                      .update('hostAnimalId', updateId)
                      .update('linkAnimalId', updateId)
                  )
              )
          )
      );
    return game.setIn(['players', newPlayer.id], newPlayer);
  }
});