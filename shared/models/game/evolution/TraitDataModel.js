import {Record} from 'immutable';
import * as traitsData from './traitsData/index'
import * as tt from './traitTypes'
import {CARD_TARGET_TYPE, CTT_PARAMETER, TRAIT_ANIMAL_FLAG} from './constants';
import TraitDataModelBaseProps from "./TraitDataModelBaseProps";
import ERRORS from '../../../actions/errors';
import {AnimalModel} from "./AnimalModel";

const TraitDataModelProps = {
  ...TraitDataModelBaseProps
  , autoAttach: false
  , defense: false
  , food: 0 // Amount of food required
  , score: 1 // Base score for trait. TODO rewrite every trait to use score only
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
 * @property {boolean} autoAttach: false - auto attach when deploying as animal
 * @property {function} action: null // action function
 * (game, sourceAnimal, trait:TraitModel, targetAnimal/targetTrait/none, attackTrait/none, attackAnimal/none) => should return (dispatch, getState)
 * @property {function} getTargets: null // get list of available target for an active trait (game, sourceAnimal) => list of targets
 * @property {object} customFns: {} // Object of custom trait functions
 *
 * @property {number} [food: 0] - Amount of food required
 * @property {number} [score: 1] - Base score for trait. TODO rewrite every trait to use score only
 * @property {boolean} [optional: false] - On defense traits, can choose to suicide animal instead of using it
 * @property {function} $checkAction: null // if trait is allowed to be clicked? (game, sourceAnimal) => boolean
 *
 * @property {function} _getErrorOfUse
 * @property {function} _getErrorOfTraitPlacement
 * @property {function} _getErrorOfFoodIntake
 * @property {function} getErrorOfFoodIntake
 * @property {function} getErrorOfUseAction: null // if target is valid? (game, sourceAnimal, targetAnimal) => boolean
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

    const traitParalysis = animal.hasTrait(tt.TraitParalysis);
    if (trait.type !== tt.TraitParalysis && traitParalysis && !traitParalysis.value) return tt.TraitParalysis;

    if (targets[0] !== 'CHECK' && trait.linkId) {
      const linkedAnimal = trait.findLinkedAnimal(game, animal);
      if (!linkedAnimal) return ERRORS.TRAIT_ACTION_NO_TARGETS
      const linkedTrait = linkedAnimal.hasTrait(trait.linkId);
      if (!linkedTrait) return ERRORS.TRAIT_ACTION_NO_TARGETS;
      const linkedTraitParalysis = linkedAnimal.hasTrait(tt.TraitParalysis);
      if (linkedTraitParalysis && !linkedTraitParalysis.value) return tt.TraitParalysis;

      // const errors = linkedTrait.getErrorOfUse(game, linkedAnimal, 'CHECK')
      // if (errors) return errors;
    }

    if (this.cooldowns && this.cooldowns
      .some(([link]) => game.cooldowns.checkFor(link, animal.ownerId, animal.id, trait.id)))
      return ERRORS.COOLDOWN;

    return this._getErrorOfUse(game, animal, trait, ...targets);
  };

  getErrorOfTraitPlacement_User(userId, entityOwnerId) {
    if (this.cardTargetType & CTT_PARAMETER.SELF)
      if (userId !== entityOwnerId)
        return ERRORS.TRAIT_PLACEMENT_CTT_SELF;
    if (this.cardTargetType & CTT_PARAMETER.ENEMY)
      if (userId === entityOwnerId)
        return ERRORS.TRAIT_PLACEMENT_CTT_ENEMY;
    return false;
  }

  getErrorOfTraitPlacement_LinkUser(userId, linkedEntityOwnerId) {
    if (this.linkTargetType & CTT_PARAMETER.SELF)
      if (userId !== linkedEntityOwnerId)
        return ERRORS.TRAIT_PLACEMENT_CTT_SELF;
    if (this.linkTargetType & CTT_PARAMETER.ENEMY)
      if (userId === linkedEntityOwnerId)
        return ERRORS.TRAIT_PLACEMENT_CTT_ENEMY;
    return false;
  }

  getErrorOfTraitPlacement(animal) {
    // if (!(animal instanceof AnimalModel)) return ERRORS.TRAIT_PLACEMENT_CTT_ANIMAL;
    // if (!(this.cardTargetType & CTT_PARAMETER.ANIMAL)) return ERRORS.TRAIT_PLACEMENT_CTT_ANIMAL;
    if (!this.linkTargetType && !this.multiple && animal.hasTrait(this.type, true)) return ERRORS.TRAIT_PLACEMENT_MULTIPLE;
    if (this.hidden) return ERRORS.TRAIT_PLACEMENT_HIDDEN;
    if (animal.hasTrait(tt.TraitRegeneration) && (
      this.food > 0 || animal.traits.filter(t => !t.getDataModel().hidden).size >= 2
    )) return tt.TraitRegeneration;
    if (animal.hasTrait(tt.TraitAdaptation) && this.food < 1) return tt.TraitAdaptation
    return this._getErrorOfTraitPlacement(animal);
  }
}

export default TraitDataModel;