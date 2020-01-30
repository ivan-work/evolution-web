import {Record} from 'immutable';
import * as traitsData from './traitsData/index'
import * as tt from './traitTypes'
import {CARD_TARGET_TYPE, CTT_PARAMETER, TRAIT_ANIMAL_FLAG} from './constants';
import TraitDataModelBaseProps from "./TraitDataModelBaseProps";
import ERRORS from '../../../actions/errors';

const TraitDataModelProps = {
  ...TraitDataModelBaseProps
  , defense: false
  , food: 0 // Amount of food required
  , score: 1 // Base score for trait. TODO rewrite every trait to use score only
  , checkTraitPlacement: null // (animal) => boolean // if trait is allowed to be placed on this animal
  , optional: false // On defense traits, can choose to suicide animal
  // (game, sourceAnimal, trait:TraitModel, targetAnimal/targetTrait/none, attackTrait/none, attackAnimal/none) => should return (dispatch, getState)
};

/**
 * @class TraitDataModel
 * @property {string} type: null - 'TraitFatTissuue', etc
 * @property {CARD_TARGET_TYPE} [cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF] - How trait should be deployed
 * @property {TRAIT_TARGET_TYPE} targetType - required for traits with .action property
 * @property {boolean} playerControllable: false // if player can click/drag trait
 * @property {array} cooldowns: null - array of cooldown data arrays
 * @property {boolean} multiple: false - is allowed multiple traits with same type? (only for FatTissue)
 * @property {boolean} transient: false - for ambush / anglerfish
 * @property {boolean} hidden: false - for anglerfish
 * @property {callback} action: null // action function
 * (game, sourceAnimal, trait:TraitModel, targetAnimal/targetTrait/none, attackTrait/none, attackAnimal/none) => should return (dispatch, getState)
 * @property {callback} getTargets: null // get list of available target for an active trait (game, sourceAnimal) => list of targets
 * @property {object} customFns: {} // Object of custom trait functions
 *
 * @property {number} [food: 0] - Amount of food required
 * @property {number} [score: 1] - Base score for trait. TODO rewrite every trait to use score only
 * @property {boolean} [optional: false] - On defense traits, can choose to suicide animal instead of using it
 * @property {callback} checkTraitPlacement: null // (animal) => boolean - if trait is allowed to be placed on this animal
 * @property {callback} $checkAction: null // if trait is allowed to be clicked? (game, sourceAnimal) => boolean
 *
 * @property {callback} _getErrorOfUse
 * @property {callback} _getErrorOfTraitPlacement
 * @property {callback} _getErrorOfFoodIntake
 * @property {callback} getErrorOfFoodIntake
 * @property {callback} getErrorOfUseAction: null // if target is valid? (game, sourceAnimal, targetAnimal) => boolean
 */

export class TraitDataModel extends Record(TraitDataModelProps) {
  static new(traitType) {
    if (!(traitType in traitsData)) throw Error(`traitData[${traitType}] not found`);
    const traitData = traitsData[traitType];
    return new TraitDataModel({
      ...traitData
    });
  }

  getErrorOfUse(game, animal, trait, ...targets) {
    if (trait.disabled) return ERRORS.TRAIT_ACTION_DISABLED;
    if (animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) return ERRORS.TRAIT_REGENERATION_DEAD;
    // if (!this.action) return ERRORS.TRAIT_ACTION_NOT_EXISTS;

    if (this.cooldowns && this.cooldowns
      .some(([link]) => game.cooldowns.checkFor(link, animal.ownerId, animal.id, trait.id)))
      return ERRORS.COOLDOWN;

    return this._getErrorOfUse(game, animal, trait, ...targets);
  };

  checkTraitPlacementFails_User(animal, userId) {
    if (this.cardTargetType & CTT_PARAMETER.SELF)
      if (animal.ownerId !== userId)
        return ERRORS.TRAIT_PLACEMENT_CTT_SELF;
    if (this.cardTargetType & CTT_PARAMETER.ENEMY)
      if (animal.ownerId === userId)
        return ERRORS.TRAIT_PLACEMENT_CTT_ENEMY;
    return false;
  }

  checkTraitPlacementFails(animal, userId) {
    if (!(this.cardTargetType & CTT_PARAMETER.LINK) && !this.multiple && animal.hasTrait(this.type, true)) return ERRORS.TRAIT_PLACEMENT_MULTIPLE;
    if (this.hidden) return ERRORS.TRAIT_PLACEMENT_HIDDEN;
    if (this.checkTraitPlacement && !this.checkTraitPlacement(animal)) return this.type;
    if (animal.hasTrait(tt.TraitRegeneration) && (
      this.food > 0 || animal.traits.filter(t => !t.getDataModel().hidden).size >= 2
    )) return tt.TraitRegeneration;
    return false;
  }
}

export default TraitDataModel;