import {Record} from 'immutable';
import * as traitsData from './traitsData/index'
import * as tt from './traitTypes'
import {CARD_TARGET_TYPE, CTT_PARAMETER} from './constants';

export const TRAIT_DATA_PLACEMENT_ERRORS = {
  HIDDEN: 'HIDDEN'
  , MULTIPLE: 'MULTIPLE'
};

/**
 * @class TraitDataModel TODO standartize
 * @property {string} type: null - 'TraitFatTissuue', etc
 * @property {number} [food: 0] - Amount of food required
 * @property {number} [score: 1] - Base score for trait. TODO rewrite every trait to use score only
 * @property {boolean} [optional: false] - On defence traits, can choose to suicide animal instead of using it
 * @property {CARD_TARGET_TYPE} [cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF] - How trait should be deployed
 * @property {callback} checkTraitPlacement: null // (animal) => boolean - if trait is allowed to be placed on this animal
 * @property {TRAIT_TARGET_TYPE} targetType - required for traits with .action property
 * @property {boolean} playerControllable: false // if player can click/drag trait
 * @property {array} cooldowns: null - array of cooldown data arrays
 * @property {boolean} multiple: false - is allowed multiple traits with same type? (only for FatTissue)
 * @property {boolean} transient: false - for ambush / anglerfish
 * @property {boolean} hidden: false - for anglerfish
 * @property {callback} action: null // action function
 * (game, sourceAnimal, trait:TraitModel, targetAnimal/targetTrait/none, attackTrait/none, attackAnimal/none) => should return (dispatch, getState)
 * @property {callback} $checkAction: null // if trait is allowed to be clicked? (game, sourceAnimal) => boolean
 * @property {callback} checkTarget: null // if target is valid? (game, sourceAnimal, targetAnimal) => boolean
 * @property {callback} getTargets: null // get list of available target for an active trait (game, sourceAnimal) => list of targets
 * @property {object} customFns: null // Object of custom trait functions
 */

export class TraitDataModel extends Record({
  type: null // 'TraitFatTissuue', etc
  , food: 0 // Amount of food required
  , score: 1 // Base score for trait. TODO rewrite every trait to use score only
  , optional: false // On defenced traits, can choose to suicide animal
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF // from CARD_TARGET_TYPE
  , checkTraitPlacement: null // (animal) => boolean // if trait is allowed to be placed on this animal
  , targetType: null // from TRAIT_TARGET_TYPE
  , playerControllable: false // if player can click/drag trait
  , cooldowns: null // array of cooldown data arrays (checks before use, adds after use)
  , multiple: false // is allowed multiple traits with same type? (only for FatTissue)
  , transient: false // for ambush
  , hidden: false
  , action: null // action function
  // (game, sourceAnimal, trait:TraitModel, targetAnimal/targetTrait/none, attackTrait/none, attackAnimal/none) => should return (dispatch, getState)
  , $checkAction: null // if trait is allowed to be clicked? (game, sourceAnimal) => boolean
  , checkTarget: null // if target is valid? (game, sourceAnimal, targetAnimal) => boolean
  , getTargets: null // get list of available target for an active trait (game, sourceAnimal) => list of targets
  , customFns: null // Object of custom trait functions
}) {
  static new(traitType) {
    if (!(traitType in traitsData)) throw Error(`traitData[${traitType}] not found`);
    const traitData = traitsData[traitType];
    return new TraitDataModel({
      ...traitData
    });
  }

  checkTraitPlacementFails(animal) {
    if (!(this.cardTargetType & CTT_PARAMETER.LINK) && !this.multiple && animal.hasTrait(this.type, true)) return TRAIT_DATA_PLACEMENT_ERRORS.MULTIPLE;
    if (this.hidden) return TRAIT_DATA_PLACEMENT_ERRORS.HIDDEN;
    if (this.checkTraitPlacement && !this.checkTraitPlacement(animal)) return this.type;
    if (animal.hasTrait(tt.TraitRegeneration) && (
        this.food > 0 || animal.traits.filter(t => !t.getDataModel().hidden).size >= 2
      )) return tt.TraitRegeneration;
    return false;
  }
}