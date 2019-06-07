import {Record, List, Map, OrderedMap} from 'immutable';
import invariant from 'invariant';
import uuid from 'uuid';
import {TraitModel} from '../TraitModel';

import {
  TraitFatTissue,
  TraitSymbiosis,
  TraitShell,
  TraitHibernation,
  TraitAnglerfish,
  TraitNeoplasm
} from '../traitTypes/index';
import {TRAIT_ANIMAL_FLAG, CTT_PARAMETER} from '../constants';
import PlantDataModel from "./PlantDataModel";

/**
 * @class PlantModel
 * @property {string} id - an ID.
 */
export default class PlantModel extends Record({
  id: null
  , type: null
  , data: null
  , food: 0
  , covers: 0
  , traits: OrderedMap()
  , flags: Map()
}) {
  static new(type) {
    const data = PlantDataModel.new(type);
    return new PlantModel({
      id: uuid.v4()
      , type
      , food: data.startingFood
      , covers: data.coverSlots
      , data
    }).update(data.onNewPlant);
  }

  static fromJS(js) {
    return js == null
      ? null
      : new PlantModel(js)
        .set('traits', OrderedMap(js.traits).map(TraitModel.fromServer))
        .set('data', PlantDataModel.new(js.type));
  }

  toClient() {
    return this
      .update('traits', traits => traits.map(trait => trait.toClient()).entrySeq())
      .set('data', null);
  }

  toString() {
    return `Plant#${this.id}(${this.getFood()}/${this.maxFood})[${this.traits.toArray().map(t => t.type)}]`;
  }

  getTraits() {
    return this.traits.filter(trait => !trait.disabled && !trait.getDataModel().hidden)
  }

  hasTrait(typeOrId, ignoreDisable) {
    return this.traits.find(trait => (ignoreDisable || !trait.disabled) && (trait.type === typeOrId || trait.id === typeOrId))
  }

  traitAttach(trait, forced) {
    invariant(trait instanceof TraitModel, 'trait.instanceOf(TraitModel)');
    const attachedTrait = trait
      .set('hostAnimalId', this.id);
    const updatedTraits = this.traits.set(attachedTrait.id, attachedTrait);
    // const updatedTraits = (trait.type !== TraitNeoplasm || forced
    //   ? this.traits.set(attachedTrait.id, attachedTrait) // .push()
    //   : OrderedMap().set(attachedTrait.id, attachedTrait).concat(this.traits)); // .unshift()
    return this
      .set('traits', updatedTraits)
    //   .recalculateFood();
  }

  traitDetach(lookup) {
    const traits = this.traits.filterNot(lookup);
    return this
      .set('traits', traits)
      // .recalculateFood();
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

  getCovers() {
    return this.covers;
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

  canSurvive() {
    return this.getFood() >= 0
  }

  canEat(game) {
    return this.getFood() < this.data.maxFood;
  }

  receiveFood(amount) {
    return this
      .set('food', Math.max(0, Math.min(this.getFood() + amount, this.data.maxFood)));
  }
}