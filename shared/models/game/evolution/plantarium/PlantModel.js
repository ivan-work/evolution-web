import {Record, List, Map, OrderedMap} from 'immutable';
import invariant from 'invariant';
import uuid from 'uuid';
import {TraitModel} from '../TraitModel';

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
  , coverSlots: 0
  , fruit: false
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
    }).update(data.onNewPlant)
      .recalculate();
  }

  static fromJS(js) {
    return js == null
      ? null
      : new PlantModel(js)
        .set('traits', OrderedMap(js.traits).map(TraitModel.fromServer))
        .set('data', PlantDataModel.new(js.type))
        .set('flags', Map(js.flags))
        .recalculate();
  }

  toClient() {
    return this
      .update('traits', traits => traits.map(trait => trait.toClient()).entrySeq())
      .set('data', null);
  }

  toString() {
    return `${this.data.type}#${this.id}(${this.getFood()}/${this.data.maxFood})[${this.traits.toArray().map(t => t.type)}]`;
  }

  getTraits() {
    return this.traits.filter(trait => !trait.disabled && !trait.getDataModel().hidden)
  }

  hasTrait(typeOrId, ignoreDisable) {
    const trait = this.traits.get(typeOrId);
    if (trait && (ignoreDisable || !trait.disabled)) return trait;
    return this.findTrait(typeOrId, ignoreDisable);
  }

  findTrait(typeOrId, ignoreDisable) {
    return this.traits.find(trait => (ignoreDisable || !trait.disabled) && (trait.type === typeOrId || trait.id === typeOrId));
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
      .recalculate();
  }

  traitDetach(lookup) {
    const traits = this.traits.filterNot(lookup);
    return this
      .set('traits', traits)
      .recalculate();
  }

  recalculate() {
    const coverSlots = this.data.coverSlots + this.getTraits(true).reduce((result, trait) => result + trait.getDataModel().coverSlots, 0);
    return this
      .set('fruit', this.data.fruit || this.getTraits(true).some(trait => trait.getDataModel().fruit))
      .set('coverSlots', coverSlots);
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

  isFruit() {
    return this.fruit;
  }

  /**
   * Food
   * */

  getFood() {
    return this.food;
  }

  getMaxFood() {
    return this.data.maxFood;
  }

  getNextFood(game) {
    if (!this.data.surviveNoFood && this.getFood() === 0) return 0;
    return (this.data.produceFood(game, this) - this.getFood()) || 0
  }

  canSurvive() {
    return this.getFood() >= 0
  }

  canEat(game) {
    return this.getFood() < this.data.maxFood;
  }

  receiveFood(amount) {
    return this
      .set('food', Math.max(0, Math.min(this.getFood() + amount, this.getMaxFood())));
  }

  getDataModel() {
    return this.data;
  }
}