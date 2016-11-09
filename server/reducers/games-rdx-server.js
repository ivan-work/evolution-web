import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter, validateParameter} from '../../shared/utils';
import {Map, List} from 'immutable';
import {GameModel, PHASE} from '../../shared/models/game/GameModel';
import {CardModel} from '../../shared/models/game/CardModel';
import {CooldownList} from '../../shared/models/game/CooldownList';
import {AnimalModel} from '../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../shared/models/game/evolution/TraitModel';
import {FOOD_SOURCE_TYPE, CTT_PARAMETER} from '../../shared/models/game/evolution/constants';

export const gameStart = game => game
  .setIn(['started'], true)
  .setIn(['status', 'phase'], PHASE.DEPLOY)
  .setIn(['status', 'round'], 0);
//.setIn(['status', 'currentPlayer'], 0); // TODO RANDOMIZE

export const gamePlayerReadyChange = (game, {userId, ready}) => game
  .setIn(['players', userId, 'ready'], ready);

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

export const gameDeployTrait = (game, {cardId, traitType, animalId, linkedAnimalId}) => {
  const {playerId: cardOwnerId, cardIndex} = game.locateCard(cardId);
  const {playerId: animalOwnerId, animalIndex, animal} = game.locateAnimal(animalId);
  const {playerId: linkedAnimalOwnerId, animalIndex: linkedAnimalIndex, animal: linkedAnimal} = game.locateAnimal(linkedAnimalId);

  const traitData = TraitModel.new(traitType).dataModel;

  if (!(traitData.cardTargetType & CTT_PARAMETER.LINK)) {
    const deploy = TraitModel.new(traitType).attachTo(animal);
    return game
      .removeIn(['players', cardOwnerId, 'hand', cardIndex])
      .updateIn(['players', animalOwnerId, 'continent', animalIndex, 'traits'], traits => traits.push(deploy))
  } else  {
    const deploy = TraitModel.LinkBetween(
      traitType
      , animal
      , linkedAnimal
      , traitData.cardTargetType & CTT_PARAMETER.ONEWAY);

    return game
      .removeIn(['players', cardOwnerId, 'hand', cardIndex])
      .updateIn(['players', animalOwnerId, 'continent', animalIndex, 'traits'], traits => traits.push(deploy[0]))
      .updateIn(['players', linkedAnimalOwnerId, 'continent', linkedAnimalIndex, 'traits'], traits => traits.push(deploy[1]));
  }
};

export const playerActed = (game, {userId}) => {
  return game
    .setIn(['players', userId, 'acted'], true)
    .setIn(['players', userId, 'skipped'], 0)
    .update('cooldowns', cooldowns => cooldowns.eventNextAction());
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
    .setIn(['status', 'currentPlayer'], game.getIn(['status', 'roundPlayer']));
};

export const gameStartDeploy = (game) => {
  const roundPlayer = game.status.roundPlayer;
  const nextRoundPlayer = roundPlayer + 1 >= game.players.size
    ? 0
    : roundPlayer + 1;
  return game
    .update('players', players => players.map(player => player
      .set('ended', false)
      .set('skipped', 0)
      .update('continent', continent => continent.map(animal => animal.digestFood()))
    ))
    .setIn(['food'], 0)
    .setIn(['status', 'phase'], PHASE.DEPLOY)
    .updateIn(['status', 'turn'], turn => ++turn)
    .setIn(['status', 'round'], 0)
    .setIn(['status', 'roundPlayer'], nextRoundPlayer)
    .setIn(['status', 'currentPlayer'], nextRoundPlayer)
    .update('cooldowns', cooldowns => cooldowns.eventNextTurn());
};

export const gameNextPlayer = (game) => {
  //console.log('gameNextPlayer', game.players.toJS());
  const roundPlayer = game.getIn(['status', 'roundPlayer']);
  let currentPlayer = game.getIn(['status', 'currentPlayer']);
  const totalPlayers = game.players.size;
  let emergencyCount = game.players.size;
  let round = game.getIn(['status', 'round']);
  let roundChanged = false;
  do {
    --emergencyCount;
    ++currentPlayer;
    if (currentPlayer >= totalPlayers) {
      currentPlayer = 0;
    }
    if (currentPlayer === roundPlayer) {
      ++round;
      roundChanged = true;
    }
    const player = game.players.find(player => player.index === currentPlayer && player.playing);
    if (player && !player.ended) {
      break;
    }
  } while (emergencyCount >= 0);
  if (emergencyCount < 0) throw new Error('emergency count');
  return game
    .setIn(['status', 'round'], round)
    .setIn(['status', 'currentPlayer'], currentPlayer)
    .update('cooldowns', cooldowns => cooldowns.eventNextPlayer(roundChanged));
};

export const traitMoveFood = (game, {animalId, amount, sourceType, sourceId}) => {
  ensureParameter(animalId, 'string');
  ensureParameter(amount, 'number');
  const {playerId, animalIndex} = game.locateAnimal(animalId);
  const updatedGame = game
    .updateIn(['players', playerId, 'continent', animalIndex], animal => animal.receiveFood(amount));

  switch (sourceType) {
    case FOOD_SOURCE_TYPE.GAME:
      return updatedGame.update('food', food => food - amount);
    case FOOD_SOURCE_TYPE.ANIMAL_TAKE:
      const {playerId: takenFromPid, animalIndex: takenFromAix} = game.locateAnimal(sourceId);
      return updatedGame
        .updateIn(['players', takenFromPid, 'continent', takenFromAix, 'food'], food => Math.max(food - 1, 0));
    default:
      return updatedGame;
  }
};

export const traitKillAnimal = (game, {targetAnimalId}) => {
  ensureParameter(targetAnimalId, 'string');
  const {playerId, animalIndex} = game.locateAnimal(targetAnimalId);
  return game
    .removeIn(['players', playerId, 'continent', animalIndex])
    .updateIn(['players', playerId, 'continent'], continent => continent
      .map(animal => animal.update('traits', traits => traits
        .filter(trait => trait.linkAnimalId !== targetAnimalId))))
};

export const traitAnimalRemoveTrait = (game, {sourcePid, sourceAid, traitIndex}) => {
  ensureParameter(sourcePid, 'string');
  ensureParameter(sourceAid, 'string');
  ensureParameter(traitIndex, 'number');
  const {playerId, animalIndex} = game.locateAnimal(sourceAid);
  const traitId = game.getIn(['players', sourcePid, 'continent', animalIndex, 'traits', traitIndex, 'id'])
  return game
    .removeIn(['players', sourcePid, 'continent', animalIndex, 'traits', traitIndex])
    .updateIn(['players', sourcePid, 'continent'], continent => continent
      .map(animal => animal.update('traits', traits => traits
        .filter(trait => trait.linkId !== traitId))))
};

export const animalStarve = (game, {animalId}) => {
  const {playerId, animalIndex} = game.locateAnimal(animalId);
  return game
    .removeIn(['players', playerId, 'continent', animalIndex])
    .updateIn(['players', playerId, 'continent'], continent => continent
      .map(animal => animal.update('traits', traits => traits
        .filter(trait => trait.linkAnimalId !== animalId))))
};

export const startCooldown = (game, {link, duration, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.startCooldown(link, duration, place, placeId));

// Transferring new game for game.end
export const gameEnd = (state, {game}) => game.end();

export const gamePlayerLeft = (game, {userId}) => game
  .setIn(['players', userId, 'playing'], false);

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => state.set(game.id, game)
  , gameDestroy: (state, data) => state.remove(data.gameId)
  , gameLeave: (state, data) => state.update(data.gameId, game => gameLeave(game, data))
  , gameStart: (state, data) => state.update(data.gameId, game => gameStart(game, data))
  , gamePlayerReadyChange: (state, data) => state.update(data.gameId, game => gamePlayerReadyChange(game, data))
  , gameGiveCards: (state, data) => state.update(data.gameId, game => gameGiveCards(game, data))
  , gameNextPlayer: (state, data) => state.update(data.gameId, game => gameNextPlayer(game, data))
  , gameDeployAnimal: (state, data) => state.update(data.gameId, game => gameDeployAnimal(game, data))
  , gameDeployTrait: (state, data) => state.update(data.gameId, game => gameDeployTrait(game, data))
  , gameEndTurn: (state, data) => state.update(data.gameId, game => gameEndTurn(game, data))
  , gameEnd: (state, data) => state.update(data.gameId, game => gameEnd(game, data))
  , gamePlayerLeft: (state, data) => state.update(data.gameId, game => gamePlayerLeft(game, data))
  , gameStartEat: (state, data) => state.update(data.gameId, game => gameStartEat(game, data))
  , gameStartDeploy: (state, data) => state.update(data.gameId, game => gameStartDeploy(game, data))
  , playerActed: (state, data) => state.update(data.gameId, game => playerActed(game, data))
  , traitMoveFood: (state, data) => state.update(data.gameId, game => traitMoveFood(game, data))
  , startCooldown: (state, data) => state.update(data.gameId, game => startCooldown(game, data))
  , traitKillAnimal: (state, data) => state.update(data.gameId, game => traitKillAnimal(game, data))
  , traitAnimalRemoveTrait: (state, data) => state.update(data.gameId, game => traitAnimalRemoveTrait(game, data))
  , animalStarve: (state, data) => state.update(data.gameId, game => animalStarve(game, data))
});