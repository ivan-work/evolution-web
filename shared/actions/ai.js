import {Record} from 'immutable';
import {TraitDataModel} from '../models/game/evolution/TraitDataModel';
import {TRAIT_TARGET_TYPE} from '../models/game/evolution/constants';
import {catchChecks} from './checks';
import {checkAnimalCanEat, checkTraitActivation_Animal} from './trait.checks';

export class Option extends Record({}) {
  static new(request, ...params) {
    return new Option({
      request
      , params
    })
  }
}

export const getAvailableOptions = (game, playerId) => {
  const allAnimals = game.players.reduce((result, player) => result.concat(player.continent.map(animal => animal.id).toArray()), []);
  return game.getPlayer(playerId).continent.reduce((result, animal) => {
    if (catchChecks(() => checkAnimalCanEat(game, animal)))
      result.push(Option.new('traitTakeFoodRequest', animal.id));

    animal.forEach((trait) => {
      const traitData = TraitDataModel.new(trait.type);

      if (!traitData.checkAction(game, animal)) return;

      switch (traitData.targetType) {
        case TRAIT_TARGET_TYPE.ANIMAL:
          allAnimals.forEach((targetAid) => {
            if (catchChecks(() => checkTraitActivation_Animal(game, animal, traitData, targetAid))) {
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
  }, []);
};