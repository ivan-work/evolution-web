import logger, {loggerOnline} from '~/shared/utils/logger';
import {List} from 'immutable';

import ActionCheckError from '~/shared/models/ActionCheckError';
import ERRORS from "./errors";
import * as ERR from "../errors/ERR";

import {SETTINGS_TIMED_OUT_TURN_TIME} from '../models/game/GameSettings';
import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';
import * as tt from '../models/game/evolution/traitTypes';
import * as ptt from '../models/game/evolution/plantarium/plantTraitTypes';
import * as pt from '../models/game/evolution/plantarium/plantTypes';
import {
  CTT_PARAMETER
  , TRAIT_ANIMAL_FLAG
  , ANIMAL_DEATH_REASON
} from '../models/game/evolution/constants';

import {db$gameEnd} from '../../server/actions/db';

import {server$game, to$, toUser$Client} from './generic';
import {doesPlayerHasOptions, doesOptionExist, getOptions, searchPlayerOptions} from './ai';
import {
  server$questionPauseTimeout
  , server$questionResumeTimeout
  , server$autoFoodSharing
  , server$roomSelfDestructStart
  , server$activateViviparous
} from './actions';
import {appPlaySound} from '../../client/actions/app';
import {redirectTo} from '../utils/history';
import {selectGame, selectUsersInGame} from '../selectors';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasCard
  , getOrThrowPlayerAnimal
  , checkPlayerCanAct
  , checkGamePhase
  , checkValidAnimalPosition
  , throwError
} from './checks';

import {
  checkRoomMinSize
  , checkRoomMaxSize
  , checkRoomIsNotInGame
} from './rooms.checks';

import {addTimeout, cancelTimeout, checkTimeout} from '../utils/reduxTimeout';
import {parseFromRoom} from "../models/game/GameModel.parse";
import {server$gameDeployPlant, server$gameSpawnPlants} from "./game.plantarium";
import PlantModel from "../models/game/evolution/plantarium/PlantModel";
import PlantVisitor from "../models/game/evolution/plantarium/PlantsVisitor";
import ParasiteVisitor from "../models/game/evolution/plantarium/ParasiteVisitor";

// region Game
// region Init
export const gameInit = (game, userId) => ({type: 'gameInit', data: {game, userId}});

const gameStartTurn = (gameId) => ({type: 'gameStartTurn', data: {gameId}});

const gameStartPhase = (gameId, phase, timestamp, data) => ({
  type: 'gameStartPhase',
  data: {gameId, phase, timestamp, data}
});

export const server$gameStartPhase = (gameId, phase, data) => {
  logger.verbose('server$gameStartPhase:', phase, data);
  return server$game(gameId, gameStartPhase(gameId, phase, Date.now(), data));
};
// endregion

// region Game Create
const gameCreateSuccess = (game) => ({
  type: 'gameCreateSuccess'
  , data: {game}
});
const gameCreateNotify = (roomId, gameId) => ({
  type: 'gameCreateNotify'
  , data: {roomId, gameId}
});
export const server$gameCreateSuccess = (room) => (dispatch, getState) => {
  logger.debug(`server$gameCreateSuccess`);
  checkRoomMinSize(room);
  checkRoomMaxSize(room);
  checkRoomIsNotInGame(room);
  const seed = room.settings.seed;
  const game = (seed === null
    ? GameModel.new(room)
    : parseFromRoom(room, seed));
  const gameId = game.id;

  dispatch(gameCreateSuccess(game));
  dispatch(Object.assign(gameCreateNotify(game.roomId, game.id)
    , {meta: {users: true}}));
  selectUsersInGame(getState, game.id).forEach(userId => {
    dispatch(Object.assign(gameCreateSuccess(game.toOthers(userId).toClient())
      , {meta: {userId, clientOnly: true}}));
  });

  if (game.status.phase === PHASE.PREPARE) {
    dispatch(server$game(gameId, gameStart(gameId)));
    dispatch(server$gameDistributeCards(gameId));
    game.isPlantarium() && dispatch(server$gameSpawnPlants(gameId, game.getPlantsConfig().start))
  }
  dispatch(server$gamePlayerStart(gameId));
};
// endregion

// region Game Leave
export const gamePlayerLeft = (gameId, userId) => ({
  type: 'gamePlayerLeft'
  , data: {gameId, userId}
});

export const gameDestroy = (gameId) => ({
  type: 'gameDestroy'
  , data: {gameId}
});

export const server$gameLeave = (gameId, userId) => (dispatch, getState) => {
  logger.info(`server$gameLeave: ${gameId}, ${userId}`);
  dispatch(server$game(gameId, gamePlayerLeft(gameId, userId)));
  const game = selectGame(getState, gameId);
  switch (game.getActualPlayers().size) {
    case 0:
    case 1:
      if (game.status.phase !== PHASE.FINAL) dispatch(server$gameEnd(gameId, false));
      break;
    default:
      if (game.status.currentPlayer === userId) {
        dispatch(server$gameCancelTurnTimeout(gameId));
        dispatch(server$gamePlayerContinue(gameId));
      }
  }
};
// endregion

export const gameStart = (gameId) => ({
  type: 'gameStart'
  , data: {gameId}
});
// endregion

// region Cards
export const gameGiveCards = (gameId, userId, cards) => ({
  type: 'gameGiveCards'
  , data: {gameId, userId, cards}
});

export const server$gameGiveCards = (gameId, userId, count) => (dispatch, getState) => {
  logger.debug(`server$gameGiveCards/${userId}: ${count}`);
  const cards = selectGame(getState, gameId).deck.take(count);
  dispatch(gameGiveCards(gameId, userId, cards));
  dispatch(toUser$Client(userId, gameGiveCards(gameId, userId, cards.map(card => card.toClient()))));
  dispatch(to$({clientOnly: true, users: selectUsersInGame(getState, gameId).filter(uid => uid !== userId)}
    , gameGiveCards(gameId, userId, cards.map(card => card.toOthers().toClient()))));
};
// endregion

// region Pause
export const gameSetUserWantsPauseRequest = (wantsPause) => (dispatch, getState) => dispatch({
  type: 'gameSetUserWantsPauseRequest'
  , data: {gameId: getState().getIn(['game', 'id']), wantsPause}
  , meta: {server: true}
});

const gameSetUserWantsPause = (gameId, userId, wantsPause) => ({
  type: 'gameSetUserWantsPause'
  , data: {gameId, userId, wantsPause}
});

const gameSetPaused = (gameId, paused) => ({
  type: 'gameSetPaused'
  , data: {gameId, paused}
});

const server$gameCheckForPause = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (!game.status.paused) {
    if (game.getActualPlayers().every(p => p.getWantsPause())) {
      dispatch(server$game(gameId, gameSetPaused(gameId, true)));
      dispatch(server$gameCancelTurnTimeout(gameId));
      dispatch(server$questionPauseTimeout(game));
    }
  } else {
    const playersCount = game.getActualPlayers().size;
    const needToUnpause = Math.ceil(playersCount / 2);
    if (game.getActualPlayers().filter(p => !p.getWantsPause()).size > needToUnpause) {
      dispatch(server$game(gameId, gameSetPaused(gameId, false)));
      if (game.question) {
        dispatch(server$questionResumeTimeout(gameId, game.question));
      } else {
        dispatch(server$addTurnTimeout(gameId));
      }
    }
  }
};
// endregion

// region DEPLOY

// region gameDeployAnimal
export const gameDeployAnimalRequest = (cardId, animalPosition) => (dispatch, getState) => dispatch({
  type: 'gameDeployAnimalRequest'
  , data: {gameId: getState().get('game').id, cardId, animalPosition}
  , meta: {server: true}
});

const gameDeployAnimalFromHand = (gameId, userId, animal, animalPosition, cardId) => ({
  type: 'gameDeployAnimalFromHand'
  , data: {gameId, userId, animal, animalPosition, cardId}
});

export const server$gameDeployAnimalFromHand = (gameId, userId, animal, animalPosition, cardId) => (dispatch, getState) => {
  dispatch(gameDeployAnimalFromHand(gameId, userId, animal, animalPosition, cardId));
  dispatch(Object.assign(
    gameDeployAnimalFromHand(gameId, userId, animal.toClient(), animalPosition, cardId)
    , {meta: {clientOnly: true, userId}}
  ));
  dispatch(Object.assign(
    gameDeployAnimalFromHand(gameId, userId, animal.toOthers().toClient(), animalPosition, cardId)
    , {meta: {clientOnly: true, users: selectUsersInGame(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

const gameDeployAnimalFromDeck = (gameId, animal, sourceAid) => ({
  type: 'gameDeployAnimalFromDeck'
  , data: {gameId, animal, sourceAid}
});

export const server$gameDeployAnimalFromDeck = (gameId, sourceAnimal, onCreateCallback) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const userId = sourceAnimal.ownerId;
  let animal = AnimalModel.new(userId, game.deck.first() && game.deck.first().trait1);
  if (onCreateCallback) animal = onCreateCallback(animal);
  dispatch(gameDeployAnimalFromDeck(gameId, animal, sourceAnimal.id));
  dispatch(Object.assign(
    gameDeployAnimalFromDeck(gameId, animal.toClient(), sourceAnimal.id)
    , {meta: {clientOnly: true, userId}}
  ));
  dispatch(Object.assign(
    gameDeployAnimalFromDeck(gameId, animal.toOthers().toClient(), sourceAnimal.id)
    , {meta: {clientOnly: true, users: selectUsersInGame(getState, gameId).filter(uid => uid !== userId)}}
  ));
};
// endregion

// region gameDeployTrait
export const gameDeployTraitRequest = (cardId, entityId, alternateTrait, linkId) => (dispatch, getState) => dispatch({
  type: 'gameDeployTraitRequest'
  , data: {gameId: getState().get('game').id, cardId, entityId, alternateTrait, linkId}
  , meta: {server: true}
});

export const gameDeployTrait = (gameId, cardId, traits) => ({
  type: 'gameDeployTrait'
  , data: {gameId, cardId, traits}
});

export const server$gameDeployTrait = (gameId, cardId, traits) => (dispatch, getState) => {
  logger.verbose('server$gameDeployTrait:', gameId, cardId
    , ...traits.map(t => `${t.type}(${t.hostAnimalId}${t.linkAnimalId ? (`-` + t.linkAnimalId) : ''})`));
  dispatch(gameDeployTrait(gameId, cardId, traits));
  dispatch(Object.assign(
    gameDeployTrait(gameId, cardId, traits.map(trait => trait.toOthers().toClient()))
    , {meta: {clientOnly: true, users: selectUsersInGame(getState, gameId)}}
  ));
};
// endregion

// endregion

// region gameEndTurn
export const gameEndTurnRequest = () => (dispatch, getState) => dispatch({
  type: 'gameEndTurnRequest'
  , data: {gameId: getState().get('game').id}
  , meta: {server: true}
});

export const gameEndTurn = (gameId, userId) => ({
  type: 'gameEndTurn'
  , data: {gameId, userId}
});

export const server$defaultTurn = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (game.status.phase === PHASE.DEPLOY) {
    // Disabled protection from ppl who hold cards
    // if (player.continent.size === 0 && player.hand.size > 0) {
    //   const card = player.hand.first();
    //   const animal = AnimalModel.new(userId, card.trait1);
    //   dispatch(server$gameDeployAnimalFromHand(gameId, userId, animal, 0, card.id));
    //   dispatch(server$playerActed(gameId, userId));
    //   return true;
    // }
  } else if (game.status.phase === PHASE.FEEDING) {
    let mandatoryOption;
    searchPlayerOptions(game, userId, (option) => {
      if (option.mandatoryAction) {
        mandatoryOption = option;
        logger.debug('server$defaultTurn/option found:', option.text);
        return true;
      }
    });
    if (mandatoryOption) {
      mandatoryOption.mandatoryAction(dispatch, gameId, userId);
      return true;
    }
  }
};

export const server$gameEndTurn = (gameId, userId, debugSource) => (dispatch, getState) => {
  logger.debug(`game/server$gameEndTurn attempt, source: ${debugSource}`);
  if (!dispatch(server$autoFoodSharing(gameId, userId))) return;
  const isDefaultTurn = !!dispatch(server$defaultTurn(gameId, userId));
  // if isDefaultTurn is true, then player performed default turn\
  // and there's second server$gameEndTurn is coming. So we finish this one.
  if (isDefaultTurn) return;
  let game = selectGame(getState, gameId);
  const acted = selectGame(getState, gameId).getPlayer(userId).acted;
  logger.debug(`game/server$gameEndTurn: ${userId} (${game.getPlayer(userId).acted})`);

  dispatch(server$gameCancelTurnTimeout(gameId));

  // If player didn't acted, disable everything that he had chosen to skip
  if (!acted && game.status.phase === PHASE.FEEDING) {
    const options = getOptions(game, userId);
    options.forEach(option => {
      if (!option.cooldownAction) {
        logger.error(option);
      }
      dispatch(option.cooldownAction(gameId));
    });
  }

  dispatch(server$game(gameId, gameEndTurn(gameId, userId)));

  const nextPlayer = dispatch(server$gameNextPlayer(gameId, userId));
  if (nextPlayer) {
    // logger.debug(`game/server$gameEndTurn: ${userId} => ${nextPlayer}`);
    // do nothing if next player is available
  } else if (game.status.phase === PHASE.DEPLOY) {
    const food = game.generateFood();
    dispatch(server$gameStartPhase(gameId, PHASE.FEEDING, {food}));
    dispatch(server$gamePlayerStart(gameId));
  } else if (game.status.phase === PHASE.FEEDING) {
    dispatch(server$gameExtinct(gameId));
    dispatch(server$gamePhaseStartRegeneration(gameId));
  }
};
// endregion

// region gameNextPlayer
const gameNextRound = (gameId) => ({
  type: 'gameNextRound'
  , data: {gameId}
});

const gameNextPlayer = (gameId, playerId) => ({
  type: 'gameNextPlayer'
  , data: {gameId, playerId}
});
// endregion

// region Acted
const playerActed = (gameId, userId) => ({
  type: 'playerActed'
  , data: {gameId, userId}
});

export const server$playerActed = (gameId, userId, debugSource) => (dispatch, getState) => {
  logger.debug(`server$playerActed: ${userId} (${debugSource})`);
  let game = selectGame(getState, gameId);
  dispatch(server$game(gameId, playerActed(gameId, userId)));
  switch (game.status.phase) {
    case PHASE.DEPLOY:
      return dispatch(server$gameEndTurn(gameId, userId, 'server$playerActed'));
    case PHASE.FEEDING:
      game = selectGame(getState, gameId);
      const gameHasNoQuestions = !game.question;
      const playerHasNoOptions = !doesPlayerHasOptions(game, userId);
      const timeout = dispatch(checkTimeout(makeTurnTimeoutId(gameId)));
      const playerHasNoTimeouts = !timeout;
      const gameIsNotPaused = !game.status.paused;
      const gameIsNotOnHunt = !game.hunt;

      if (gameHasNoQuestions && gameIsNotOnHunt && (playerHasNoOptions || (gameIsNotPaused && playerHasNoTimeouts))) {
        return dispatch(server$gameEndTurn(gameId, userId, 'server$playerActed'));
      }
  }
};
// endregion

// region Timeout
export const makeTurnTimeoutId = (gameId) => `turnTimeTimeout#${gameId}`;

const gameAddTurnTimeout = (gameId, turnStartTime, turnDuration) => ({
  type: 'gameAddTurnTimeout'
  , data: {gameId, turnStartTime, turnDuration}
});

export const gameSetUserTimedOutRequest = () => (dispatch, getState) => dispatch({
  type: 'gameSetUserTimedOutRequest'
  , data: {gameId: getState().getIn(['game', 'id'])}
  , meta: {server: true}
});

const gameSetUserTimedOut = (gameId, playerId, timedOut) => ({
  type: 'gameSetUserTimedOut'
  , data: {gameId, playerId, timedOut}
});

const server$gameSetUserTimedOut = (gameId, userId, timedOut) => (dispatch, getState) => {
  dispatch(server$game(gameId, gameSetUserTimedOut(gameId, userId, timedOut)));
  dispatch(server$gameCheckForPause(gameId));
};

export const server$addTurnTimeout = (gameId, userId, turnTime) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (game.status.paused) return;
  if (turnTime === 0) return;

  if (!userId) userId = game.status.currentPlayer;
  if (!turnTime) {
    turnTime = !game.getPlayer(userId).timedOut ? game.settings.timeTurn : SETTINGS_TIMED_OUT_TURN_TIME;
  }
  dispatch(server$game(gameId, gameAddTurnTimeout(gameId, Date.now(), turnTime)));
  dispatch(addTimeout(turnTime, makeTurnTimeoutId(gameId, userId), (dispatch, getState) => {
    logger.info(`Turn Timeout:`, `${gameId}: ${userId}`);
    dispatch(server$gameSetUserTimedOut(gameId, userId, true));
    dispatch(server$gameEndTurn(gameId, userId, 'server$addTurnTimeout'))
  }));
};

export const server$gameCancelTurnTimeout = (gameId) => (dispatch, getState) => {
  // logger.info(`Cancel Timeout:`, `${gameId}`);
  return dispatch(cancelTimeout(makeTurnTimeoutId(gameId)));
};

// endregion

// region Player Start/Continue
export const server$gamePlayerStart = (gameId) => (dispatch, getState) => {
  logger.debug('server$gamePlayerStart');
  dispatch(server$gameNextPlayer(gameId));
};

export const server$gamePlayerContinue = (gameId, previousUserId) => (dispatch, getState) => {
  logger.debug('server$gamePlayerContinue');
  const game = selectGame(getState, gameId);
  const currentPlayerId = game.getIn(['status', 'currentPlayer']);
  const phase = game.getIn(['status', 'phase']);

  if (phase === PHASE.DEPLOY || phase === PHASE.FEEDING) {
    dispatch(server$gameNextPlayer(gameId, currentPlayerId));
  }
};

const server$gameNextPlayer = (gameId, startSearchFromId) => (dispatch, getState) => {
  logger.debug('server$gameNextPlayer search start:', startSearchFromId);
  const game = selectGame(getState, gameId);

  let nextRound = false;
  const roundPlayerId = game.getIn(['status', 'roundPlayer']);
  const currentPlayerId = game.getIn(['status', 'currentPlayer']);
  const startIndex = !!startSearchFromId
    ? (game.getPlayer(startSearchFromId).index + 1) % game.players.size
    : game.getPlayer(roundPlayerId).index;

  const nextPlayer = game.sortPlayersFromIndex(game.players, startIndex)
    .find((player) => {
      if (player.id === roundPlayerId && !!startSearchFromId) nextRound = true;

      if (!player.playing) return false;

      switch (game.status.phase) {
        case PHASE.DEPLOY:
          return !player.ended;
        case PHASE.FEEDING:
          const nextGame = game.gameNextPlayer(player.id);
          // console.log('doesOptionExist', player.id, getOptions(nextGame, player.id).map(o => o.text))
          return doesOptionExist(nextGame, player.id);
        default:
          return true;
      }
    });

  logger.debug('server$gameNextPlayer:', !!nextPlayer ? nextPlayer.id : null);
  if (nextPlayer) {
    if (nextRound) dispatch(server$game(gameId, gameNextRound(gameId)));
    dispatch(server$game(gameId, gameNextPlayer(gameId, nextPlayer.id)));
    dispatch(server$addTurnTimeout(gameId));
  }
  return !!nextPlayer;
};
// endregion

// region EXTINCT
export const animalDeath = (gameId, type, animalId, data) => ({
  type: 'animalDeath'
  , data: {gameId, type, animalId, data}
});

export const plantDeath = (gameId, plantId) => ({
  type: 'plantDeath'
  , data: {gameId, plantId}
});

export const server$animalDeath = (gameId, type, animalId, data) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const animal = game.locateAnimal(animalId);

  const viviAnimalIds = animal.getTraits()
    .filter(trait => trait.type === tt.TraitTrematode)
    .map(trait => game.locateAnimal(trait.linkAnimalId))
    .filter(possibleVivi => {
      const traitViviparous = possibleVivi.hasTrait(tt.TraitViviparous);
      return (
        traitViviparous
        && traitViviparous.getErrorOfUse(game, possibleVivi) === ERRORS.TRAIT_TARGETING_ANIMAL_SATURATED
      );
    })
    .map(viviAnimal => viviAnimal.id);

  dispatch(server$game(gameId, animalDeath(gameId, type, animalId, data)));

  const updatedGame = selectGame(getState, gameId);
  viviAnimalIds
    .forEach(viviAnimalId => {
      dispatch(server$activateViviparous(updatedGame.id, viviAnimalId));
    });
};

const server$gameExtinct = (gameId) => (dispatch, getState) => {
  dispatch(server$gameStartPhase(gameId, PHASE.EXTINCTION));
  selectGame(getState, gameId).someAnimal((animal, continent, player) => {
    if (animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED)) {
      dispatch(server$animalDeath(gameId, ANIMAL_DEATH_REASON.POISON, animal.id));
    } else if (!animal.canSurvive()) {
      dispatch(server$animalDeath(gameId, ANIMAL_DEATH_REASON.STARVE, animal.id));
    }
  });

  const game = selectGame(getState, gameId);
  const plantsVisitor = new PlantVisitor(game);
  const parasiteVisitor = new ParasiteVisitor(game);

  game.plants.forEach(plantsVisitor.visit);
  plantsVisitor.deathRow.map(plantId => game.getPlant(plantId)).forEach(parasiteVisitor.visit);
  parasiteVisitor.deathRow.forEach(plantId => dispatch(server$game(gameId, plantDeath(gameId, plantId))));
};
// endregion

// region REGENERATION
export const gameDeployRegeneratedAnimalRequest = (cardId, animalId) => (dispatch, getState) => dispatch({
  type: 'gameDeployRegeneratedAnimalRequest'
  , data: {gameId: getState().getIn(['game', 'id']), cardId, animalId}
  , meta: {server: true}
});

const gameDeployRegeneratedAnimal = (gameId, userId, cardId, animalId, source) => ({
  type: 'gameDeployRegeneratedAnimal'
  , data: {gameId, userId, cardId, animalId, source}
});

const makeRegenerationPhaseTimeoutId = (gameId) => `Phase#Regeneration#${gameId}`;

export const server$gamePhaseStartRegeneration = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (dispatch(server$gamePhaseCheckEndRegeneration(gameId))) {
    dispatch(server$gamePhaseEndRegeneration(gameId));
  } else {
    dispatch(server$gameStartPhase(gameId, PHASE.REGENERATION));
    dispatch(addTimeout(game.settings.timeTraitResponse
      , makeRegenerationPhaseTimeoutId(gameId)
      , (dispatch) => dispatch(server$gamePhaseEndRegeneration(gameId))));
  }
};

// This is an action because it require freash game from getState
export const server$gamePhaseCheckEndRegeneration = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  return !game.someAnimal((animal, continent, player) => (
    animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION) && player.hand.size > 1
  ));
};

export const server$gamePhaseEndRegeneration = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  dispatch(cancelTimeout(makeRegenerationPhaseTimeoutId(gameId)));
  game.someAnimal((animal, continent) => { // Not using incoming player game is immutable.
    if (animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) {
      const game = selectGame(getState, gameId);
      const player = game.getPlayer(animal.ownerId);
      if (player.hand.size > 0) {
        dispatch(server$game(gameId, gameDeployRegeneratedAnimal(gameId, player.id, player.hand.first().id, animal.id, 'HAND')));
      } else if (game.deck.size > 0) {
        dispatch(server$game(gameId, gameDeployRegeneratedAnimal(gameId, player.id, game.deck.first().id, animal.id, 'DECK')));
      }
    }
  });

  if (selectGame(getState, gameId).deck.size > 0) {
    dispatch(server$game(gameId, gameStartTurn(gameId)));
    dispatch(server$gameDistributeCards(gameId));
    dispatch(server$gameDistributeAnimals(gameId));
    dispatch(server$gameStartPhase(gameId, PHASE.DEPLOY));
    if (game.isPlantarium()) {
      dispatch(server$gameSpawnPlants(gameId, game.getPlantsCountForSpawn()));
    }
    dispatch(server$gamePlayerStart(gameId));
  } else {
    dispatch(server$gameEnd(gameId, true));
  }
};
// endregion

// region AFTERTURN
const server$gameDistributeCards = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const playersWantedCards = {};
  const playersGiveCards = {};
  let deckSize = game.deck.size;

  // Calculating what players want
  game.getActualPlayers().forEach((player) => {
    playersWantedCards[player.id] = 1;
    if (player.continent.size === 0 && player.hand.size === 0) {
      playersWantedCards[player.id] = game.getStartingHandCount();
    } else {
      player.someAnimal((animal) => {
        if (!animal.hasTrait(tt.TraitRstrategy) && !animal.flags.has(TRAIT_ANIMAL_FLAG.REGENERATION)) {
          playersWantedCards[player.id] += 1;
        }
      });
    }
  });

  // Calculating what they'll get
  const players = game.sortPlayersFromIndex(game.players);
  while (deckSize > 0 && Object.keys(playersWantedCards).length > 0) {
    players.some((player) => {
      if (!playersGiveCards[player.id]) playersGiveCards[player.id] = 0;
      if (deckSize <= 0) return;
      if (playersWantedCards[player.id] > 0) {
        playersWantedCards[player.id] -= 1;
        deckSize--;
        playersGiveCards[player.id] += 1;
      } else {
        delete playersWantedCards[player.id];
      }
    });
  }

  // Finally giving them what they deserve
  Object.keys(playersGiveCards)
    .sort((p1, p2) => game.getPlayer(p1).index - game.getPlayer(p2).index)
    .forEach((playerId) => {
      dispatch(server$gameGiveCards(gameId, playerId, playersGiveCards[playerId]));
    });
};

const server$gameDistributeAnimals = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  let deckSize = game.deck.size;
  const playerStacks = {};

  game.players.forEach((player) => {
    playerStacks[player.id] = [];
    player.someAnimal((animal) => {
      if (animal.hasTrait(tt.TraitRstrategy) && !animal.flags.has(TRAIT_ANIMAL_FLAG.REGENERATION)) {
        playerStacks[player.id].push(server$gameDeployAnimalFromDeck(gameId, animal));
        playerStacks[player.id].push(server$gameDeployAnimalFromDeck(gameId, animal));
      }
    });
  });
  const players = game.sortPlayersFromIndex(game.players);
  while (deckSize > 0 && Object.keys(playerStacks).length > 0) {
    players.some((player) => {
      const playerStack = playerStacks[player.id];
      if (deckSize <= 0) return true;
      if (!playerStack) return;
      if (playerStack.length > 0) {
        deckSize--;
        dispatch(playerStack.shift());
      } else {
        delete playerStacks[player.id]
      }
    });
  }
};

// const server$gameGrowPlants = (gameId) => server$game(gameId, gameGrowPlants(gameId));

// endregion

// region WIN!
const gameEnd = (gameId, game) => ({
  type: 'gameEnd'
  , data: {gameId, game}
});

const client$gameEnd = (gameId) => (dispatch, getState) =>
  dispatch(to$({clientOnly: true, users: selectUsersInGame(getState, gameId)}
    , gameEnd(gameId, selectGame(getState, gameId).toClient())));

export const server$gameEnd = (gameId, finished) => (dispatch, getState) => {
  logger.debug('server$gameEnd', gameId, finished);
  dispatch(server$gameCancelTurnTimeout(gameId));

  const game = selectGame(getState, gameId);

  dispatch(gameEnd(gameId, game));
  dispatch(client$gameEnd(gameId));

  dispatch(server$roomSelfDestructStart(game.roomId, selectGame(getState, gameId).winnerId));

  const gameStats = selectGame(getState, gameId).toDatabase(getState, finished);
  db$gameEnd(gameStats);

  loggerOnline.info(`Game ${finished ? 'finished' : 'exited'} ${game.players.map(p => getState().getIn(['users', p.id, 'login'])).join(', ')}`);
};
// endregion

export const gameClientToServer = {
  gameEndTurnRequest: ({gameId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerCanAct(game, userId);
    if (game.status.phase !== PHASE.FEEDING && game.status.phase !== PHASE.DEPLOY) {
      throw new ActionCheckError(ERR.GAME_PHASE, {
        gameId
        , phase: game.status.phase
        , targetPhase: `${PHASE.FEEDING}/${PHASE.DEPLOY}`
      });
    }
    logger.verbose(`gameEndTurnRequest: ${userId} (${game.getPlayer(userId).acted})`);
    dispatch(server$gameEndTurn(gameId, userId, 'gameEndTurnRequest'));
  }
  , gameDeployAnimalRequest: ({gameId, cardId, animalPosition = 0}, {userId}) => (dispatch, getState) => {
    // console.time('gameDeployAnimalRequest body');
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.DEPLOY);
    checkPlayerCanAct(game, userId);
    checkValidAnimalPosition(game, userId, animalPosition);
    const card = checkPlayerHasCard(game, userId, cardId);
    const animal = AnimalModel.new(userId, card.trait1);
    logger.verbose('selectGame > gameDeployAnimalRequest:', cardId);
    // console.timeEnd('gameDeployAnimalRequest body');
    // console.time('server$gameDeployAnimal');
    dispatch(server$gameDeployAnimalFromHand(gameId, userId, animal, parseInt(animalPosition), cardId));
    dispatch(server$playerActed(gameId, userId));
  }
  , gameDeployTraitRequest: ({gameId, cardId, entityId, alternateTrait, linkId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.DEPLOY);
    checkPlayerCanAct(game, userId);


    const card = checkPlayerHasCard(game, userId, cardId);
    const traitData = card.getTraitDataModel(alternateTrait);
    if (!traitData) {
      throw new ActionCheckError(ERR.GAME_CARD_TRAIT_NOTFOUND, {
        gameId
        , userId
        , cardId
        , trait1: card.trait1
        , trait2: card.trait2
        , alternateTrait
        , linkId
      });
    }

    let entity;
    let entityOwnerId;

    if (traitData.cardTargetType & CTT_PARAMETER.ANIMAL) {
      entity = game.locateAnimal(entityId);
      if (entity) {
        entityOwnerId = entity.ownerId;
      }
    } else if (traitData.cardTargetType & CTT_PARAMETER.PLANT) {
      entity = game.getPlant(entityId);
    }

    if (!entity) {
      throw new ActionCheckError(ERR.GAME_ENTITY_NOTFOUND, {gameId, entityId});
    }

    throwError(traitData.getErrorOfTraitPlacement(entity));
    throwError(traitData.getErrorOfTraitPlacement_User(userId, entityOwnerId));

    let linkedEntity;
    let linkedEntityOwnerId;
    if (traitData.linkTargetType) {
      if (traitData.linkTargetType & CTT_PARAMETER.PLANT) {
        linkedEntity = game.getPlant(linkId);
      } else if (traitData.linkTargetType & CTT_PARAMETER.ANIMAL) {
        linkedEntity = game.locateAnimal(linkId);
        if (linkedEntity) {
          linkedEntityOwnerId = linkedEntity.ownerId;
        }
      }

      if (!linkedEntity)
        throw new ActionCheckError(ERR.GAME_LINK_NOTFOUND, {gameId, linkId});
      if (entity === linkedEntity)
        throw new ActionCheckError(ERR.GAME_LINK_SELF, {gameId, linkId});
      throwError(traitData.getErrorOfTraitPlacement(linkedEntity));
      throwError(traitData.getErrorOfTraitPlacement_LinkUser(userId, linkedEntityOwnerId));
    }

    let traits = [];
    if (traitData.linkTargetType) {
      traits = TraitModel.LinkBetween(
        traitData.type
        , entity
        , linkedEntity
      );
    } else if (traitData.cardTargetType & CTT_PARAMETER.PARASITE) {
      const linkedPlant = PlantModel.new(pt.PlantParasite);
      dispatch(server$gameDeployPlant(gameId, linkedPlant));
      traits = TraitModel.LinkBetween(
        ptt.PlantTraitParasiticLink
        , linkedPlant
        , entity
      );
    } else {
      traits = [TraitModel.new(traitData.type).attachTo(entity)];
    }

    dispatch(server$gameDeployTrait(gameId, cardId, traits));
    dispatch(server$playerActed(gameId, userId));
  }
  , gameSetUserTimedOutRequest: ({gameId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    if (!game.getPlayer(userId).timedOut) {
      throw new ActionCheckError(ERR.GAME_PLAYER_TIMEOUT_NOTFOUND, {gameId, userId});
    }
    dispatch(server$gameSetUserTimedOut(gameId, userId, false));
    if (game.status.currentPlayer === userId && checkTimeout(makeTurnTimeoutId(gameId))) {
      dispatch(server$gameCancelTurnTimeout(gameId));
      dispatch(server$addTurnTimeout(gameId, userId))
    }
  }
  , gameSetUserWantsPauseRequest: ({gameId, wantsPause}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    dispatch(server$game(gameId, gameSetUserWantsPause(gameId, userId, wantsPause)));
    dispatch(server$gameCheckForPause(gameId));
  }
  , gameDeployRegeneratedAnimalRequest: ({gameId, cardId, animalId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.REGENERATION);
    checkPlayerHasCard(game, userId, cardId);
    const animal = getOrThrowPlayerAnimal(game, userId, animalId);
    if (!animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) {
      throw new ActionCheckError(ERR.GAME_ANIMAL_FLAG, {
        gameId,
        userId,
        animalId,
        flag: TRAIT_ANIMAL_FLAG.REGENERATION
      });
    }
    dispatch(server$game(gameId, gameDeployRegeneratedAnimal(gameId, userId, cardId, animalId, 'HAND')));
    if (dispatch(server$gamePhaseCheckEndRegeneration(gameId))) {
      dispatch(server$gamePhaseEndRegeneration(gameId));
    }
  }
};

export const gameServerToClient = {
  gameInit: ({game, userId}, currentUserId) => (dispatch) => {
    dispatch(gameInit(GameModelClient.fromServer(game, userId)));
    redirectTo('/room');
  }
  , gameCreateSuccess: (({game}, currentUserId) => (dispatch) => {
    dispatch(gameCreateSuccess(GameModelClient.fromServer(game, currentUserId)));
    redirectTo('/room');
  })
  , gameCreateNotify: ({roomId, gameId}) => gameCreateNotify(roomId, gameId)
  , gameStart: ({gameId}) => gameStart(gameId)
  , gameStartTurn: ({gameId}) => gameStartTurn(gameId)
  , gameStartPhase: ({gameId, phase, timestamp, data}) => gameStartPhase(gameId, phase, timestamp, data)
  , gameGiveCards: ({gameId, userId, cards}) =>
    gameGiveCards(gameId, userId, List(cards).map(card => CardModel.fromServer(card)))
  , gameDeployAnimalFromHand: ({gameId, userId, animal, animalPosition, cardId}) =>
    gameDeployAnimalFromHand(gameId, userId, AnimalModel.fromServer(animal), animalPosition, cardId)
  , gameDeployAnimalFromDeck: ({gameId, animal, sourceAid}) =>
    gameDeployAnimalFromDeck(gameId, AnimalModel.fromServer(animal), sourceAid)
  , gameDeployTrait: ({gameId, cardId, traits}) =>
    gameDeployTrait(gameId, cardId, traits.map(trait => TraitModel.fromServer(trait)))
  , gameDeployRegeneratedAnimal: ({gameId, userId, cardId, animalId, source}) =>
    gameDeployRegeneratedAnimal(gameId, userId, cardId, animalId, source)
  , gameAddTurnTimeout: ({gameId, turnStartTime, turnDuration}) =>
    gameAddTurnTimeout(gameId, turnStartTime, turnDuration)
  , gameNextRound: ({gameId}) => gameNextRound(gameId)
  , gameNextPlayer: ({gameId, playerId}, userId) => (dispatch, getState) => {
    const game = getState().get('game');
    const previousPlayerId = game.status.currentPlayer;
    if (previousPlayerId !== userId && playerId === userId) dispatch(appPlaySound('NOTIFICATION'));
    dispatch(gameNextPlayer(gameId, playerId))
  }
  , playerActed: ({gameId, userId}) => playerActed(gameId, userId)
  , gameEndTurn: ({gameId, userId}) => gameEndTurn(gameId, userId)
  , gameEnd: ({gameId, game}, currentUserId) => gameEnd(gameId, GameModelClient.fromServer(game, currentUserId))
  , gamePlayerLeft: ({gameId, userId}) => gamePlayerLeft(gameId, userId)
  , gameSetUserTimedOut: ({gameId, playerId, timedOut}) => gameSetUserTimedOut(gameId, playerId, timedOut)
  , gameSetUserWantsPause: ({gameId, userId, wantsPause}) => gameSetUserWantsPause(gameId, userId, wantsPause)
  , gameSetPaused: ({gameId, paused}) => gameSetPaused(gameId, paused)
  , animalDeath: ({gameId, type, animalId, data}) => animalDeath(gameId, type, animalId, data)
  , plantDeath: ({gameId, plantId}) => plantDeath(gameId, plantId)
};










