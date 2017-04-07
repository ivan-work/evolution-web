import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter, validateParameter} from '~/shared/utils';
import {Map, List} from 'immutable';
import {GameModel, PHASE} from '../../shared/models/game/GameModel';
import {CardModel} from '../../shared/models/game/CardModel';
import {CooldownList} from '../../shared/models/game/CooldownList';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../shared/models/game/evolution/TraitModel';
import {FOOD_SOURCE_TYPE} from '../../shared/models/game/evolution/constants';

export const gameStart = game => game
  .setIn(['started'], true)
  .setIn(['status', 'phase'], PHASE.DEPLOY)
  .setIn(['status', 'round'], 0)
  .setIn(['status', 'player'], 0);

export const gamePlayerStatusChange = (game, {userId, status}) => game
  .setIn(['players', userId, 'status'], status);

export const gameGiveCards = (game, {userId, cards}) => {
  ensureParameter(userId, 'string');
  ensureParameter(cards, List);
  return game
    .update('deck', deck => deck.skip(cards.size))
    .updateIn(['players', userId, 'hand'], hand => hand.concat(cards));
};

export const gameDeployAnimal = (game, {userId, animal, animalPosition, cardPosition}) => {
  ensureParameter(userId, 'string');
  ensureParameter(animal, AnimalModel);
  ensureParameter(cardPosition, 'number');
  ensureParameter(animalPosition, 'number');
  return game
    .removeIn(['players', userId, 'hand', cardPosition])
    .updateIn(['players', userId, 'continent'], continent => continent.insert(animalPosition, animal))
};

export const gameDeployTrait = (game, {userId, cardId, animalId, trait}) => {
  ensureParameter(userId, 'string');
  ensureParameter(cardId, 'string');
  ensureParameter(animalId, 'string');
  ensureParameter(trait, TraitModel);
  const cardIndex = game.getIn(['players', userId, 'hand']).findIndex(card => card.id === cardId);
  const animalIndex = game.getIn(['players', userId, 'continent']).findIndex(animal => animal.id === animalId);
  return game
    .removeIn(['players', userId, 'hand', cardIndex])
    .updateIn(['players', userId, 'continent', animalIndex, 'traits'], traits => traits.push(trait))
};

export const gameNextPlayer = (game) => {
  //console.log('gameNextPlayer', game.players.toJS());
  let playerIndex = game.getIn(['status', 'player']);
  let emergencyCount = game.players.size;
  let totalPlayers = game.players.size;
  let round = game.getIn(['status', 'round']);
  let roundChanged = false;
  do {
    --emergencyCount;
    ++playerIndex;
    if (playerIndex >= totalPlayers) {
      ++round;
      roundChanged = true;
      playerIndex = 0;
    }
    const player = game.players.find(player => player.index === playerIndex);
    if (player && !player.ended) {
      break;
    }
  } while (emergencyCount >= 0);
  if (emergencyCount < 0) throw new Error('emergency count');
  return game
    .setIn(['status', 'round'], round)
    .setIn(['status', 'player'], playerIndex)
    .update('cooldowns', cooldowns => cooldowns.eventNextPlayer(roundChanged));
};

export const playerActed = (game, {userId}) => {
  return game
    .setIn(['players', userId, 'acted'], true)
    .setIn(['players', userId, 'skipped'], 0);
};

export const gameEndTurn = (game, {userId}) => {
  //console.log('gameEndTurn for ' + userId);
  ensureParameter(userId, 'string');
  return game
    .updateIn(['players', userId], player => {
      //console.log(`skipped: ${player.skipped}, acted: ${player.acted}`);
      //const ended = game.status.phase === PHASE.FEEDING
      //  ? player.skipped > 0
      //  : true;
      const ended = !player.acted;
      if (ended) {
        logger.silly(`Player#${player.id} ended by skipping.`);
      }
      return player
        .set('acted', false)
        .set('ended', ended)
        .set('skipped', ended || player.acted ? 0 : 1 + player.skipped)
    });
};

export const gameStartEat = (game, {food}) => {
  ensureParameter(food, 'number');
  return game
    .update('players', players => players.map(player => player
      .set('ended', false)
      .set('skipped', 0)
    ))
    .setIn(['food'], food)
    .setIn(['status', 'phase'], PHASE.FEEDING)
    .setIn(['status', 'round'], 0)
    .setIn(['status', 'player'], 0);
};

export const gameStartDeploy = (game) => {
  return game
    .update('players', players => players.map(player => player
      .set('ended', false)
      .set('skipped', 0)
      .update('continent', animal => animal.map(animal => animal
        .set('food', 0)
      ))
    ))
    .setIn(['food'], 0)
    .setIn(['status', 'phase'], PHASE.DEPLOY)
    .updateIn(['status', 'turn'], turn => ++turn)
    .setIn(['status', 'round'], 0)
    .setIn(['status', 'player'], 0);
};

export const traitMoveFood = (game, {animalId, amount, sourceType, sourceId}) => {
  ensureParameter(animalId, 'string');
  ensureParameter(amount, 'number');
  const {playerId, animalIndex} = game.locateAnimal(animalId);
  const updatedGame = game
    .updateIn(['players', playerId, 'continent', animalIndex, 'food'], food => food + amount);

  switch (sourceType) {
    case FOOD_SOURCE_TYPE.GAME:
      return updatedGame.update('food', food => food - amount);
    default:
      return updatedGame;
  }
};

export const traitKillAnimal = (game, {targetAnimalId}) => {
  ensureParameter(targetAnimalId, 'string');
  const {playerId, animalIndex} = game.locateAnimal(targetAnimalId);
  return game
    .removeIn(['players', playerId, 'continent', animalIndex])
};

export const animalStarve = (game, {userId, animalId}) => {
  const {playerId, animalIndex} = game.locateAnimal(animalId);
  return game
    .removeIn(['players', playerId, 'continent', animalIndex])
};

export const startCooldown = (game, {link, duration, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.startCooldown(link, duration, place, placeId));

export const gameEnd = (state, {game}) => {
  // Player score
  // Player (wins/losses) score achievements
  const scoreboard = [];
  let winnerId = null;
  let maxScore = 0;
  game.players.forEach((player, playerId) => {
    const score = player.countScore();
    if (score > maxScore) {
      winnerId = playerId;
      maxScore = score;
    }
    scoreboard.push({
      playerId
      , score
    })
  });
  return game
    .setIn(['status', 'phase'], PHASE.FINAL)
    .set('scoreboardFinal', scoreboard.sort((p1, p2) => p1.score < p2.score))
    .set('winnerId', winnerId);
};

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => state.set(game.id, game)
  , roomExitSuccess: (state, {roomId, userId}) => {
    let game = state.find(game => game.roomId === roomId);
    if (!game) return state;
    const updGame = game.leave(userId);
    return !updGame
      ? state.remove(game.id)
      : state.set(game.id, updGame);
  }
  , gameStart: (state, data) => state.update(data.gameId, game => gameStart(game, data))
  , gamePlayerStatusChange: (state, data) => state.update(data.gameId, game => gamePlayerStatusChange(game, data))
  , gameGiveCards: (state, data) => state.update(data.gameId, game => gameGiveCards(game, data))
  , gameNextPlayer: (state, data) => state.update(data.gameId, game => gameNextPlayer(game, data))
  , gameDeployAnimal: (state, data) => state.update(data.gameId, game => gameDeployAnimal(game, data))
  , gameDeployTrait: (state, data) => state.update(data.gameId, game => gameDeployTrait(game, data))
  , gameEndTurn: (state, data) => state.update(data.gameId, game => gameEndTurn(game, data))
  , gameEnd: (state, data) => state.update(data.gameId, game => gameEnd(game, data))
  , gameStartEat: (state, data) => state.update(data.gameId, game => gameStartEat(game, data))
  , gameStartDeploy: (state, data) => state.update(data.gameId, game => gameStartDeploy(game, data))
  , playerActed: (state, data) => state.update(data.gameId, game => playerActed(game, data))
  , traitMoveFood: (state, data) => state.update(data.gameId, game => traitMoveFood(game, data))
  , startCooldown: (state, data) => state.update(data.gameId, game => startCooldown(game, data))
  , traitKillAnimal: (state, data) => state.update(data.gameId, game => traitKillAnimal(game, data))
  , animalStarve: (state, data) => state.update(data.gameId, game => animalStarve(game, data))
});