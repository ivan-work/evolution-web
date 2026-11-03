import ERRORS from './errors';
import * as tt from '../models/game/evolution/traitTypes';
import {getTraitDataModel} from '../models/game/evolution/TraitModel';
import {TRAIT_ANIMAL_FLAG} from '../models/game/evolution/constants';
import {
  LOCATION
  , LOCATIONS
  , LOCATIONS_COOLDOWN_LINK
  , isContinent
  , isLocation
  , isLocationsGame
  , isSameLocation
  , getForcedAnimals
} from '../models/game/evolution/locations';

/**
 * Can the animal be moved from one location to another (by migration or following a migrant as a remora)?
 * - a regular animal moves between the continents only, it gets into the Ocean only by playing TraitSwimming;
 * - an animal from the Ocean moves to a continent and gets TraitSwimming from the discard;
 * - an animal with TraitSwimming moves from a continent to the Ocean and can't move between the continents
 *   (unless it has TraitFlight).
 */
export const getErrorOfAnimalMove = (animal, from, to) => {
  if (!isLocation(to) || from === to) return ERRORS.LOCATION_WRONG;
  if (to === LOCATION.OCEAN) {
    if (!animal.hasTrait(tt.TraitSwimming)) return ERRORS.LOCATION_OCEAN_NEEDS_SWIMMING;
  } else if (from === LOCATION.OCEAN) {
    const errorOfSwimming = getTraitDataModel(tt.TraitSwimming).getErrorOfTraitPlacement(animal);
    if (errorOfSwimming) return errorOfSwimming;
  } else if (animal.hasTrait(tt.TraitSwimming) && !animal.hasTrait(tt.TraitFlight)) {
    return ERRORS.LOCATION_SWIMMING_BETWEEN_CONTINENTS;
  }
  return false;
};

/**
 * TraitMigration moves the animal to another location.
 * TraitFlight lets an animal with 1 or 2 traits migrate between the continents as if it had TraitMigration.
 */
export const getErrorOfMigrationAbility = (animal, to) => {
  const from = animal.location;
  const traitMigration = animal.hasTrait(tt.TraitMigration);
  const errorOfMigration = traitMigration
    ? getErrorOfAnimalMove(animal, from, to)
    : ERRORS.LOCATION_CANT_MIGRATE;
  if (!errorOfMigration) return false;

  const traitFlight = animal.hasTrait(tt.TraitFlight);
  if (!traitFlight) return errorOfMigration;
  if (!isContinent(from) || !isContinent(to) || from === to) return traitMigration ? errorOfMigration : ERRORS.LOCATION_FLIGHT_CONTINENTS_ONLY;
  if (animal.getTraits(true).size > 2) return traitMigration ? errorOfMigration : ERRORS.LOCATION_FLIGHT_TOO_MANY_TRAITS;
  return false;
};

/**
 * Player-independent part of the migration check (phase and turn are checked by the request)
 */
export const getErrorOfMigration = (game, animal, to) => {
  if (!isLocationsGame(game)) return ERRORS.LOCATION_MODE;
  if (animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) return ERRORS.TRAIT_REGENERATION_DEAD;
  // Migration is declared instead of taking food and using traits in the round
  if (game.cooldowns.checkFor(LOCATIONS_COOLDOWN_LINK.MIGRATION_LOCK, animal.ownerId)) return ERRORS.COOLDOWN;
  // Once per turn
  if (game.cooldowns.checkFor(LOCATIONS_COOLDOWN_LINK.MIGRATION, null, animal.id)) return ERRORS.COOLDOWN;
  return getErrorOfMigrationAbility(animal, to);
};

export const getMigrationTargets = (game, animal) => LOCATIONS
  .filter(location => !getErrorOfMigration(game, animal, location));

/**
 * TraitSuckerfish: the animal moves together with an animal migrating from the same location
 */
export const getErrorOfSuckerfishFollow = (game, animal, migration) => {
  if (!animal.hasTrait(tt.TraitSuckerfish)) return ERRORS.TRAIT_ACTION_NO_TRAIT;
  if (animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) return ERRORS.TRAIT_REGENERATION_DEAD;
  if (animal.id === migration.migrantId) return ERRORS.TRAIT_TARGETING_SAME_ANIMAL;
  if (animal.location !== migration.from) return ERRORS.LOCATION_WRONG;
  return getErrorOfAnimalMove(animal, migration.from, migration.to);
};

export const getSuckerfishCandidates = (game, playerId, migration) => game.getPlayer(playerId).continent
  .filter(animal => !getErrorOfSuckerfishFollow(game, animal, migration))
  .toList();

// Migrating player decides first, then the others clockwise
export const getSuckerfishDeciders = (game, migration) => game
  .sortPlayersFromIndex(game.players, game.getPlayer(migration.migrantPid).index)
  .filter(player => player.playing && getSuckerfishCandidates(game, player.id, migration).size > 0)
  .map(player => player.id);

// New animals are deployed on the continents only
export const getErrorOfDeployLocation = (location) => isContinent(location) ? false : ERRORS.LOCATION_WRONG;

// Playing TraitSwimming moves the animal to the Ocean, so there's no point in playing it on an animal in the Ocean
export const getErrorOfLocationsTraitPlacement = (game, traitType, animal) => {
  if (!isLocationsGame(game)) return false;
  if (traitType === tt.TraitSwimming && animal.location === LOCATION.OCEAN) return ERRORS.LOCATION_ALREADY_IN_OCEAN;
  return false;
};

// Paired traits can't be played on animals from different locations
export const getErrorOfLocationsLink = (game, entity, linkedEntity) => (
  isSameLocation(game, entity, linkedEntity) ? false : ERRORS.LOCATION_LINK
);

// Restart: player has to deploy two of the received cards as animals
export const getErrorOfForcedAnimals = (game, playerId) => (
  getForcedAnimals(game, playerId) > 0 && game.getPlayer(playerId).hand.size > 0
    ? ERRORS.LOCATION_FORCED_ANIMALS
    : false
);
