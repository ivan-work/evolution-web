import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {List} from 'immutable';

import {GameModel, GameModelClient, PHASE} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';
import {CARD_TARGET_TYPE, CTT_PARAMETER, TRAIT_TARGET_TYPE, TRAIT_ANIMAL_FLAG} from '../models/game/evolution/constants';

import {actionError} from './generic';
import {server$game} from './generic';
import {redirectTo} from '../utils';
import {selectRoom, selectGame, selectPlayers4Sockets} from '../selectors';

import {
  checkGameDefined
  , checkGameHasUser
  , checkPlayerHasCard
  , checkPlayerHasAnimal
  , checkPlayerTurnAndPhase
  , checkValidAnimalPosition
} from './checks';

// Game Create
export const gameCreateRequest = (roomId, seed) => ({
  type: 'gameCreateRequest'
  , data: {roomId, seed}
  , meta: {server: true}
});
export const gameCreateSuccess = (game) => ({
  type: 'gameCreateSuccess'
  , data: {game}
});
export const server$gameCreateSuccess = (game) => (dispatch, getState) => {
  dispatch(gameCreateSuccess(game));
  selectPlayers4Sockets(getState, game.id).forEach(userId => {
    dispatch(Object.assign(
      gameCreateSuccess(game.toOthers(userId).toClient())
      , {meta: {userId, clientOnly: true}}
    ));
  });
};

// Game Leave
export const gamePlayerLeft = (gameId, userId) => ({
  type: 'gamePlayerLeft'
  , data: {gameId, userId}
});

export const gamePlayerLeftNotification = (gameId, userId) => ({
  type: 'gamePlayerLeftNotification'
  , data: {gameId, userId}
});

export const gameDestroy = (gameId) => ({
  type: 'gameDestroy'
  , data: {gameId}
});

export const server$gameLeave = (gameId, userId) => (dispatch, getState) => {
  logger.info('server$gameLeave')
  dispatch(server$game(gameId, gamePlayerLeft(gameId, userId)));
  const game = selectGame(getState, gameId);
  const leaver = game.getPlayer(userId);
  switch (game.players.filter(p => p.playing).size) {
    case 0:
      dispatch(server$game(gameId, gameDestroy(gameId)));
      break;
    case 1:
      if (game.status.phase !== PHASE.FINAL) {
        dispatch(server$game(gameId, gameEnd(gameId, selectGame(getState, gameId).toClient())));
      }
      break;
    default:
      if (game.status.currentPlayer === leaver.index) {
        dispatch(server$game(gameId, gameNextPlayer(gameId)));
      }
  }
};

// Game Start
export const server$gameStart = (gameId) => (dispatch, getState) =>
  dispatch(Object.assign(gameStart(gameId), {
    meta: {users: selectPlayers4Sockets(getState, gameId)}
  }));
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
export const gameDeployAnimal = (gameId, userId, animal, animalPosition, cardPosition) => ({
  type: 'gameDeployAnimal'
  , data: {gameId, userId, animal, animalPosition, cardPosition}
});
export const server$gameDeployAnimal = (gameId, userId, animal, animalPosition, cardPosition) => (dispatch, getState) => {
  dispatch(gameDeployAnimal(gameId, userId, animal, animalPosition, cardPosition));
  dispatch(Object.assign(
    gameDeployAnimal(gameId, userId, animal.toClient(), animalPosition, cardPosition)
    , {meta: {clientOnly: true, userId}}
  ));
  dispatch(Object.assign(
    gameDeployAnimal(gameId, userId, animal.toOthers().toClient(), animalPosition, cardPosition)
    , {meta: {clientOnly: true, users: selectPlayers4Sockets(getState, gameId).filter(uid => uid !== userId)}}
  ));
};

// gameDeployTrait
export const gameDeployTraitRequest = (cardId, animalId, alternateTrait, linkId) => (dispatch, getState) => dispatch({
  type: 'gameDeployTraitRequest'
  , data: {gameId: getState().get('game').id, cardId, animalId, alternateTrait, linkId}
  , meta: {server: true}
});

export const gameDeployTrait = (gameId, cardId, traitType, animalId, linkedAnimalId) => ({
  type: 'gameDeployTrait'
  , data: {gameId, cardId, traitType, animalId, linkedAnimalId}
});

export const server$gameDeployTrait = (gameId, cardId, traitType, animalId, linkedAnimalId) => (dispatch, getState) => {
  logger.verbose('server$gameDeployTrait:', gameId, cardId, traitType, animalId, linkedAnimalId);
  dispatch(Object.assign(
    gameDeployTrait(gameId, cardId, traitType, animalId, linkedAnimalId)
    , {meta: {users: selectPlayers4Sockets(getState, gameId)}}
  ));
};

// gameDeployAnimal || gameDeployTrait > gameDeployNext > gameNextPlayer || gameFinishDeploy
export const server$gameDeployNext = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (game.getPlayer(userId).hand.size !== 0) {
    dispatch(server$game(gameId, gameNextPlayer(gameId)));
  } else {
    dispatch(server$gameFinishDeploy(gameId, userId));
  }
};

// gameDeployNext || gameEndTurnRequest > gameFinishDeploy > gameEndTurn && (gameNextPlayer || gameStartEat)
export const server$gameFinishDeploy = (gameId, userId) => (dispatch, getState) => {
  dispatch(Object.assign(gameEndTurn(gameId, userId), {
    meta: {users: selectPlayers4Sockets(getState, gameId)}
  }));
  const game = selectGame(getState, gameId);
  if (game.players.every(player => player.ended)) {
    const food = game.generateFood();
    dispatch(Object.assign(gameStartEat(gameId, food), {
      meta: {users: selectPlayers4Sockets(getState, gameId)}
    }));
  } else {
    dispatch(server$game(gameId, gameNextPlayer(gameId)));
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

// gameNextPlayer
export const gameNextPlayer = (gameId) => ({
  type: 'gameNextPlayer'
  , data: {gameId}
});

// ===== EATING!

export const gameStartEat = (gameId, food) => ({
  type: 'gameStartEat'
  , data: {gameId, food}
});

export const server$gameFinishFeeding = (gameId, userId) => (dispatch, getState) => {
  logger.verbose('server$gameFinishFeeding', userId);
  dispatch(Object.assign(gameEndTurn(gameId, userId), {
    meta: {users: selectPlayers4Sockets(getState, gameId)}
  }));
  const game = selectGame(getState, gameId);
  if (game.players.every(player => player.ended)) {
    dispatch(server$gameExtict(gameId));
  } else {
    dispatch(server$game(gameId, gameNextPlayer(gameId)));
  }
};

// ===== EXTINCT!

const animalStarve = (gameId, animalId) => ({
  type: 'animalStarve'
  , data: {gameId, animalId}
});

const gameStartDeploy = (gameId) => ({
  type: 'gameStartDeploy'
  , data: {gameId}
});

const gameEventExtict = (gameId) => ({
  type: 'gameEventExtict'
  , data: {gameId}
});

export const server$gameExtict = (gameId) => (dispatch, getState) => {
  //console.log('server$gameExtinct')
  const game = selectGame(getState, gameId);
  const cardNeedToPlayer = {};
  const cardGivePerPlayer = {};
  let deckSize = game.deck.size;

  game.players.forEach((player) => {
    cardGivePerPlayer[player.id] = 0;
    cardNeedToPlayer[player.id] = 1;
    player.continent.forEach((animal) => {
      if (!animal.canSurvive() || animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED)) {
        dispatch(server$game(gameId, animalStarve(gameId, animal.id)));
      } else {
        cardNeedToPlayer[player.id] += 1;
      }
    });
    if (player.continent.size === 0 && player.hand.size === 0) {
      cardNeedToPlayer[player.id] = 6;
    }
  });

  if (deckSize !== 0) {
    dispatch(server$game(gameId, gameStartDeploy(gameId)));
    const players = GameModel.sortPlayersFromIndex(selectGame(getState, gameId));
    while (deckSize > 0 && Object.keys(cardNeedToPlayer).length > 0) {
      players.forEach((player) => {
        if (deckSize <= 0) return true;
        if (cardNeedToPlayer[player.id] > 0) {
          cardNeedToPlayer[player.id] -= 1;
          dispatch(server$gameGiveCards(gameId, player.id, 1));
          deckSize--;
        } else {
          delete cardNeedToPlayer[player.id];
        }
      });
    }
  } else {
    dispatch(server$game(gameId, gameEnd(gameId, selectGame(getState, gameId))));
  }
};

// ===== WIN!

const gameEnd = (gameId, game) => ({
  type: 'gameEnd'
  , data: {gameId, game}
});

export const gameClientToServer = {
  gameCreateRequest: ({roomId, seed}, meta) => (dispatch, getState) => {
    if (process.env.NODE_ENV === 'production') seed = null;
    const userId = meta.user.id;
    const room = getState().getIn(['rooms', roomId]);
    const validation = room.validateCanStart(userId);
    if (validation === true) {
      const game = !seed
        ? GameModel.new(room)
        : GameModel.parse(room, seed);
      dispatch(server$gameCreateSuccess(game));
    } else {
      dispatch(actionError(userId, validation));
    }
  }
  , gameReadyRequest: ({gameId, ready}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    dispatch(server$game(gameId, gamePlayerReadyChange(gameId, userId, ready)));
    /*
     * Actual starting
     * */
    const newGame = selectGame(getState, gameId);
    if (!newGame.started && newGame.players.every(player => player.ready)) {
      const INITIAL_HAND_SIZE = 6;
      //new Array(INITIAL_HAND_SIZE).fill().every(() => {
      //  return true;
      //})
      dispatch(server$gameStart(gameId));
      newGame.players.forEach((player) => {
        dispatch(server$gameGiveCards(gameId, player.id, INITIAL_HAND_SIZE));
      });
    }
  }
  , gameEndTurnRequest: ({gameId}, {user: {id: userId}}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId);
    if (game.status.phase === PHASE.DEPLOY) {
      dispatch(server$gameFinishDeploy(gameId, userId));
    } else {
      dispatch(server$gameFinishFeeding(gameId, userId));
    }
  }
  , gameDeployAnimalRequest: ({gameId, cardId, animalPosition = 0}, {user: {id: userId}}) => (dispatch, getState) => {
    // console.time('gameDeployAnimalRequest body');
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.DEPLOY);
    checkValidAnimalPosition(game, userId, animalPosition);
    const cardIndex = checkPlayerHasCard(game, userId, cardId);
    const card = game.getPlayer(userId).hand.get(cardIndex);
    const animal = AnimalModel.new(userId);
    logger.verbose('selectGame > gameDeployAnimalRequest:', card);
    // console.timeEnd('gameDeployAnimalRequest body');
    // console.time('server$gameDeployAnimal');
    dispatch(server$gameDeployAnimal(gameId, userId, animal, parseInt(animalPosition), cardIndex));
    // console.timeEnd('server$gameDeployAnimal');
    // console.time('server$gameDeployNext');
    dispatch(server$gameDeployNext(gameId, userId));
    // console.timeEnd('server$gameDeployNext');
  }
  , gameDeployTraitRequest: ({gameId, cardId, animalId, alternateTrait, linkId}, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkPlayerTurnAndPhase(game, userId, PHASE.DEPLOY);

    const cardIndex = checkPlayerHasCard(game, userId, cardId);
    const card = game.players.get(userId).hand.get(cardIndex);
    const cardTrait = !alternateTrait ? card.trait1 : card.trait2;
    if (!cardTrait) {
      throw new ActionCheckError(`checkCardHasTrait@Game(${game.id})`, 'Card(%s;%s) doesn\'t have trait (%s)'
        , card.trait1 && card.trait1.type
        , card.trait2 && card.trait2.type
        , cardTrait);
    }

    const {playerId, animal} = game.locateAnimal(animalId);
    if (!animal) {
      throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Player#%s doesn\'t have Animal#%s', playerId, animalId);
    }

    const {playerId: linkedPlayerId, animal: linkedAnimal} = game.locateAnimal(linkId);

    if (cardTrait.cardTargetType & CTT_PARAMETER.SELF)
      if (playerId !== userId)
        throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(ANIMAL_SELF) User#%s doesn't have Animal#%s`, userId, animalId);
    if (cardTrait.cardTargetType & CTT_PARAMETER.ENEMY)
      if (playerId === userId)
        throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(ANIMAL_ENEMY) User#%s applies to self`, userId);
    if (cardTrait.cardTargetType & CTT_PARAMETER.LINK) {
      if (animal === linkedAnimal)
        throw new ActionCheckError(`CheckCardTargetType(${game.id})`, 'Player#%s want to link Animal#%s to itself', playerId, linkedAnimal);
      if (!linkedAnimal)
        throw new ActionCheckError(`checkPlayerHasAnimal(${game.id})`, 'Player#%s doesn\'t have linked Animal#%s', playerId, linkedAnimal);
      if (cardTrait.cardTargetType & CTT_PARAMETER.SELF)
        if (linkedPlayerId !== userId)
          throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(LINK_SELF) Player(%s) linking to Player(%s)`, playerId, linkedPlayerId);
      if (cardTrait.cardTargetType & CTT_PARAMETER.ENEMY)
        if (linkedPlayerId !== playerId)
          throw new ActionCheckError(`checkCardTargetType(${game.id})`, `CardType(LINK_ENEMY) Player(%s) linking to Player(%s)`, playerId, linkedPlayerId);
    }

    if (cardTrait.checkTraitPlacement && !cardTrait.checkTraitPlacement(animal))
      throw new ActionCheckError(`gameDeployTraitRequest(${game.id})`, `Trait(%s) failed checkTraitPlacement on Animal(%s)`, cardTrait.type, animal.id);

    const trait = !linkedAnimal ? TraitModel.new(cardTrait.type).attachTo(animal) : TraitModel.LinkBetween(cardTrait.type, animal, linkedAnimal);
    dispatch(server$gameDeployTrait(gameId, cardId, cardTrait.type, animal.id, linkedAnimal ? linkedAnimal.id : void 0));
    dispatch(server$gameDeployNext(gameId, userId));
  }
};

/*
 * gameServerToClient
 * */
export const gameServerToClient = {
  gameCreateSuccess: (({game}, currentUserId) => (dispatch) => {
    dispatch(gameCreateSuccess(GameModelClient.fromServer(game, currentUserId)));
    dispatch(redirectTo('/game'));
  })
  , gameStart: ({gameId}) => gameStart(gameId)
  , gameStartDeploy: ({gameId}) => gameStartDeploy(gameId)
  , gameStartEat: ({gameId, food}) => gameStartEat(gameId, food)
  , gamePlayerReadyChange: ({gameId, userId, ready}) => gamePlayerReadyChange(gameId, userId, ready)
  , gameGiveCards: ({gameId, userId, cards}) =>
    gameGiveCards(gameId, userId, List(cards).map(card => CardModel.fromServer(card)))
  , gameDeployAnimal: ({gameId, userId, animal, animalPosition, cardPosition}) =>
    gameDeployAnimal(gameId, userId, AnimalModel.fromServer(animal), animalPosition, cardPosition)
  , gameDeployTrait: ({gameId, cardId, traitType, animalId, linkedAnimalId}) =>
    gameDeployTrait(gameId, cardId, traitType, animalId, linkedAnimalId)
  , gameNextPlayer: ({gameId}) => gameNextPlayer(gameId)
  , gameEndTurn: ({gameId, userId}) => gameEndTurn(gameId, userId)
  , gameEnd: ({gameId, game}, currentUserId) => gameEnd(gameId, GameModelClient.fromServer(game, currentUserId))
  , gamePlayerLeft: ({gameId, userId}, currentUserId) => (dispatch, getState) => {
    dispatch(gamePlayerLeftNotification(gameId, userId));
    if (currentUserId === userId) {
      dispatch(gamePlayerLeft(gameId, userId));
      dispatch(redirectTo(`/`));
    }
  }
  , animalStarve: ({gameId, animalId}) => animalStarve(gameId, animalId)
};










