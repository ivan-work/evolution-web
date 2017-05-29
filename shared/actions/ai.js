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
import {checkAnimalCanEatFails, checkTraitActivation_Animal, checkAnimalCanTakeShellFails} from './trait.checks';
import {selectGame} from '../selectors';

const makeOption = {
  traitTakeFoodRequest: (animalId) => {
    return new Option({
      type: 'traitTakeFoodRequest'
      , text: `traitTakeFoodRequest: ${animalId}`
      // , cooldownAction: (gameId) => null//startCooldown(gameId, )
    })
  }
  , traitTakeShellRequest: (animalId) => {
    return new Option({
      type: 'traitTakeShellRequest'
      , text: `traitTakeShellRequest: ${animalId}`
      , cooldownAction: (gameId) => startCooldown(gameId
        , TRAIT_COOLDOWN_LINK.TAKE_SHELL
        , TRAIT_COOLDOWN_DURATION.TURN
        , TRAIT_COOLDOWN_PLACE.ANIMAL, animalId)
    })
  }
  , traitActivateRequest: (animalId, trait, target) => {
    return new Option({
      type: 'traitActivateRequest'
      , text: `traitActivateRequest: ${animalId} ${trait.type} ${target}`
      , cooldownAction: (gameId) => startCooldown(gameId
        , trait.type
        , TRAIT_COOLDOWN_DURATION.TURN
        , TRAIT_COOLDOWN_PLACE.TRAIT, trait.id)
    })
  }
};

export class Option extends Record({
  type: null
  , text: null
  , cooldownAction: null
}) {}

export const doesPlayerHasOptions = (game, playerId) => {
  logger.debug('?doesPlayerHasOptions:', playerId, game.getPlayer(playerId).acted);
  const hasError = failsChecks(() => {
    checkGamePhase(game, PHASE.FEEDING);
    checkPlayerCanAct(game, playerId);
  });
  if (!!hasError) {
    // logger.warn(hasError.name + hasError.message, ...hasError.data);
  } else if (!doesOptionExist(game, playerId)) {
    logger.debug('AutoTurn for:' + playerId);
    return false;
  } else {
    if (process.env.LOG_LEVEL === 'debug') {
      const options = getOptions(game, playerId);
      if (options.length === 0) throw new Error('Options length = 0');
      console.log('options', options.map(o => o.text));
    }
  }
  return true;
};

export const getFeedingOption = (game, playerId) => {
  return game.getPlayer(playerId).continent.find((animal) => {
    if (!checkAnimalCanEatFails(game, animal)) return animal.id;
  });
};

export const doesOptionExist = (game, playerId) => {
  return searchPlayerOptions(game, playerId, (option) => true);
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

  return game.getPlayer(playerId).someAnimal((animal) => {
    if (!checkAnimalCanEatFails(game, animal))
      return successFn(makeOption.traitTakeFoodRequest(animal.id));

    if (game.getContinent().shells.size > 0 && !checkAnimalCanTakeShellFails(game, animal))
      return successFn(makeOption.traitTakeShellRequest(animal.id));

    return animal.traits.some((trait) => {
      const traitData = trait.getDataModel();

      if (!traitData.transient && traitData.playerControllable && !trait.checkActionFails(game, animal)) {
        switch (traitData.targetType) {
          case TRAIT_TARGET_TYPE.ANIMAL:
            const exampleTarget = allAnimals.find((targetAid) => {
              if (passesChecks(() => checkTraitActivation_Animal(game, animal, trait, targetAid)))
                return true;
            });
            if (exampleTarget) return successFn(makeOption.traitActivateRequest(animal.id, trait, exampleTarget));
          case TRAIT_TARGET_TYPE.TWO_TRAITS:
            return successFn(makeOption.traitActivateRequest(animal.id, trait));
          case TRAIT_TARGET_TYPE.TRAIT:
            return successFn(makeOption.traitActivateRequest(animal.id, trait));
          case TRAIT_TARGET_TYPE.NONE:
            return successFn(makeOption.traitActivateRequest(animal.id, trait));
        }
      }
    });
  });
};