import logger from '~/shared/utils/logger';
import {Record} from 'immutable';
import {PHASE} from '../models/game/GameModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_LINK
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_DURATION
} from '../models/game/evolution/constants';
import {startCooldown} from './actions';
import {passesChecks, failsChecks, checkGamePhase, checkPlayerCanAct} from './checks';
import {
  getErrorOfAnimalEatingFromGame,
  checkTraitActivation_Animal,
  checkAnimalCanTakeShellFails,
  getErrorOfAnimalEatingFromPlant,
  getErrorOfAnimalTakingCover, checkTraitActivation_Plant, getErrorOfEntityTraitActivation
} from './trait.checks';
import {server$autoFoodSharing, server$takeFoodRequest, server$traitTakeCover} from "./trait";

const logOptions = !!process.env.LOG_OPTIONS;
const logOptionsAll = !!process.env.LOG_OPTIONS_ALL;

const makeOption = {
  traitTakeFoodRequest: (animalId) => {
    return new Option({
      type: 'traitTakeFoodRequest'
      , text: `traitTakeFoodRequest: ${animalId}`
      , mandatoryAction: (dispatch, gameId, userId) => {
        dispatch(server$takeFoodRequest(gameId, userId, animalId));
        dispatch(server$autoFoodSharing(gameId, userId));
      }
      , cooldownAction: (gameId) => startCooldown(gameId
        , TRAIT_COOLDOWN_LINK.EATING
        , TRAIT_COOLDOWN_DURATION.TURN
        , TRAIT_COOLDOWN_PLACE.ANIMAL
        , animalId
      )
    })
  }
  , traitTakeFoodPlantRequest: (animalId, plantId) => {
    return new Option({
      type: 'traitTakeFoodRequest'
      , text: `traitTakeFoodRequest: ${animalId} from ${plantId}`
      , mandatoryAction: (dispatch, gameId, userId) => {
        dispatch(server$takeFoodRequest(gameId, userId, animalId, plantId));
        dispatch(server$autoFoodSharing(gameId, userId));
      }
      , cooldownAction: (gameId) => startCooldown(gameId
        , TRAIT_COOLDOWN_LINK.EATING
        , TRAIT_COOLDOWN_DURATION.TURN
        , TRAIT_COOLDOWN_PLACE.ANIMAL
        , animalId
      )
    })
  }
  , traitTakeCoverRequest: (animalId, plantId) => {
    return new Option({
      type: 'traitTakeCoverRequest'
      , text: `traitTakeCoverRequest: ${animalId} from ${plantId}`
      , mandatoryAction: (dispatch, gameId, userId) => {
        dispatch(server$traitTakeCover(gameId, userId, animalId, plantId))
      }
      , cooldownAction: (gameId) => startCooldown(gameId
        , TRAIT_COOLDOWN_LINK.EATING
        , TRAIT_COOLDOWN_DURATION.TURN
        , TRAIT_COOLDOWN_PLACE.ANIMAL
        , animalId
      )
    })
  }
  , traitTakeShellRequest: (animalId) => {
    return new Option({
      type: 'traitTakeShellRequest'
      , text: `traitTakeShellRequest: ${animalId}`
      , cooldownAction: (gameId) => startCooldown(gameId
        , TRAIT_COOLDOWN_LINK.TAKE_SHELL
        , TRAIT_COOLDOWN_DURATION.TURN
        , TRAIT_COOLDOWN_PLACE.ANIMAL, animalId
      )
    })
  }
  , traitActivateRequest: (animalId, trait, target) => {
    return new Option({
      type: 'traitActivateRequest'
      , text: `traitActivateRequest: ${animalId} ${trait.type} ${target}`
      , cooldownAction: (gameId) => startCooldown(gameId
        , trait.type
        , TRAIT_COOLDOWN_DURATION.TURN
        , TRAIT_COOLDOWN_PLACE.TRAIT
        , trait.id
      )
    })
  }
};

export class Option extends Record({
  type: null
  , text: null
  , cooldownAction: null
  , mandatoryAction: null
}) {
}

export const doesPlayerHasOptions = (game, playerId) => {
  logger.debug(`endturn/doesPlayer(${playerId}, ${game.getPlayer(playerId).acted}) has options?`);
  const hasError = failsChecks(() => {
    checkGamePhase(game, PHASE.FEEDING);
    checkPlayerCanAct(game, playerId);
  });
  if (!!hasError) {
    // logger.warn(hasError.name + hasError.message, ...hasError.data);
  } else if (!doesOptionExist(game, playerId)) {
    logger.debug(`endturn/No`);
    return false;
  } else {
    if (logOptionsAll) {
      const options = getOptions(game, playerId);
      if (options.length === 0) throw new Error('Options length = 0');
      logger.debug('options', options.map(o => o.text));
    }
  }
  logger.debug(`endturn/Yes`);
  return true;
};

export const doesOptionExist = (game, playerId) => {
  return searchPlayerOptions(game, playerId, (option) => {
    logger.debug('endturn/option found:', option.text);
    return true;
  });
};

// takes too long time
export const getOptions = (game, playerId) => {
  let result = [];
  searchPlayerOptions(game, playerId, (option) => {
    if (option !== null) result.push(option);
    return false;
  });
  return result;
};


export const searchPlayerOptions = (game, playerId, successFn) => {
  const allAnimals = game.players.reduce((result, player) => result.concat(player.continent.keySeq().toArray()), []);
  const allPlants = game.plants.keySeq().toArray();
  logOptions && logger.debug(`endturn/options/search/${playerId}/`);

  const animalOption = game.getPlayer(playerId).someAnimal((animal) => {
    logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/`);
    logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/food = ${getErrorOfAnimalEatingFromGame(game, animal)}`);
    if (!getErrorOfAnimalEatingFromGame(game, animal))
      return successFn(makeOption.traitTakeFoodRequest(animal.id));

    const plantResult = game.somePlant((plant) => {
      logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/plant/${plant.id}/`);
      logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/plant/${plant.id}/food = ${getErrorOfAnimalEatingFromPlant(game, animal, plant)}`);
      if (!getErrorOfAnimalEatingFromPlant(game, animal, plant)) {
        return successFn(makeOption.traitTakeFoodPlantRequest(animal.id, plant.id));
      }

      logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/plant/${plant.id}/cover = ${getErrorOfAnimalTakingCover(game, animal, plant)}`);
      if (!getErrorOfAnimalTakingCover(game, animal, plant)) {
        return successFn(makeOption.traitTakeCoverRequest(animal.id, plant.id));
      }
    });

    logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/plant = ${plantResult}`);
    if (plantResult) return plantResult;

    logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/shell/${game.getArea().shells.size} = ${checkAnimalCanTakeShellFails(game, animal)}`);
    if (game.getArea().shells.size > 0 && !checkAnimalCanTakeShellFails(game, animal))
      return successFn(makeOption.traitTakeShellRequest(animal.id));

    return animal.traits.some((trait) => {
      const traitData = trait.getDataModel();

      logOptions && logger.debug(`endturn/options/search/${playerId}/animal/${animal.id}/trait/${trait.type}`);
      if (
        !traitData.defense
        && !traitData.transient
        && traitData.playerControllable
        && !trait.getErrorOfUse(game, animal)
      ) {
        switch (traitData.targetType) {
          case TRAIT_TARGET_TYPE.ANIMAL: {
            const exampleTarget = allAnimals.find((targetAid) => passesChecks(() =>
              checkTraitActivation_Animal(game, animal, trait, targetAid))
            );
            if (exampleTarget) {
              return successFn(makeOption.traitActivateRequest(animal.id, trait, exampleTarget));
            }
            break;
          }
          case TRAIT_TARGET_TYPE.PLANT: {
            const exampleTarget = allPlants.find((targetEid) => passesChecks(() =>
              checkTraitActivation_Plant(game, animal, trait, targetEid))
            );
            if (exampleTarget) {
              return successFn(makeOption.traitActivateRequest(animal.id, trait, exampleTarget));
            }
            break;
          }
          case TRAIT_TARGET_TYPE.TWO_TRAITS:
            return successFn(makeOption.traitActivateRequest(animal.id, trait));
          case TRAIT_TARGET_TYPE.TRAIT:
            return successFn(makeOption.traitActivateRequest(animal.id, trait));
          case TRAIT_TARGET_TYPE.NONE:
            return successFn(makeOption.traitActivateRequest(animal.id, trait, trait.linkAnimalId));
        }
      }
    });
  });

  if (animalOption) return animalOption;

  const plantOption = game.somePlant((plant) => {
    logOptions && logger.debug(`endturn/options/search/${playerId}/plant/${plant.id}`);
    return plant.traits.some((trait) => {
      const traitData = trait.getDataModel();

      logOptions && logger.debug(`endturn/options/search/${playerId}/trait/${trait.type}`);
      if (
        !traitData.defense
        && !traitData.transient
        && traitData.playerControllable
        && !getErrorOfEntityTraitActivation(game, playerId, plant, trait)
      ) {
        switch (traitData.targetType) {
          case TRAIT_TARGET_TYPE.ANIMAL: {
            const exampleTarget = allAnimals.find((targetAid) => passesChecks(() =>
              checkTraitActivation_Animal(game, plant, trait, targetAid))
            );
            if (exampleTarget) {
              return successFn(makeOption.traitActivateRequest(plant.id, trait, exampleTarget));
            }
            break;
          }
          case TRAIT_TARGET_TYPE.PLANT: {
            const exampleTarget = allPlants.find((targetEid) => passesChecks(() =>
              checkTraitActivation_Plant(game, plant, trait, targetEid))
            );
            if (exampleTarget) {
              return successFn(makeOption.traitActivateRequest(plant.id, trait, exampleTarget));
            }
            break;
          }
          case TRAIT_TARGET_TYPE.TWO_TRAITS:
            return successFn(makeOption.traitActivateRequest(plant.id, trait));
          case TRAIT_TARGET_TYPE.TRAIT:
            return successFn(makeOption.traitActivateRequest(plant.id, trait));
          case TRAIT_TARGET_TYPE.NONE:
            return successFn(makeOption.traitActivateRequest(plant.id, trait, trait.linkAnimalId));
        }
      }
    });
  });

  if (plantOption) return plantOption;
};