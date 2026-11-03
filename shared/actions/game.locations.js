import logger from '~/shared/utils/logger';
import {List} from 'immutable';

import ActionCheckError from '../models/ActionCheckError';
import * as ERR from '../errors/ERR';
import * as tt from '../models/game/evolution/traitTypes';
import {TraitModel} from '../models/game/evolution/TraitModel';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {PHASE} from '../models/game/GameModel';
import {TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE} from '../models/game/evolution/constants';
import {
  LOCATION
  , LOCATIONS
  , LOCATIONS_COOLDOWN_LINK
  , LOCATIONS_RESTART_ANIMALS
  , MigrationRecord
  , getForcedAnimals
  , getLocationLockLink
  , getMigration
  , isLocationsGame
} from '../models/game/evolution/locations';

import {selectGame} from '../selectors';
import {server$game} from './generic';
import {
  checkGameDefined
  , checkGameHasUser
  , checkGamePhase
  , checkPlayerCanAct
  , getOrThrowPlayerAnimal
  , throwError
} from './checks';
import {
  getErrorOfForcedAnimals
  , getErrorOfMigration
  , getErrorOfSuckerfishFollow
  , getSuckerfishCandidates
  , getSuckerfishDeciders
} from './locations.checks';
import {
  server$startCooldownList
  , startCooldown
  , server$traitAnimalAttachTrait
  , server$traitAnimalRemoveTrait
  , server$checkForViviparous
} from './trait';
import {
  server$playerActed
  , server$addTurnTimeout
  , server$gameCancelTurnTimeout
  , server$gameDeployAnimalFromHand
} from './game';
import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';

export const LOCATION_CHANGE_REASON = {
  SWIMMING: 'SWIMMING'
  , MIGRATION: 'MIGRATION'
  , SUCKERFISH: 'SUCKERFISH'
};

// region Client requests
export const traitMigrationRequest = (animalId, location) => (dispatch, getState) => dispatch({
  type: 'traitMigrationRequest'
  , data: {gameId: getState().get('game').id, animalId, location}
  , meta: {server: true}
});

export const traitSuckerfishRequest = (animalIds) => (dispatch, getState) => dispatch({
  type: 'traitSuckerfishRequest'
  , data: {
    gameId: getState().get('game').id
    , migrationId: getState().getIn(['game', 'locations', 'migration', 'id'])
    , animalIds
  }
  , meta: {server: true}
});
// endregion

// region Transport actions
const animalChangeLocation = (gameId, animalId, location, reason) => ({
  type: 'animalChangeLocation'
  , data: {gameId, animalId, location, reason}
});

const gameLocationsSetForcedAnimals = (gameId, playerId, count) => ({
  type: 'gameLocationsSetForcedAnimals'
  , data: {gameId, playerId, count}
});

const gameMigrationStart = (gameId, migration) => ({
  type: 'gameMigrationStart'
  , data: {gameId, migration}
});

const gameMigrationNextDecider = (gameId, time) => ({
  type: 'gameMigrationNextDecider'
  , data: {gameId, time}
});

const gameMigrationEnd = (gameId) => ({
  type: 'gameMigrationEnd'
  , data: {gameId}
});
// endregion

// region Location of the round
/**
 * In a round of the feeding phase the player takes food and uses traits in one location only.
 * The first action locks the other locations and the migration until the next player.
 */
export const server$locationsLockForAction = (gameId, playerId, location) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (!isLocationsGame(game)) return;
  if (game.cooldowns.checkFor(LOCATIONS_COOLDOWN_LINK.MIGRATION_LOCK, playerId)) return;
  logger.debug(`server$locationsLockForAction: ${playerId} acts in ${location}`);
  dispatch(server$startCooldownList(gameId, LOCATIONS
    .filter(otherLocation => otherLocation !== location)
    .map(otherLocation => startCooldown(gameId, getLocationLockLink(otherLocation)
      , TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, playerId))
    .concat([startCooldown(gameId, LOCATIONS_COOLDOWN_LINK.MIGRATION_LOCK
      , TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, playerId)])
  ));
};
// endregion

// region Moving animals
/**
 * Moves the animal. Animals in the Ocean don't have TraitSwimming: it goes to the discard when the animal
 * gets into the Ocean and is taken back from the discard when the animal leaves it.
 */
export const server$locationsMoveAnimal = (gameId, animalId, location, reason) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const animal = game.locateAnimal(animalId);
  if (!animal || animal.location === location) return;
  const from = animal.location;
  logger.debug(`server$locationsMoveAnimal: ${animalId} ${from} > ${location} (${reason})`);
  dispatch(server$game(gameId, animalChangeLocation(gameId, animalId, location, reason)));
  if (location === LOCATION.OCEAN) {
    const traitSwimming = animal.hasTrait(tt.TraitSwimming, true);
    if (traitSwimming) {
      dispatch(server$traitAnimalRemoveTrait(selectGame(getState, gameId), animal, traitSwimming));
    }
  } else if (from === LOCATION.OCEAN) {
    dispatch(server$traitAnimalAttachTrait(selectGame(getState, gameId), animal, TraitModel.new(tt.TraitSwimming)));
  }
};

/**
 * Paired traits of the animals that are now in different locations go to the discard.
 * TraitTrematode can link animals of two different players, so all the links are checked.
 */
export const server$locationsBreakLinks = (gameId) => (dispatch, getState) => {
  selectGame(getState, gameId).players.forEach(player => player.continent.forEach(animal => animal.traits
    .filter(trait => !!trait.linkAnimalId)
    .forEach(trait => {
      const game = selectGame(getState, gameId);
      const hostAnimal = game.locateAnimal(trait.hostAnimalId, player.id);
      const linkedAnimal = game.locateAnimal(trait.linkAnimalId);
      if (!hostAnimal || !linkedAnimal || !hostAnimal.traits.has(trait.id)) return;
      if (hostAnimal.location === linkedAnimal.location) return;
      logger.debug(`server$locationsBreakLinks: ${trait.type} ${hostAnimal.id} - ${linkedAnimal.id}`);
      const linkedTrait = linkedAnimal.traits.get(trait.linkId);
      // TraitTrematode increases need of food, so an animal can become fed when it's discarded
      dispatch(server$checkForViviparous(gameId, hostAnimal.id, () =>
        dispatch(server$checkForViviparous(gameId, linkedAnimal.id, () => {
          dispatch(server$traitAnimalRemoveTrait(game, hostAnimal, trait));
          // the pair of the trait is removed with it only within one player
          const linkedAnimalNow = selectGame(getState, gameId).locateAnimal(linkedAnimal.id);
          if (linkedTrait && linkedAnimalNow && linkedAnimalNow.traits.has(linkedTrait.id)) {
            dispatch(server$traitAnimalRemoveTrait(selectGame(getState, gameId), linkedAnimalNow, linkedTrait));
          }
        }))
      ));
    })));
};

// TraitSwimming played on an animal on a continent sends it to the Ocean
export const server$locationsAfterDeployTrait = (gameId, traitType, animalId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (!isLocationsGame(game) || traitType !== tt.TraitSwimming) return;
  const animal = game.locateAnimal(animalId);
  if (!animal || animal.location === LOCATION.OCEAN) return;
  dispatch(server$locationsMoveAnimal(gameId, animalId, LOCATION.OCEAN, LOCATION_CHANGE_REASON.SWIMMING));
  dispatch(server$locationsBreakLinks(gameId));
};
// endregion

// region Migration
const makeMigrationTimeoutId = (gameId) => `Locations#Migration#${gameId}`;

export const server$locationsMigrate = (gameId, userId, animalId, location) => (dispatch, getState) => {
  const animal = selectGame(getState, gameId).locateAnimal(animalId, userId);
  const from = animal.location;
  logger.verbose(`server$locationsMigrate: ${animalId} ${from} > ${location}`);

  // Once per turn for the animal. In this round the player only migrates.
  dispatch(server$startCooldownList(gameId, [
    startCooldown(gameId, LOCATIONS_COOLDOWN_LINK.MIGRATION
      , TRAIT_COOLDOWN_DURATION.TURN, TRAIT_COOLDOWN_PLACE.ANIMAL, animalId)
  ].concat(LOCATIONS.map(lockedLocation => startCooldown(gameId, getLocationLockLink(lockedLocation)
    , TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId)))));

  dispatch(server$locationsMoveAnimal(gameId, animalId, location, LOCATION_CHANGE_REASON.MIGRATION));

  const migration = MigrationRecord.new(animal, from, location);
  const deciders = getSuckerfishDeciders(selectGame(getState, gameId), migration);

  // Paired traits are checked when the migrant and all the remoras that follow it have moved
  if (deciders.size > 0) {
    const turnRemainingTime = dispatch(server$gameCancelTurnTimeout(gameId));
    dispatch(server$game(gameId, gameMigrationStart(gameId, migration
      .set('deciders', deciders)
      .set('time', Date.now())
      .set('turnRemainingTime', turnRemainingTime))));
    dispatch(server$locationsMigrationAddTimeout(gameId));
  } else {
    dispatch(server$locationsBreakLinks(gameId));
    dispatch(server$playerActed(gameId, userId));
  }
};

export const server$locationsMigrationAddTimeout = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const migration = getMigration(game);
  if (!migration || game.status.paused) return;
  dispatch(addTimeout(game.settings.timeTraitResponse
    , makeMigrationTimeoutId(gameId)
    , server$locationsSuckerfishDecide(gameId, migration.id, migration.getDecider(), [])));
};

export const server$locationsMigrationPauseTimeout = (gameId) => cancelTimeout(makeMigrationTimeoutId(gameId));

export const server$locationsSuckerfishDecide = (gameId, migrationId, userId, animalIds) => (dispatch, getState) => {
  const migration = getMigration(selectGame(getState, gameId));
  if (!migration || migration.id !== migrationId || migration.getDecider() !== userId) return;
  logger.verbose(`server$locationsSuckerfishDecide: ${userId} [${animalIds}]`);
  dispatch(cancelTimeout(makeMigrationTimeoutId(gameId)));

  animalIds.forEach(animalId => {
    dispatch(server$locationsMoveAnimal(gameId, animalId, migration.to, LOCATION_CHANGE_REASON.SUCKERFISH));
  });

  dispatch(server$game(gameId, gameMigrationNextDecider(gameId, Date.now())));
  let game = selectGame(getState, gameId);
  let nextDecider = getMigration(game).getDecider();
  while (nextDecider && (
    !game.getPlayer(nextDecider).playing
    || getSuckerfishCandidates(game, nextDecider, migration).size === 0
  )) {
    dispatch(server$game(gameId, gameMigrationNextDecider(gameId, Date.now())));
    game = selectGame(getState, gameId);
    nextDecider = getMigration(game).getDecider();
  }

  if (nextDecider) {
    dispatch(server$locationsMigrationAddTimeout(gameId));
  } else {
    dispatch(server$locationsMigrationEnd(gameId));
  }
};

const server$locationsMigrationEnd = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const {migrantPid, turnRemainingTime} = getMigration(game);
  dispatch(server$game(gameId, gameMigrationEnd(gameId)));
  dispatch(server$locationsBreakLinks(gameId));
  if (game.status.currentPlayer === migrantPid && game.getPlayer(migrantPid).playing) {
    if (turnRemainingTime !== void 0) {
      dispatch(server$addTurnTimeout(gameId, void 0, turnRemainingTime));
    }
    dispatch(server$playerActed(gameId, migrantPid));
  }
};
// endregion

// region Restart (player without cards and animals)
export const server$locationsSetForcedAnimals = (gameId, playerId, cardsCount) => (dispatch, getState) => {
  const count = Math.min(LOCATIONS_RESTART_ANIMALS, cardsCount);
  if (count > 0) dispatch(server$game(gameId, gameLocationsSetForcedAnimals(gameId, playerId, count)));
};

export const server$locationsAnimalDeployed = (gameId, playerId) => (dispatch, getState) => {
  const forcedAnimals = getForcedAnimals(selectGame(getState, gameId), playerId);
  if (forcedAnimals > 0) {
    dispatch(server$game(gameId, gameLocationsSetForcedAnimals(gameId, playerId, forcedAnimals - 1)));
  }
};

// Turn timeout of a player who has to deploy animals: the first card of the hand becomes an animal
export const server$locationsForcedDeploy = (gameId, userId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (game.status.phase !== PHASE.DEPLOY || !getErrorOfForcedAnimals(game, userId)) return false;
  const player = game.getPlayer(userId);
  const card = player.hand.first();
  const animal = AnimalModel.new(userId, card.trait1).set('location', LOCATION.LAURASIA);
  logger.verbose(`server$locationsForcedDeploy: ${userId}`);
  dispatch(server$gameDeployAnimalFromHand(gameId, userId, animal, player.continent.size, card.id));
  dispatch(server$locationsAnimalDeployed(gameId, userId));
  dispatch(server$playerActed(gameId, userId));
  return true;
};
// endregion

export const locationsClientToServer = {
  traitMigrationRequest: ({gameId, animalId, location}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    checkPlayerCanAct(game, userId);
    const animal = getOrThrowPlayerAnimal(game, userId, animalId);
    throwError(getErrorOfMigration(game, animal, location));
    dispatch(server$locationsMigrate(gameId, userId, animalId, location));
  }
  , traitSuckerfishRequest: ({gameId, migrationId, animalIds}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    const migration = getMigration(game);
    if (!migration || migration.id !== migrationId) {
      throw new ActionCheckError(ERR.GAME_QUESTION_INCORRECT, {gameId, migrationId});
    }
    if (migration.getDecider() !== userId) {
      throw new ActionCheckError(ERR.GAME_PLAYER_ACT_ON_QUESTION, {gameId, userId});
    }
    const followers = List(animalIds || []).toOrderedSet().toList();
    followers.forEach(animalId => {
      const animal = getOrThrowPlayerAnimal(game, userId, animalId);
      throwError(getErrorOfSuckerfishFollow(game, animal, migration));
    });
    dispatch(server$locationsSuckerfishDecide(gameId, migration.id, userId, followers));
  }
};

export const locationsServerToClient = {
  animalChangeLocation: ({gameId, animalId, location, reason}) =>
    animalChangeLocation(gameId, animalId, location, reason)
  , gameLocationsSetForcedAnimals: ({gameId, playerId, count}) =>
    gameLocationsSetForcedAnimals(gameId, playerId, count)
  , gameMigrationStart: ({gameId, migration}) =>
    gameMigrationStart(gameId, MigrationRecord.fromJS(migration))
  , gameMigrationNextDecider: ({gameId, time}) => gameMigrationNextDecider(gameId, time)
  , gameMigrationEnd: ({gameId}) => gameMigrationEnd(gameId)
};
