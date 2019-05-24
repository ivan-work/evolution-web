import logger from '~/shared/utils/logger';
import {List} from 'immutable';

import {selectGame} from "../selectors";
import {server$game} from "./generic";
import PlantModel from "../models/game/evolution/plantarium/PlantModel";
import {
  checkGameDefined,
  checkGameHasPlant,
  checkGameHasUser,
  checkGamePhase,
  checkPlayerCanAct,
  checkPlayerHasAnimal, throwError
} from "./checks";
import {ActionCheckError} from "../models/ActionCheckError";
import {PHASE} from "../models/game/GameModel";
import {getErrorOfAnimalEatingFromGame} from "./trait.checks";
import {TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_LINK, TRAIT_COOLDOWN_PLACE} from "../models/game/evolution/constants";
import * as tt from "../models/game/evolution/traitTypes";
import {
  gameFoodTake_End,
  gameFoodTake_Start,
  getFeedingCooldownList,
  server$autoFoodSharing, server$gameAmbushPrepareStart, server$startCooldownList, server$startFeeding,
  server$startFeedingFromGame,
  server$takeFoodRequest,
  startCooldown
} from "./trait";
import {server$playerActed} from "./game";

// region game
export const gameSpawnPlants = (gameId, plants) => ({
  type: 'gameSpawnPlants'
  , data: {gameId, plants}
});

export const server$gameSpawnPlants = (gameId, count) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const plants = game.pdeck.take(count).map(PlantModel.new);
  dispatch(server$game(gameId, gameSpawnPlants(gameId, plants)));
};
export const gameDeployPlant = (gameId, plant) => ({
  type: 'gameDeployPlant'
  , data: {gameId, plant}
});

export const server$gameDeployPlant = (gameId, plant) => server$game(gameId, gameDeployPlant(gameId, plant));
//endregion

// region animal
// endregion

export const plantsClientToServer = {
  animalTakePlantFoodRequest: ({gameId, animalId, plantId}, {userId}) => (dispatch, getState) => {
  }
};

export const plantsServerToClient = {
  gameSpawnPlants: ({gameId, plants}) => gameSpawnPlants(gameId, List(plants).map(PlantModel.fromJS))
  , gameDeployPlant: ({gameId, plant}) => gameDeployPlant(gameId, PlantModel.fromJS(plant))
//   gameInit: ({game, userId}, currentUserId) => (dispatch) => {
//     dispatch(gameInit(GameModelClient.fromServer(game, userId)));
//     redirectTo('/room');
//   }
//   , gameCreateSuccess: (({game}, currentUserId) => (dispatch) => {
//     dispatch(gameCreateSuccess(GameModelClient.fromServer(game, currentUserId)));
//     redirectTo('/room');
//   })
//   , gameCreateNotify: ({roomId, gameId}) => gameCreateNotify(roomId, gameId)
//   , gameStart: ({gameId}) => gameStart(gameId)
//   , gameStartTurn: ({gameId}) => gameStartTurn(gameId)
//   , gameStartPhase: ({gameId, phase, timestamp, data}) => gameStartPhase(gameId, phase, timestamp, data)
//   , gameGiveCards: ({gameId, userId, cards}) =>
//     gameGiveCards(gameId, userId, List(cards).map(card => CardModel.fromServer(card)))
//   , gameDeployAnimalFromHand: ({gameId, userId, animal, animalPosition, cardId}) =>
//     gameDeployAnimalFromHand(gameId, userId, AnimalModel.fromServer(animal), animalPosition, cardId)
//   , gameDeployAnimalFromDeck: ({gameId, animal, sourceAid}) =>
//     gameDeployAnimalFromDeck(gameId, AnimalModel.fromServer(animal), sourceAid)
//   , gameDeployTrait: ({gameId, cardId, traits}) =>
//     gameDeployTrait(gameId, cardId, traits.map(trait => TraitModel.fromServer(trait)))
//   , gameDeployRegeneratedAnimal: ({gameId, userId, cardId, animalId, source}) =>
//     gameDeployRegeneratedAnimal(gameId, userId, cardId, animalId, source)
//   , gameAddTurnTimeout: ({gameId, turnStartTime, turnDuration}) =>
//     gameAddTurnTimeout(gameId, turnStartTime, turnDuration)
//   , gameNextRound: ({gameId}) => gameNextRound(gameId)
//   , gameNextPlayer: ({gameId, playerId}, userId) => (dispatch, getState) => {
//     const game = getState().get('game');
//     const previousPlayerId = game.status.currentPlayer;
//     if (previousPlayerId !== userId && playerId === userId) dispatch(appPlaySound('NOTIFICATION'));
//     dispatch(gameNextPlayer(gameId, playerId))
//   }
//   , playerActed: ({gameId, userId}) => playerActed(gameId, userId)
//   , gameEndTurn: ({gameId, userId}) => gameEndTurn(gameId, userId)
//   , gameEnd: ({gameId, game}, currentUserId) => gameEnd(gameId, GameModelClient.fromServer(game, currentUserId))
//   , gamePlayerLeft: ({gameId, userId}) => gamePlayerLeft(gameId, userId)
//   , gameSetUserTimedOut: ({gameId, playerId, timedOut}) => gameSetUserTimedOut(gameId, playerId, timedOut)
//   , gameSetUserWantsPause: ({gameId, userId, wantsPause}) => gameSetUserWantsPause(gameId, userId, wantsPause)
//   , gameSetPaused: ({gameId, paused}) => gameSetPaused(gameId, paused)
//   , animalDeath: ({gameId, type, animalId, data}) =>
//     animalDeath(gameId, type, animalId, data)
};







