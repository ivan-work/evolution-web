import logger from '~/shared/utils/logger';
import {Record} from 'immutable';
import {PHASE} from '../models/game/GameModel';
import {TRAIT_TARGET_TYPE} from '../models/game/evolution/constants';
import {passesChecks, failsChecks, checkGamePhase, checkPlayerCanAct} from './checks';
import {checkAnimalCanEat, checkTraitActivation_Animal} from './trait.checks';
import {selectGame} from '../selectors';
import {server$gameEndTurn} from './actions';

export class Option extends Record({
  request: null
  , params: null
}) {
  static new(request, ...params) {
    return new Option({
      request
      , params
    })
  }

  toString() {
    return 'Option(' + [this.request].concat(this.params).join(', ') + ')';
  }
}

export const doesPlayerHasOptions = (game, playerId) => {
  logger.debug('?doesPlayerHasOptions:', playerId, hasError);
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
      console.log('options', options);
    }
  }
  return true;
};

export const doesOptionExist = (game, playerId) => {
  const allAnimals = game.players.reduce((result, player) => result.concat(player.continent.map(animal => animal.id).toArray()), []);
  return game.getPlayer(playerId).continent.some((animal) => {
    if (passesChecks(() => checkAnimalCanEat(game, animal))) return true;

    return animal.traits.some((trait) => {
      const traitData = trait.getDataModel();

      if (traitData.transient) return false;

      if (!(traitData.playerControllable && trait.checkAction(game, animal))) return false;

      switch (traitData.targetType) {
        case TRAIT_TARGET_TYPE.ANIMAL:
          return allAnimals.some((targetAid) => {
            if (passesChecks(() => checkTraitActivation_Animal(game, animal, traitData, targetAid))) return true;
          });
        case TRAIT_TARGET_TYPE.TRAIT:
          return true;
        case TRAIT_TARGET_TYPE.NONE:
          return true;
      }
    });
  });
};

export const getFeedingOption = (game, playerId) => {
  return game.getPlayer(playerId).continent.find((animal) => {
    if (passesChecks(() => checkAnimalCanEat(game, animal)))
      return animal.id;
  });
};

// takes too long time
export const getOptions = (game, playerId) => {
  const allAnimals = game.players.reduce((result, player) => result.concat(player.continent.map(animal => animal.id).toArray()), []);
  return game.getPlayer(playerId).continent.reduce((result, animal) => {
    if (passesChecks(() => checkAnimalCanEat(game, animal)))
      result.push(Option.new('traitTakeFoodRequest', animal.id));

    animal.traits.forEach((trait) => {
      const traitData = trait.getDataModel();

      if (traitData.transient) return;

      if (!(traitData.playerControllable && trait.checkAction(game, animal))) return;

      switch (traitData.targetType) {
        case TRAIT_TARGET_TYPE.ANIMAL:
          allAnimals.forEach((targetAid) => {
            if (passesChecks(() => checkTraitActivation_Animal(game, animal, traitData, targetAid))) {
              result.push(Option.new('traitActivateRequest', animal.id, trait.type, targetAid))
            }
          });

          break;
        case TRAIT_TARGET_TYPE.TRAIT:
          break;
        case TRAIT_TARGET_TYPE.NONE:
          result.push(Option.new('traitActivateRequest', animal.id, trait.type));
          break;
      }
    });

    return result;
  }, []);
};