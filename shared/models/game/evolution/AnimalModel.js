import {Record, List, Map, OrderedMap} from 'immutable';
import uuid from 'uuid';
import {TraitModel} from './TraitModel';

import {
  TraitFatTissue,
  TraitSymbiosis,
  TraitShell,
  TraitHibernation,
  TraitAnglerfish,
  TraitNeoplasm
} from './traitTypes';
import {TRAIT_ANIMAL_FLAG, CTT_PARAMETER} from './constants';

/**
 * @class AnimalModel
 * @property {string} id - an ID.
 * @property {TraitModel[]} traits
 * @property {Map} flags
 * @property {number} foodSize
 * @property {number} fatSize
 * @property {string} ownerId - a PlayerModel ID.
 */
export class AnimalModel extends Record({
  id: null
  , ownerId: null
  , food: 0
  , foodSize: 1
  , fatSize: 0
  , traits: OrderedMap()
  , flags: Map()
}) {
  static new(ownerId, trait) {
    let animal = new AnimalModel({
      id: uuid.v4()
      , ownerId
    });
    return trait !== TraitAnglerfish ? animal
      : animal.traitAttach(TraitModel.new(TraitAnglerfish));
  }

  static fromServer(js) {
    return js == null
      ? null
      : new AnimalModel(js)
        .set('traits', OrderedMap(js.traits).map(trait => TraitModel.fromServer(trait)))
        .set('flags', Map(js.flags));
  }

  toClient() {
    return this
      .update('traits', traits => traits.map(trait => trait.toClient()).entrySeq())
  }

  toOthers() {
    return this
      .update('traits', traits => traits
        .map(trait => trait.toOthers())
        .filter(trait => trait != null))
  }

  toString() {
    return `\
Animal#${this.id}\
(${this.getFood()}/${this.foodSize}+${this.getFat()}/${this.fatSize})\
[${this.traits.toArray().map(t => `${t.disabled ? '!' : ''}${t.type}${t.value ? `#${t.value}` : ''}`)}]`;
  }

  getTraits(withDisabled) {
    return this.traits.filter(trait => !trait.getDataModel().hidden && (withDisabled || !trait.disabled))
  }

  hasTrait(typeOrId, ignoreDisable) {
    return this.traits.find(trait => (ignoreDisable || !trait.disabled) && (trait.type === typeOrId || trait.id === typeOrId))
  }

  traitAttach(trait, forced) {
    const attachedTrait = trait
      .set('ownerId', this.ownerId)
      .set('hostAnimalId', this.id);
    const updatedTraits = (trait.type !== TraitNeoplasm || forced
      ? this.traits.set(attachedTrait.id, attachedTrait) // .push()
      : OrderedMap().set(attachedTrait.id, attachedTrait).concat(this.traits)); // .unshift()
    return this
      .set('traits', updatedTraits)
      .recalculateFood();
  }

  traitDetach(lookup) {
    const traits = this.traits.filterNot(lookup);
    return this
      .set('traits', traits)
      .recalculateFood();
  }

  recalculateFood() {
    let foodSize = 1;
    let fatSize = 0;
    this.traits.forEach(trait => {
      // if (trait.isLinked() && trait.findLinkedTrait(game).disabled) return;
      if (trait.disabled) return;
      if (trait.type === TraitFatTissue && !trait.disabled) fatSize++;
      foodSize += trait.getDataModel().food;
    });
    return this
      .set('foodSize', foodSize)
      .set('fatSize', fatSize)
      .set('food', Math.min(this.food, foodSize))
  }

  /**
   * @param {TRAIT_ANIMAL_FLAG} flag
   * @return {boolean}
   */
  hasFlag(flag) {
    return !!this.flags.get(flag);
  }

  /**
   * Food
   * */

  getFood() {
    return this.food;
  }

  getFat() {
    return this.traits.filter(trait => trait.type === TraitFatTissue && trait.value && !trait.disabled).size
  }

  getFoodAndFat() {
    return this.getFood() + this.getFat();
  }

  getNeededFood() {
    return Math.max(0, this.foodSize - this.getFood());
  }

  getWantedFood() {
    return (this.foodSize + this.fatSize) - (this.getFood() + this.getFat());
  }

  isSaturated() {
    return this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)
      || this.getNeededFood() <= 0;
  }

  isFull() {
    return this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)
      || this.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)
      || this.getWantedFood() <= 0;
  }

  canSurvive() {
    return this.isSaturated()
      || this.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)
      || this.getFood() >= this.foodSize
  }

  getEatingBlockers(game) {
    let eatingBlockers = [];
    eatingBlockers = eatingBlockers.concat(this.traits
      .filter(trait => {
        if (trait.type === TraitSymbiosis && trait.linkSource && trait.hostAnimalId === this.id) {
          const hostAnimal = game.locateAnimal(trait.linkAnimalId, trait.ownerId);
          const linkedTrait = game.locateTrait(trait.linkId, trait.linkAnimalId, trait.ownerId);
          if (linkedTrait) {
            return !linkedTrait.disabled && !hostAnimal.isSaturated();
          }
        }
      }).toArray());
    const traitShell = this.hasTrait(TraitShell);
    if (this.hasFlag(TRAIT_ANIMAL_FLAG.SHELL) && traitShell) eatingBlockers.push(traitShell);
    const traitHibernation = this.hasTrait(TraitHibernation);
    if (this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) && TraitHibernation) eatingBlockers.push(traitHibernation);
    return eatingBlockers;
  }

  canEat(game) {
    return this.getWantedFood() > 0
      && !this.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)
      && this.getEatingBlockers(game).length === 0;
  }

  receiveFood(amount) {
    const needOfFood = this.getNeededFood();
    const amountForFood = Math.min(needOfFood, amount);
    let amountForFat = amount - amountForFood;

    return this
      .set('food', this.getFood() + amountForFood)
      .update('traits', traits => traits
        .reverse()
        .map(trait => (trait.type === TraitFatTissue && !trait.value && !trait.disabled
          ? trait.set('value', amountForFat-- > 0)
          : trait))
        .reverse()
      );
  }

  // AUTO FAT PROCESSING - disabled by rules. TODO delete on sight
  // digestFood() {
  //   let fatToSpend = Math.max(0, this.foodSize - this.getFood());
  //   if (this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)) {
  //     return this
  //   } else if (this.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) {
  //     return this
  //   } else {
  //     return this
  //       .update('food', food => food + Math.min(this.getFat(), fatToSpend))
  //       .update('traits', traits => traits.map(trait =>
  //         (trait.type === TraitFatTissue && trait.value && fatToSpend-- > 0) ? trait.set('value', false)
  //           : trait));
  //   }
  // }

  countScore() {
    let baseScore = 2;
    if (this.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) baseScore = 0;
    return (baseScore + this.traits.reduce((result, trait) => result + trait.countScore(), 0));
  }
}
