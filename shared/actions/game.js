import logger, {loggerOnline} from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {SETTINGS_TIMED_OUT_TURN_TIME} from '../models/game/GameSettings';
import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';
import {
  CARD_TARGET_TYPE
  , CARD_SOURCE
  , CTT_PARAMETER
  , TRAIT_TARGET_TYPE
  , TRAIT_ANIMAL_FLAG
  , ANIMAL_DEATH_REASON
} from '../models/game/evolution/constants';

import {server$game, to$} from './generic';
import {doesPlayerHasOptions, getFeedingOption} from './ai';
import {
  server$tryViviparous
  , server$takeFoodRequest
  , server$questionPauseTimeout
  , server$questionResumeTimeout
  , server$traitProcessNeoplasm
} from './actions';
import {appPlaySound} from '../../client/actions/app';
import {redirectTo} from '../utils';
import {selectGame, selectUsersInGame} from '../selectors';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerTurn
  , checkPlayerHasCard
  , checkPlayerCanAct
  , checkGamePhase
  , checkValidAnimalPosition
} from './checks';

import {
  checkRoomMinSize
  , checkRoomMaxSize
  , checkRoomIsNotInGame
} from './rooms.checks';

import {addTimeout, cancelTimeout, checkTimeout} from '../utils/reduxTimeout';

/**
 * Init
 * */

export const gameInit = (game, userId) => ({type: 'gameInit', data: {game, userId}});

// Game Create
const gameCreateSuccess = (game) => ({
  type: 'gameCreateSuccess'
  , data: {game}
});
const gameCreateNotify = (roomId, gameId) => ({
  type: 'gameCreateNotify'
  , data: {roomId, gameId}
});
export const server$gameCreateSuccess = (room) => (dispatch, getState) => {
  checkRoomMinSize(room);
  checkRoomMaxSize(room);
  checkRoomIsNotInGame(room);
  const seed = room.settings.seed;
  const game = (seed === null
    ? GameModel.new(room)
    : GameModel.parse(room, seed));
  const gameId = game.id;

  dispatch(gameCreateSuccess(game));
  dispatch(Object.assign(gameCreateNotify(game.roomId, game.id)
    , {meta: {users: true}}));
  selectUsersInGame(getState, game.id).forEach(userId => {
    dispatch(Object.assign(gameCreateSuccess(game.toOthers(userId).toClient())
      , {meta: {userId, clientOnly: true}}));
  });

  if (game.status.phase === 0) {
    dispatch(server$game(gameId, gameStart(gameId)));
    dispatch(server$gameDistributeCards(gameId));
    dispatch(server$gamePlayerStart(gameId));
  }
};

// Game Leave
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
  const leaver = game.getPlayer(userId);
  switch (game.getActualPlayers().size) {
    case 0:
    case 1:
      if (game.status.phase !== PHASE.FINAL) dispatch(server$gameEnd(gameId));
      break;
    default:
      if (game.status.currentPlayer === leaver.index) {
        dispatch(server$gamePlayerContinue(gameId));
      }
  }
};

// Game Start
export const gameStart = (gameId) => ({
  type: 'gameStart'
  , data: {gameId}
});

// Game Give Cards
export const gameGiveCards = (gameId, userId, cards) => ({
  type: 'gameGiveCards'
  , data: {gameId, userId, cards}
});

export const server$gameGiveCards = (gameId, userId, count) => (dispatch, getState) => {
  const cards = selectGame(getState, gameId).deck.take(count);
  dispatch(Object.assign(
    gameGiveCards(gameId, userId, cards)
  ));
  dispatch(Object.assign(
    gameGiveCards(gameId, userId, cards.map(card => card.toClient()))
    , {meta: {clientOnly: true, userId}}
  ));
  dispatch(Object.assign(
    gameGiveCards(gameId, userId, cards.map(card => card.toOthers().toClient()))
    , {meta: {clientOnly: true, users: selectUsersInGame(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

/**
 * Pause
 */

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
        dispatch(server$addTurnTimeout(gameId,));
      }
    }
  }
};

// ===== DEPLOY!

// gameDeployAnimal
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

export const server$gameDeployAnimalFromDeck = (gameId, sourceAnimal) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const userId = sourceAnimal.ownerId;
  const animal = AnimalModel.new(userId, game.deck.last() && game.deck.last().trait1).set('food', 1);
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

// gameDeployTrait
export const gameDeployTraitRequest = (cardId, animalId, alternateTrait, linkId) => (dispatch, getState) => dispatch({
  type: 'gameDeployTraitRequest'
  , data: {gameId: getState().get('game').id, cardId, animalId, alternateTrait, linkId}
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

// gameDeployAnimal || gameDeployTrait > gameDeployNext > gameNextPlayer || gameFinishDeploy
export const server$gameDeployNext = (gameId, userId) => (dispatch, getState) => {
  logger.debug('server$gameDeployNext:', userId);
  const game = selectGame(getState, gameId);
  if (game.getPlayer(userId).hand.size !== 0) {
    dispatch(server$gamePlayerContinue(gameId));
  } else {
    dispatch(server$gameEndTurn(gameId, userId));
  }
};

// gameEndTurn
export const gameEndTurnRequest = () => (dispatch, getState) => dispatch({
  type: 'gameEndTurnRequest'
  , data: {gameId: getState().get('game').id}
  , meta: {server: true}
});
export const gameEndTurn = (gameId, userId) => ({
  type: 'gameEndTurn'
  , data: {gameId, userId}
});

export const server$autoTurn = (gameId, userId) => (dispatch, getState) => {
  // Return true if autoturn happened, so no need to end the turn
  const game = selectGame(getState, gameId);
  const player = game.getPlayer(userId);
  if (game.status.phase === PHASE.DEPLOY) {
    if (player.continent.size === 0 && player.hand.size > 0) {
      const card = player.hand.first();
      const animal = AnimalModel.new(userId, card.trait1);
      dispatch(server$gameDeployAnimalFromHand(gameId, userId, animal, 0, card.id));
      dispatch(server$gameDeployNext(gameId, userId));
      return true;
    }
  } else if (game.status.phase === PHASE.FEEDING) {
    if (!player.acted) {
      const animal = getFeedingOption(game, userId);
      if (!!animal) {
        dispatch(server$takeFoodRequest(gameId, userId, animal.id));
        return true;
      }
    }
  }
};

export const server$gameEndTurn = (gameId, userId) => (dispatch, getState) => {
  const isAutoTurn = !!dispatch(server$autoTurn(gameId, userId));
  if (isAutoTurn) return;
  logger.verbose('server$gameEndTurn:', userId);
  dispatch(server$gameCancelTurnTimeout(gameId));
  dispatch(server$game(gameId, gameEndTurn(gameId, userId)));

  const game = selectGame(getState, gameId);

  if (game.players.some(player => !player.ended)) {
    dispatch(server$gamePlayerContinue(gameId));
  } else if (game.status.phase === PHASE.DEPLOY) {
    logger.verbose('server$gameStart FEEDING:');
    const food = game.generateFood();
    dispatch(server$traitProcessNeoplasm(game));
    dispatch(server$game(gameId, gameStartEat(gameId, food)));
    dispatch(server$gamePlayerStart(gameId));
  } else {
    // logger.verbose('server$gameExtict:', userId);
    dispatch(server$gameExtict(gameId));
    if (selectGame(getState, gameId).deck.size > 0) {
      logger.verbose('server$gameStart DEPLOY');
      dispatch(server$game(gameId, gameStartDeploy(gameId)));
      dispatch(server$gameDistributeCards(gameId));
      dispatch(server$gamePlayerStart(gameId));
    } else {
      dispatch(server$gameEnd(gameId));
    }
  }
};

/**
 * gameNextPlayer
 * */

const gameNextPlayer = (gameId, nextPlayerId, nextPlayerIndex, roundChanged, playerHasOptions) => ({
  type: 'gameNextPlayer'
  , data: {gameId, nextPlayerId, nextPlayerIndex, roundChanged, playerHasOptions}
});

const gameNextPlayerNotify = (gameId, userId) => ({
  type: 'gameNextPlayerNotify'
  , data: {gameId, userId}
});

/**
 * Timeout
 * */

const makeTurnTimeoutId = (gameId) => `turnTimeTimeout#${gameId}`;

const gameAddTurnTimeout = (gameId, turnStartTime, turnDuration) => ({
  type: 'gameAddTurnTimeout'
  , data: {gameId, turnStartTime, turnDuration}
});

const gameCancelTurnTimeout = (gameId, userId) => ({
  type: 'gameCancelTurnTimeout'
  , data: {gameId, userId}
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
}

export const server$addTurnTimeout = (gameId, userId, turnTime) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (game.status.paused) return;

  if (userId === void 0) {
    userId = game.players.find(p => p.index === game.status.currentPlayer).id
  }
  if (turnTime === void 0) {
    turnTime = !game.getPlayer(userId).timedOut ? game.settings.timeTurn : SETTINGS_TIMED_OUT_TURN_TIME;
  }
  dispatch(server$game(gameId, gameAddTurnTimeout(gameId, Date.now(), turnTime)));
  dispatch(addTimeout(turnTime, makeTurnTimeoutId(gameId, userId), (dispatch, getState) => {
    logger.info(`Turn Timeout:`, `${gameId}: ${userId}`);
    dispatch(server$gameSetUserTimedOut(gameId, userId, true));
    dispatch(server$gameEndTurn(gameId, userId))
  }));
};

export const server$gameCancelTurnTimeout = (gameId) => (dispatch, getState) => {
  // logger.info(`Turn Timeout:`, `${gameId}: ${userId}`);
  // dispatch(server$game(gameId, gameCancelTurnTimeout(gameId)));
  dispatch(cancelTimeout(makeTurnTimeoutId(gameId)));
  dispatch(gameCancelTurnTimeout(gameId));
};

/**
 * Player Start/Continue
 * */

export const server$gamePlayerStart = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const roundPlayer = game.getIn(['status', 'roundPlayer']);

  const {nextPlayer, roundChanged} = choosePlayer(game, roundPlayer);

  dispatch(server$gameNextPlayer(gameId, nextPlayer, false));
};

export const server$gamePlayerContinue = (gameId, previousUserId) => (dispatch, getState) => {
  logger.debug('server$gamePlayerContinue');
  const game = selectGame(getState, gameId);
  const currentPlayer = game.getIn(['status', 'currentPlayer']);

  const {nextPlayer, roundChanged} = choosePlayer(game, (currentPlayer + 1));

  dispatch(server$gameNextPlayer(gameId, nextPlayer, roundChanged));
};

const server$gameNextPlayer = (gameId, nextPlayer, roundChanged) => (dispatch, getState) => {
  logger.debug('server$gameNextPlayer:', nextPlayer.id, !!roundChanged);
  dispatch(server$gameCancelTurnTimeout(gameId));

  const currentPlayerIndex = selectGame(getState, gameId).getIn(['status', 'currentPlayer']);

  dispatch(server$game(gameId, gameNextPlayer(gameId, nextPlayer.id, nextPlayer.index, roundChanged)));

  const playerHasOptions = doesPlayerHasOptions(selectGame(getState, gameId), nextPlayer.id);
  if (playerHasOptions) {
    //dispatch(gameLogNotify)
    if (currentPlayerIndex !== nextPlayer.index) {
      dispatch(to$({clientOnly: true, userId: nextPlayer.id}, gameNextPlayerNotify(gameId, nextPlayer.id)))
    }
    dispatch(server$addTurnTimeout(gameId, nextPlayer.id));
  } else {
    dispatch(server$gameEndTurn(gameId, nextPlayer.id));
  }
};

const choosePlayer = (game, startIndex) => {
  let roundChanged = false;

  const roundPlayer = game.getIn(['status', 'roundPlayer']);
  //console.log('searching for suitable player. start index = ', startIndex % game.players.size);
  const nextPlayer = GameModel.sortPlayersFromIndex(game, startIndex % game.players.size)
    .find((player) => {
      //console.log('Player', player.id, player.playing, !player.ended);
      if (player.index === roundPlayer) roundChanged = true;
      return player.playing && !player.ended;
    });

  if (!nextPlayer) logger.error('nextPlayer not found', {
    players: game.get('players')
    , status: game.get('status')
  });
  //logger.info('choosePlayer:', `${game.id} ${nextPlayer.index} ${roundChanged === true}`);

  return {nextPlayer, roundChanged};
};

// ===== EATING!

export const gameStartEat = (gameId, food) => ({
  type: 'gameStartEat'
  , data: {gameId, food}
});

// ===== EXTINCT!

const gameStartDeploy = (gameId) => ({
  type: 'gameStartDeploy'
  , data: {gameId}
});

const gameStartExtinct = (gameId) => ({
  type: 'gameStartExtinct'
  , data: {gameId}
});

const server$gameExtict = (gameId) => (dispatch, getState) => {
  dispatch(server$game(gameId, gameStartExtinct(gameId)));
  selectGame(getState, gameId).players.forEach((player) =>
    player.continent.forEach((animal) => {
      if (animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED)) {
        dispatch(server$game(gameId, animalDeath(gameId, ANIMAL_DEATH_REASON.POISON, animal.id)));
      } else if (!animal.canSurvive()) {
        dispatch(server$game(gameId, animalDeath(gameId, ANIMAL_DEATH_REASON.STARVE, animal.id)));
      } else {
        dispatch(server$tryViviparous(gameId, animal));
      }
    }));
};

const getCardsForPlayers = (game) => {
  const cardsNeedToPlayers = {};

  game.players.forEach((player) => {
    if (!player.playing) return;
    cardsNeedToPlayers[player.id] = 1;
    player.continent.forEach((animal) => {
      // will be modified by viviparism, r-strategy
      cardsNeedToPlayers[player.id] += 1;
    });
    if (player.continent.size === 0 && player.hand.size === 0) {
      cardsNeedToPlayers[player.id] = 6;
    }
  });

  return cardsNeedToPlayers;
};

const server$gameDistributeCards = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const mapPlayersWantCards = getCardsForPlayers(game);
  const mapPlayersGiveCards = {};
  let deckSize = game.deck.size;

  const players = GameModel.sortPlayersFromIndex(game);
  while (deckSize > 0 && Object.keys(mapPlayersWantCards).length > 0) {
    players.some((player) => {
      if (deckSize <= 0) return true;
      if (mapPlayersWantCards[player.id] > 0) {
        mapPlayersWantCards[player.id] -= 1;
        deckSize--;
        if (!mapPlayersGiveCards[player.id]) mapPlayersGiveCards[player.id] = 0;
        mapPlayersGiveCards[player.id] += 1;
      } else {
        delete mapPlayersWantCards[player.id];
      }
    });
  }
  Object.keys(mapPlayersGiveCards)
    .sort((p1, p2) => game.getPlayer(p1).index - game.getPlayer(p2).index)
    .forEach((playerId) => {
      dispatch(server$gameGiveCards(gameId, playerId, mapPlayersGiveCards[playerId]));
    });
};

// ===== WIN!

const gameEnd = (gameId, game) => ({
  type: 'gameEnd'
  , data: {gameId, game}
});

const server$gameEnd = (gameId) => (dispatch, getState) => {
  logger.debug('server$gameEnd', gameId);
  dispatch(server$gameCancelTurnTimeout(gameId));
  const game = selectGame(getState, gameId);
  loggerOnline.info(`Game finished ${game.players.map(p => getState().getIn(['users', p.id, 'login'])).join(', ')}`);
  dispatch(gameEnd(gameId, game));
  dispatch(to$({clientOnly: true, users: selectUsersInGame(getState, gameId)}
    , gameEnd(gameId, game.toClient())));
};

export const gameClientToServer = {
  gameEndTurnRequest: ({gameId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerCanAct(game, userId);
    if (!(game.status.phase === PHASE.FEEDING || game.status.phase === PHASE.DEPLOY)) {
      throw new ActionCheckError(`checkGamePhase@Game(${game.id})`, 'Wrong phase (%s)', game.status.phase);
    }
    dispatch(server$gameEndTurn(gameId, userId));
  }
  , gameDeployAnimalRequest: ({gameId, cardId, animalPosition = 0}, {userId}) => (dispatch, getState) => {
    // console.time('gameDeployAnimalRequest body');
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.DEPLOY);
    checkPlayerCanAct(game, userId);
    checkValidAnimalPosition(game, userId, animalPosition);
    const cardIndex = checkPlayerHasCard(game, userId, cardId);
    const card = game.getPlayer(userId).getCard(cardIndex);
    const animal = AnimalModel.new(userId, card.trait1);
    logger.verbose('selectGame > gameDeployAnimalRequest:', cardId);
    // console.timeEnd('gameDeployAnimalRequest body');
    // console.time('server$gameDeployAnimal');
    dispatch(server$gameDeployAnimalFromHand(gameId, userId, animal, parseInt(animalPosition), cardId));
    // console.timeEnd('server$gameDeployAnimal');
    // console.time('server$gameDeployNext');
    dispatch(server$gameDeployNext(gameId, userId));
    // console.timeEnd('server$gameDeployNext');
  }
  , gameDeployTraitRequest: ({gameId, cardId, animalId, alternateTrait, linkId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.DEPLOY);
    checkPlayerCanAct(game, userId);

    const cardIndex = checkPlayerHasCard(game, userId, cardId);
    const card = game.players.get(userId).hand.get(cardIndex);
    const traitData = card.getTraitDataModel(alternateTrait);
    if (!traitData) {
      throw new ActionCheckError(`checkCardHasTrait@Game(${game.id})`, 'Card(%s;%s) doesn\'t have trait (%s)'
        , card.trait1
        , card.trait2
        , traitData);
    }

    if (traitData.hidden) {
      throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Cannot deploy hidden trait to an Animal#(%s)', animalId);
    }

    const {animal} = game.locateAnimal(animalId);
    if (!animal) {
      throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Player#%s doesn\'t have Animal#%s', playerId, animalId);
    }
    const playerId = animal.ownerId;

    const {animal: linkedAnimal} = game.locateAnimal(linkId);
    const linkedPlayerId = linkedAnimal && linkedAnimal.ownerId;

    if (traitData.cardTargetType & CTT_PARAMETER.SELF)
      if (playerId !== userId)
        throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(ANIMAL_SELF) User#%s doesn't have Animal#%s`, userId, animalId);
    if (traitData.cardTargetType & CTT_PARAMETER.ENEMY)
      if (playerId === userId)
        throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(ANIMAL_ENEMY) User#%s applies to self`, userId);
    if (traitData.cardTargetType & CTT_PARAMETER.LINK) {
      if (animal === linkedAnimal)
        throw new ActionCheckError(`CheckCardTargetType(${game.id})`, 'Player#%s want to link Animal#%s to itself', playerId, linkedAnimal);
      if (!linkedAnimal)
        throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Player#%s doesn\'t have linked Animal#%s', playerId, linkedAnimal);
      if (traitData.cardTargetType & CTT_PARAMETER.SELF)
        if (linkedPlayerId !== userId)
          throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(LINK_SELF) Player(%s) linking to Player(%s)`, playerId, linkedPlayerId);
      if (traitData.cardTargetType & CTT_PARAMETER.ENEMY)
        if (linkedPlayerId !== playerId)
          throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(LINK_ENEMY) Player(%s) linking to Player(%s)`, playerId, linkedPlayerId);
    }

    if (traitData.checkTraitPlacement && !traitData.checkTraitPlacement(animal))
      throw new ActionCheckError(`gameDeployTraitRequest(${game.id})`, `Trait(%s) failed checkTraitPlacement on Animal(%s)`, traitData.type, animal.id);

    // TODO: refactor.
    // This one is bad because it attaches and links traits only for reducer to find their hosts.
    let traits = [];
    if (!(traitData.cardTargetType & CTT_PARAMETER.LINK)) {
      traits = [TraitModel.new(traitData.type).attachTo(animal)];
    } else {
      traits = TraitModel.LinkBetween(
        traitData.type
        , animal
        , linkedAnimal
        , traitData.cardTargetType & CTT_PARAMETER.ONEWAY);
    }

    dispatch(server$gameDeployTrait(gameId, cardId, traits));
    dispatch(server$gameDeployNext(gameId, userId));
  }
  , gameSetUserTimedOutRequest: ({gameId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    if (!game.getPlayer(userId).timedOut) throw new ActionCheckError(`User(%s) is not timedOut`, userId);
    dispatch(server$gameSetUserTimedOut(gameId, userId, false));
    if (game.status.currentPlayer === game.getPlayer(userId).index && checkTimeout(makeTurnTimeoutId(gameId))) {
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
};

export const animalDeath = (gameId, type, animalId, data) => ({
  type: 'animalDeath'
  , data: {gameId, type, animalId, data}
});
// gameServerToClient

export const gameServerToClient = {
  gameInit: ({game, userId}, currentUserId) => (dispatch) => {
    dispatch(gameInit(GameModelClient.fromServer(game, userId)));
    dispatch(redirectTo('/game'));
  }
  , gameCreateSuccess: (({game}, currentUserId) => (dispatch) => {
    dispatch(gameCreateSuccess(GameModelClient.fromServer(game, currentUserId)));
    dispatch(redirectTo('/game'));
  })
  , gameCreateNotify: ({roomId, gameId}) => gameCreateNotify(roomId, gameId)
  , gameStart: ({gameId}) => gameStart(gameId)
  , gameStartDeploy: ({gameId}) => gameStartDeploy(gameId)
  , gameStartExtinct: ({gameId}) => gameStartExtinct(gameId)
  , gameStartEat: ({gameId, food}) => gameStartEat(gameId, food)
  , gameGiveCards: ({gameId, userId, cards}) =>
    gameGiveCards(gameId, userId, List(cards).map(card => CardModel.fromServer(card)))
  , gameDeployAnimalFromHand: ({gameId, userId, animal, animalPosition, cardId}) =>
    gameDeployAnimalFromHand(gameId, userId, AnimalModel.fromServer(animal), animalPosition, cardId)
  , gameDeployAnimalFromDeck: ({gameId, animal, sourceAid}) =>
    gameDeployAnimalFromDeck(gameId, AnimalModel.fromServer(animal), sourceAid)
  , gameDeployTrait: ({gameId, cardId, traits}) =>
    gameDeployTrait(gameId, cardId, traits.map(trait => TraitModel.fromServer(trait)))
  , gameAddTurnTimeout: ({gameId, turnStartTime, turnDuration}) =>
    gameAddTurnTimeout(gameId, turnStartTime, turnDuration)
  , gameNextPlayer: ({gameId, nextPlayerId, nextPlayerIndex, roundChanged}) =>
    gameNextPlayer(gameId, nextPlayerId, nextPlayerIndex, roundChanged)
  , gameNextPlayerNotify: ({gameId, userId}, currentUserId) => (appPlaySound('NOTIFICATION'))
  , gameEndTurn: ({gameId, userId}) => gameEndTurn(gameId, userId)
  , gameEnd: ({gameId, game}, currentUserId) => gameEnd(gameId, GameModelClient.fromServer(game, currentUserId))
  , gamePlayerLeft: ({gameId, userId}) => gamePlayerLeft(gameId, userId)
  , gameSetUserTimedOut: ({gameId, playerId, timedOut}) => gameSetUserTimedOut(gameId, playerId, timedOut)
  , gameSetUserWantsPause: ({gameId, userId, wantsPause}) => gameSetUserWantsPause(gameId, userId, wantsPause)
  , gameSetPaused: ({gameId, paused}) => gameSetPaused(gameId, paused)
  , animalDeath: ({gameId, type, animalId, data}) =>
    animalDeath(gameId, type, animalId, data)
};










