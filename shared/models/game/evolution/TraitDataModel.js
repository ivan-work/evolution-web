import {Record} from 'immutable';
import * as traitsData from './traitsData/index'
import {CARD_TARGET_TYPE} from './constants';

export class TraitDataModel extends Record({
  type: null
  , food: 0
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF
  , checkTraitPlacement: null
  , targetType: null
  , playerControllable: false
  , cooldowns: null
  , multiple: false
  , disableLastRound: false
  , action: null
  , $checkAction: null
  , checkTarget: null
}) {
  static new(traitType) {
    if (!(traitType in traitsData)) throw Error(`traitData[${traitType}] not found`);
    const traitData = traitsData[traitType];
    return new TraitDataModel({
      ...traitData
    });
  }

  checkAction(game, sourceAnimal) {
    return checkAction(game, this, sourceAnimal);
  }
}

export const checkAction = (game, traitData, sourceAnimal) => {
  if (traitData.cooldowns && traitData.cooldowns.some(([link, place]) =>
      game.cooldowns.checkFor(link, sourceAnimal.ownerId, sourceAnimal.id))) {
    return false;
  }
  return !traitData.$checkAction || traitData.$checkAction(game, sourceAnimal);
};