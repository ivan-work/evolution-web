import logger from '~/shared/utils/logger';
import {List} from 'immutable';

import {selectGame, selectUsersInGame} from "../selectors";
import {server$game, to$, toUser$Client} from "./generic";
import PlantModel from "../models/game/evolution/plantarium/PlantModel";
import {
  server$autoFoodSharing,
  server$startCooldownList,
  server$traitActivate,
  server$traitNotify_Start,
  startCooldown
} from "./trait";
import {
  checkGameDefined,
  getOrThrowGameAnimal,
  getOrThrowGamePlant,
  checkGameHasUser,
  checkGamePhase,
  checkPlayerCanAct,
  getOrThrowPlayerAnimal, throwError
} from "./checks";
import {PHASE} from "../models/game/GameModel";
import {
  getErrorOfEntityTraitActivation,
  getErrorOfPlantAttack,
} from "./trait.checks";
import {server$huntStart_Plant} from "../models/game/evolution/traitsData/hunt";
import {
  HUNT_FLAG,
  TRAIT_COOLDOWN_DURATION,
  TRAIT_COOLDOWN_LINK,
  TRAIT_COOLDOWN_PLACE
} from "../models/game/evolution/constants";
import {server$playerActed} from "./game";
import {logTarget} from "./log.util";
import {getIntRandom} from "../utils/randomGenerator";
import * as ptt from "../models/game/evolution/plantarium/plantTraitTypes";
import {CardModel} from "../models/game/CardModel";

// region game
export const gameSpawnPlants = (gameId, plants) => ({
  type: 'gameSpawnPlants'
  , data: {gameId, plants}
});

export const server$gameSpawnPlants = (gameId, count) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  let deck = game.deckPlants;
  if (count > deck.size) {
    // No shuffling because it's a feature creep
    deck = deck.concat(game.deckPlantsDiscard);
  }
  const plants = deck.take(count).map(PlantModel.new);
  dispatch(server$game(gameId, gameSpawnPlants(gameId, plants)));
};

export const gameDeployPlant = (gameId, plant) => ({
  type: 'gameDeployPlant'
  , data: {gameId, plant}
});

export const server$gameDeployPlant = (gameId, plant) => server$game(gameId, gameDeployPlant(gameId, plant));
//endregion

// region plants
export const gamePlantAttackRequest = (plantId, targetId) => (dispatch, getState) => dispatch({
  type: 'gamePlantAttackRequest'
  , data: {
    gameId: getState().getIn(['game', 'id'])
    , plantId
    , targetId
  }
  , meta: {server: true}
});

const gamePlantUpdateFood = (gameId, plantId, amount) => ({
  type: 'gamePlantUpdateFood',
  data: {gameId, plantId, amount}
});

export const server$gamePlantUpdateFood = (gameId, plantId, amount) => server$game(gameId, gamePlantUpdateFood(gameId, plantId, amount));

export const plantTraitActivateRequest = (plantId, traitId, ...targets) => (dispatch, getState) => dispatch({
  type: 'plantTraitActivateRequest'
  , data: {
    gameId: getState().getIn(['game', 'id'])
    , plantId
    , traitId
    , targets
  }
  , meta: {server: true}
});

export const server$plantTraitActivate = (gameId, playerId, sourceAid, trait, ...targets) => (dispatch, getState) => {
  const logTargets = (targets || []).reduce(logTarget, []);
  const game = selectGame(getState, gameId);
  const sourceEntity = game.locateAnimal(sourceAid) || game.getPlant(sourceAid);
  if (!trait.getDataModel().transient) {
    dispatch(server$traitNotify_Start(game, sourceEntity, trait, ...logTargets));
  }
  logger.verbose('server$traitActivate:', sourceEntity.id, trait.type, ...logTargets);
  const traitData = trait.getDataModel();
  const result = dispatch(traitData.action(game, playerId, sourceEntity, trait, ...targets));
  logger.debug(`server$traitActivate [RESULT]: ${trait.type} (${!!result})`);
  return result;
};
// endregion

// region animal

// endregion

// region traits
const traitMoveCard = (gameId, fromPid, toPid, card) => ({
  type: 'traitMoveCard'
  , data: {gameId, fromPid, toPid, card}
});

export const server$traitMoveCard = (gameId, fromPid, toPid, cardId) => (dispatch, getState) => {
  const card = selectGame(getState, gameId).getPlayer(fromPid).hand.find(c => c.id === cardId);
  dispatch(traitMoveCard(gameId, fromPid, toPid, card));
  dispatch(toUser$Client(toPid, traitMoveCard(gameId, fromPid, toPid, card.toClient())));
  dispatch(to$({clientOnly: true, users: selectUsersInGame(getState, gameId).filter(uid => uid !== toPid)}
    , traitMoveCard(gameId, fromPid, toPid, card.toOthers().toClient())));
};

export const server$takeCardFromRandomPlayer = (game, toPid) => (dispatch, getState) => {
  let maxHand = 0;
  let players = [];
  game.getActualPlayers().forEach((player) => {
    if (player.hand.size > maxHand) {
      maxHand = player.hand.size;
      players = [];
    }
    if (maxHand > 0 && player.hand.size === maxHand && player.id !== toPid) {
      players.push(player.id);
    }
  });
  if (players.length > 0) {
    const fromPid = players[getIntRandom(0, players.length - 1)];
    const fromHand = game.getPlayer(fromPid).hand;
    const cardId = fromHand.get(getIntRandom(0, fromHand.size - 1)).id;
    logger.debug(`traitMoveCard: ${fromPid} > ${toPid} ${cardId}`);
    dispatch(server$traitMoveCard(game.id, fromPid, toPid, cardId));
  }
};
// endregion

export const plantsClientToServer = {
  gamePlantAttackRequest: ({gameId, plantId, targetId}, {userId}) => (dispatch, getState) => {
    if (!dispatch(server$autoFoodSharing(gameId, userId))) return;
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    checkPlayerCanAct(game, userId);
    const animal = getOrThrowGameAnimal(game, targetId);
    const plant = getOrThrowGamePlant(game, plantId);
    throwError(getErrorOfPlantAttack(game, animal, plant, userId));
    dispatch(server$startCooldownList(gameId, [
      startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId)
    ]));
    dispatch(server$huntStart_Plant(gameId, userId, plant, animal, HUNT_FLAG.PLANT_ATTACK));
  }
  , plantTraitActivateRequest: ({gameId, plantId, traitId, targets}, {userId}) => (dispatch, getState) => {
    logger.verbose('plantTraitActivateRequest', gameId, plantId, traitId, ...targets);
    let game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    const plant = getOrThrowGamePlant(game, plantId);
    const trait = plant.hasTrait(traitId);
    throwError(getErrorOfEntityTraitActivation(game, userId, plant, trait, ...targets));

    if (!trait.getDataModel().transient) checkPlayerCanAct(game, userId);

    const target = trait.getTarget(game, plant, ...targets);

    logger.debug('plantTraitActivateRequest', gameId, plantId, traitId, ...targets);
    const result = dispatch(server$plantTraitActivate(gameId, userId, plantId, trait, target));
    if (result === void 0) {
      throw new Error(`traitActivateRequest@Game(${gameId}): Animal(${plantId})-${trait.type}-(${targets.join(' ')}) result undefined`);
    }
    if (result) {
      dispatch(server$playerActed(gameId, userId));
    }
  }
};

export const plantsServerToClient = {
  gameSpawnPlants: ({gameId, plants}) => gameSpawnPlants(gameId, List(plants).map(PlantModel.fromJS))
  , gameDeployPlant: ({gameId, plant}) => gameDeployPlant(gameId, PlantModel.fromJS(plant))
  , gamePlantUpdateFood: ({gameId, plantId, amount}) => gamePlantUpdateFood(gameId, plantId, amount)
  , traitMoveCard: ({gameId, fromPid, toPid, card}) => traitMoveCard(gameId, fromPid, toPid, CardModel.fromServer(card))
};







