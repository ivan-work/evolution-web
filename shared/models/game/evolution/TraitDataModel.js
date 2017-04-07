import {Record} from 'immutable';
import * as traitsData from './traitsData/index'
import {CARD_TARGET_TYPE} from './constants';

export class TraitDataModel extends Record({
  type: null // 'TraitFatTissuue', etc
  , food: 0 // Amount of food required
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF // from CARD_TARGET_TYPE
  , checkTraitPlacement: null // (animal) => boolean // if trait is allowed to be placed on this animal
  , targetType: null // from TRAIT_TARGET_TYPE
  , playerControllable: false // if player can click/drag trait
  , cooldowns: null // array of cooldown data arrays (checks before use, adds after use)
  , cooldownsAddOnly: null // array of cooldown data arrays (only adds after use)
  , multiple: false // is allowed multiple traits with same type? (only for FatTissue) //TODO remove
  , disableLastRound: false // is allowed to work last round? //TODO remove
  , action: null // action function
  // (game, sourceAnimal, trait:TraitModel, targetAnimal/targetTrait/none, attackTrait/none, attackAnimal/none) => should return (dispatch, getState)
  , $checkAction: null // if trait is allowed to be clicked? (game, sourceAnimal) => boolean
  , checkTarget: null // if target is valid? (game, sourceAnimal, targetAnimal) => boolean
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
  if (!traitData.action) return false;
  if (traitData.cooldowns && traitData.cooldowns.some(([link, place]) =>
      game.cooldowns.checkFor(link, sourceAnimal.ownerId, sourceAnimal.id))) {
    return false;
  }
  // Either no $checkAction or it is passing
  return !traitData.$checkAction || traitData.$checkAction(game, sourceAnimal);
};