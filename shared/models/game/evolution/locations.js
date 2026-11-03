import {Record, Map, List} from 'immutable';
import uuid from 'uuid';

import * as tt from './traitTypes';
import {TRAIT_ANIMAL_FLAG} from './constants';
import ERRORS from '../../../actions/errors';

/**
 * Locations of the "Continents" addon (optional mode, room setting `continentsLocations`).
 * Animals live on one of two continents (Laurasia, Gondwana) or in the Ocean,
 * every location has its own food base.
 */

export const LOCATION = {
  LAURASIA: 'LAURASIA'
  , GONDWANA: 'GONDWANA'
  , OCEAN: 'OCEAN'
};

export const LOCATIONS = [LOCATION.LAURASIA, LOCATION.GONDWANA, LOCATION.OCEAN];

export const CONTINENTS = [LOCATION.LAURASIA, LOCATION.GONDWANA];

export const isContinent = (location) => location === LOCATION.LAURASIA || location === LOCATION.GONDWANA;

export const isLocation = (location) => !!~LOCATIONS.indexOf(location);

// Rules of the locations don't cover plants and the fan addons, so the mode is available with the official decks only
export const isLocationsModeSettings = (settings) => !!settings
  && !!settings.addon_continents
  && !!settings.continentsLocations
  && !settings.addon_plantarium
  && !settings.addon_customff
  && !settings.addon_lifecycle;

export const isLocationsGame = (game) => !!game && !!game.locations;

// "Continents" rules: initial hand and the restart of a player without cards and animals
export const LOCATIONS_STARTING_HAND = 10;
export const LOCATIONS_RESTART_ANIMALS = 2;

/**
 * Food base table of the rules. Laurasia uses the coloured dice, Gondwana uses the white ones.
 * [players]: (rollDice) => [Laurasia, Gondwana, Ocean]
 */
export const LOCATIONS_FOOD_TABLE = [
  null
  , null
  , (d) => [d(), d() + 2, 3]
  , (d) => [d(), d() + d(), 4]
  , (d) => [d() + 2, d() + d(), 5]
  , (d) => [d() + 3, d() + d() + 2, 6]
  , (d) => [d() + 5, d() + d() + 3, 7]
  , (d) => [d() + d() + 2, d() + d() + d() + 2, 8]
  , (d) => [d() + d() + 2, d() + d() + d() + 4, 9]
];

export const generateLocationsFood = (playersCount, rollDice) => {
  const row = LOCATIONS_FOOD_TABLE[Math.min(Math.max(playersCount, 2), 8)];
  const [laurasia, gondwana, ocean] = row(rollDice);
  return {
    [LOCATION.LAURASIA]: laurasia
    , [LOCATION.GONDWANA]: gondwana
    , [LOCATION.OCEAN]: ocean
  };
};

const makeEmptyFood = () => Map({
  [LOCATION.LAURASIA]: 0
  , [LOCATION.GONDWANA]: 0
  , [LOCATION.OCEAN]: 0
});

/**
 * Pending migration: the migrant has already moved, owners of the remoras (TraitSuckerfish)
 * decide one by one (migrating player first, then clockwise) whether their remoras follow it.
 */
export class MigrationRecord extends Record({
  id: null
  , migrantId: null
  , migrantPid: null
  , from: null
  , to: null
  , deciders: List()
  , time: null
  , turnRemainingTime: null
}) {
  static new(migrant, from, to, deciders) {
    return new MigrationRecord({
      id: uuid.v4()
      , migrantId: migrant.id
      , migrantPid: migrant.ownerId
      , from
      , to
      , deciders: List(deciders)
    });
  }

  static fromJS(js) {
    return js == null
      ? null
      : new MigrationRecord({
        ...js
        , deciders: List(js.deciders)
      });
  }

  getDecider() {
    return this.deciders.first();
  }
}

export class LocationsRecord extends Record({
  food: makeEmptyFood()
  , forcedAnimals: Map() // playerId -> number of animals the player has to deploy (restart rule)
  , migration: null
}) {
  static new() {
    return new LocationsRecord();
  }

  static fromJS(js) {
    return js == null
      ? null
      : new LocationsRecord({
        food: makeEmptyFood().merge(js.food)
        , forcedAnimals: Map(js.forcedAnimals)
        , migration: MigrationRecord.fromJS(js.migration)
      });
  }

  static emptyFood() {
    return makeEmptyFood();
  }
}

export const parseLocation = (string) => LOCATIONS
  .find(location => !!string && location.toLowerCase().indexOf(string.toLowerCase()) === 0);

// region helpers

export const getLocationFood = (game, location) => game.locations.food.get(location, 0);

/**
 * Food available to the animal: food base of its location (or the common one without locations)
 */
export const getFoodForAnimal = (game, animal) => (isLocationsGame(game)
    ? getLocationFood(game, animal.location)
    : game.getFood()
);

export const isSameLocation = (game, entity1, entity2) => (
  !isLocationsGame(game)
  || entity1.location === entity2.location
);

export const getAnimalsOfLocation = (player, location) => player.continent.filter(animal => animal.location === location);

export const getForcedAnimals = (game, playerId) => (isLocationsGame(game)
    ? game.locations.forcedAnimals.get(playerId, 0)
    : 0
);

export const getMigration = (game) => isLocationsGame(game) ? game.locations.migration : null;

// endregion

// region cooldowns

export const LOCATIONS_COOLDOWN_LINK = {
  MIGRATION: 'MIGRATION' // ANIMAL: animal has already migrated this turn
  , MIGRATION_LOCK: 'MIGRATION_LOCK' // PLAYER: player can't declare migration in this round
};

// PLAYER: player can't take food and use traits in the location in this round
export const getLocationLockLink = (location) => `LOCATION_LOCK_${location}`;

/**
 * In every round of the feeding phase the player takes food and uses traits in one location only
 */
export const getErrorOfLocationLock = (game, animal) => {
  if (!isLocationsGame(game)) return false;
  if (game.cooldowns.checkFor(getLocationLockLink(animal.location), animal.ownerId)) return ERRORS.LOCATION_LOCKED;
  return false;
};

// endregion

// region traits

export const isSpecializationTrait = (trait) => (
  trait.type === tt.TraitThermosynthesis
  || trait.type === tt.TraitPhotosynthesis
);

const isAnimalAlive = (animal) => !animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION);

/**
 * TraitHerding: animal can't be attacked if there are as many or more herding animals in the location
 * as predators (animals of all players are counted)
 */
export const isProtectedByHerd = (game, targetAnimal) => {
  let herd = 0;
  let predators = 0;
  game.someAnimal((animal) => {
    if (animal.location !== targetAnimal.location || !isAnimalAlive(animal)) return;
    if (animal.hasTrait(tt.TraitHerding)) herd++;
    if (animal.hasTrait(tt.TraitCarnivorous)) predators++;
  });
  return herd >= predators;
};

// endregion
