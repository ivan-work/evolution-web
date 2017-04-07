import logger, {loggerOnline} from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';
import {
  CARD_TARGET_TYPE,
  CARD_SOURCE,
  CTT_PARAMETER,
  TRAIT_TARGET_TYPE,
  TRAIT_ANIMAL_FLAG
} from '../models/game/evolution/constants';

import {server$game} from './generic';
import {doesPlayerHasOptions, getFeedingOption} from './ai';
import {server$tryViviparous, server$takeFoodRequest} from './actions';
import {redirectTo} from '../utils';
import {selectGame, selectPlayers4Sockets} from '../selectors';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasCard
  , checkPlayerCanAct
  , checkGamePhase
  , checkValidAnimalPosition
} from './checks';

import {checkComboRoomCanStart} from './rooms.checks';

import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';

/**
 * Init
 * */

export const gameInit = (game, userId) => ({type: 'gameInit', data: {game, userId}});

// Game Create
export const gameCreateRequest = (roomId, seed) => ({
  type: 'gameCreateRequest'
  , data: {roomId, seed}
  , meta: {server: true}
});
const gameCreateSuccess = (game) => ({
  type: 'gameCreateSuccess'
  , data: {game}
});
const gameCreateNotify = (roomId, gameId) => ({
  type: 'gameCreateNotify'
  , data: {roomId, gameId}
});
export const server$gameCreateSuccess = (game) => (dispatch, getState) => {
  dispatch(gameCreateSuccess(game));
  dispatch(Object.assign(gameCreateNotify(game.roomId, game.id)
    , {meta: {users: true}}));
  selectPlayers4Sockets(getState, game.id).forEach(userId => {
    dispatch(Object.assign(gameCreateSuccess(game.toOthers(userId).toClient())
      , {meta: {userId, clientOnly: true}}));
  });
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
  // Can't place cancelTimeout here because
  // we don't want timer drop when someone leaves in a valid game
  switch (game.players.filter(p => p.playing).size) {
    case 0:
      dispatch(cancelTimeout(makeTurnTimeoutId(gameId)));
      break;
    case 1:
      dispatch(cancelTimeout(makeTurnTimeoutId(gameId)));
      if (game.status.phase !== PHASE.FINAL) {
        loggerOnline.info(`Game left ${game.players.map(p => getState().getIn(['users', p.id, 'login'])).join(', ')}`);
        dispatch(server$game(gameId, gameEnd(gameId, selectGame(getState, gameId).toClient())));
      }
      break;
    default:
      if (game.status.currentPlayer === leaver.index) {
        dispatch(server$gamePlayerContinue(gameId));
      }
  }
};

// Game Start
export const server$gameStart = (gameId) => (dispatch, getState) => {
  dispatch(server$game(gameId, gameStart(gameId)));
  dispatch(server$gameDistributeCards(gameId));
  dispatch(server$gamePlayerStart(gameId));
};

export const gameStart = (gameId) => ({
  type: 'gameStart'
  , data: {gameId}
});

// Game Ready Request
export const gameReadyRequest = (ready = true) => (dispatch, getState) => dispatch({
  type: 'gameReadyRequest'
  , data: {gameId: getState().get('game').id, ready}
  , meta: {server: true}
});
export const gamePlayerReadyChange = (gameId, userId, ready) => ({
  type: 'gamePlayerReadyChange'
  , data: {gameId, userId, ready}
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
    , {meta: {clientOnly: true, users: selectPlayers4Sockets(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

// ===== DEPLOY!

// gameDeployAnimal
export const gameDeployAnimalRequest = (cardId, animalPosition) => (dispatch, getState) =>dispatch({
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
    , {meta: {clientOnly: true, users: selectPlayers4Sockets(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

export const gameDeployAnimalFromDeck = (gameId, animal, sourceAid) => ({
  type: 'gameDeployAnimalFromDeck'
  , data: {gameId, animal, sourceAid}
});

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
    , {meta: {clientOnly: true, users: selectPlayers4Sockets(getState, gameId)}}
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
  const game = selectGame(getState, gameId);
  const player = game.getPlayer(userId);
  if (game.status.phase === PHASE.FEEDING && !player.acted) {
    const animal = getFeedingOption(game, userId);
    if (!!animal) {
      console.log('TAKING THE FOOD', animal.id);
      dispatch(server$takeFoodRequest(gameId, userId, animal.id, true));
    }
  }
};

export const server$gameEndTurn = (gameId, userId) => (dispatch, getState) => {
  dispatch(server$autoTurn(gameId, userId));
  logger.debug('server$gameEndTurn:', userId);
  dispatch(cancelTimeout(makeTurnTimeoutId(gameId)));
  dispatch(server$game(gameId, gameEndTurn(gameId, userId)));

  const game = selectGame(getState, gameId);

  if (game.players.some(player => !player.ended)) {
    dispatch(server$gamePlayerContinue(gameId));
  } else if (game.status.phase === PHASE.DEPLOY) {
    logger.debug('server$gameStartFEEDING:');
    const food = game.generateFood();
    dispatch(server$game(gameId, gameStartEat(gameId, food)));
    dispatch(server$gamePlayerStart(gameId));
  } else {
    logger.debug('server$gameExtict:', userId);
    dispatch(server$gameExtict(gameId));
    if (selectGame(getState, gameId).deck.size > 0) {
      logger.debug('server$gameStartDEPLOY');
      dispatch(server$game(gameId, gameStartDeploy(gameId)));
      dispatch(server$gameDistributeCards(gameId));
      dispatch(server$gamePlayerStart(gameId));
    } else {
      dispatch(server$gameEnd(gameId));
    }
  }
};

// gameNextPlayer
const gameNextPlayer = (gameId, nextPlayerId, nextPlayerIndex, roundChanged, playerHasOptions) => ({
  type: 'gameNextPlayer'
  , data: {gameId, nextPlayerId, nextPlayerIndex, roundChanged, playerHasOptions}
});

const gameNextPlayerNotify = (gameId, userId) => ({
  type: 'gameNextPlayerNotify'
  , data: {gameId, userId}
});

export const makeTurnTimeoutId = (gameId) => `turnTimeTimeout#${gameId}`;

const gameAddTurnTimeout = (gameId, turnStartTime, turnDuration) => ({
  type: 'gameAddTurnTimeout'
  , data: {gameId, turnStartTime, turnDuration}
});

export const server$addTurnTimeout = (gameId, userId, turnTime) => (dispatch, getState) => {
  if (turnTime === void 0) throw new Error('turnTime === undefined');
  dispatch(addTimeout(turnTime, makeTurnTimeoutId(gameId, userId), (dispatch, getState) => {
    logger.info(`Turn Timeout:`, `${gameId}: ${userId}`);
    dispatch(server$gameEndTurn(gameId, userId))
  }));
  dispatch(server$game(gameId, gameAddTurnTimeout(gameId, Date.now(), turnTime)));
};

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
  dispatch(cancelTimeout(makeTurnTimeoutId(gameId)));

  const currentPlayerIndex = selectGame(getState, gameId).getIn(['status', 'currentPlayer']);

  dispatch(server$game(gameId, gameNextPlayer(gameId, nextPlayer.id, nextPlayer.index, roundChanged)));

  const playerHasOptions = doesPlayerHasOptions(selectGame(getState, gameId), nextPlayer.id);
  if (playerHasOptions) {
    //dispatch(gameLogNotify)
    dispatch(server$addTurnTimeout(gameId, nextPlayer.id, selectGame(getState, gameId).settings.timeTurn));
    if (currentPlayerIndex !== nextPlayer.index) {
      dispatch(server$game(gameId, gameNextPlayerNotify(gameId, nextPlayer.id)))
    }
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

const gameAnimalStarve = (gameId, animalId) => ({
  type: 'gameAnimalStarve'
  , data: {gameId, animalId}
});

const traitAnimalPoisoned = (gameId, animalId) => ({
  type: 'traitAnimalPoisoned'
  , data: {gameId, animalId}
});

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
        dispatch(server$game(gameId, traitAnimalPoisoned(gameId, animal.id)));
      } else if (!animal.canSurvive()) {
        dispatch(server$game(gameId, gameAnimalStarve(gameId, animal.id)));
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
  const game = selectGame(getState, gameId);
  loggerOnline.info(`Game finished ${game.players.map(p => getState().getIn(['users', p.id, 'login'])).join(', ')}`);
  dispatch(server$game(gameId, gameEnd(gameId, game)));
};

export const gameClientToServer = {
  gameCreateRequest: ({roomId, seed = null}, {userId}) => (dispatch, getState) => {
    //if (process.env.NODE_ENV === 'production') seed = null;
    const room = getState().getIn(['rooms', roomId]);
    checkComboRoomCanStart(room, userId);

    const game = seed === null
      ? GameModel.new(room)
      : GameModel.parse(room, seed);

    dispatch(server$gameCreateSuccess(game));
  }
  , gameReadyRequest: ({gameId, ready}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    dispatch(server$game(gameId, gamePlayerReadyChange(gameId, userId, ready)));
    /**
     * Actual starting
     * */
    const newGame = selectGame(getState, gameId);
    if (!newGame.status.started && newGame.players.every(player => player.ready)) {
      dispatch(server$gameStart(gameId));
    }
  }
  , gameEndTurnRequest: ({gameId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerCanAct(game, userId);
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
    checkPlayerHasCard(game, userId, cardId);
    const animal = AnimalModel.new(userId);
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
};

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
  , gamePlayerReadyChange: ({gameId, userId, ready}) => gamePlayerReadyChange(gameId, userId, ready)
  , gameGiveCards: ({gameId, userId, cards}) =>
    gameGiveCards(gameId, userId, List(cards).map(card => CardModel.fromServer(card)))
  , gameDeployAnimalFromHand: ({gameId, userId, animal, animalPosition, cardId}) =>
    gameDeployAnimalFromHand(gameId, userId, AnimalModel.fromServer(animal), animalPosition, cardId)
  , gameDeployAnimalFromDeck: ({gameId, animal, sourceAid}) => gameDeployAnimalFromDeck(gameId, AnimalModel.fromServer(animal), sourceAid)
  , gameDeployTrait: ({gameId, cardId, traits}) =>
    gameDeployTrait(gameId, cardId, traits.map(trait => TraitModel.fromServer(trait)))
  , gameAddTurnTimeout: ({gameId, turnStartTime, turnDuration}) =>
    gameAddTurnTimeout(gameId, turnStartTime, turnDuration)
  , gameNextPlayer: ({gameId, nextPlayerId, nextPlayerIndex, roundChanged}) =>
    gameNextPlayer(gameId, nextPlayerId, nextPlayerIndex, roundChanged)
  , gameNextPlayerNotify: ({gameId, userId}, currentUserId) => (dispatch) =>
    (userId === currentUserId && dispatch(gameNextPlayerNotify(gameId, userId)))
  , gameEndTurn: ({gameId, userId}) => gameEndTurn(gameId, userId)
  , gameEnd: ({gameId, game}, currentUserId) => gameEnd(gameId, GameModelClient.fromServer(game, currentUserId))
  , gamePlayerLeft: ({gameId, userId}) => gamePlayerLeft(gameId, userId)
  , gameAnimalStarve: ({gameId, animalId}) => gameAnimalStarve(gameId, animalId)
  , traitAnimalPoisoned: ({gameId, animalId}) => traitAnimalPoisoned(gameId, animalId)
};










