import {Record, List, Map} from 'immutable';
import uuid from 'uuid';
import {TraitModel} from './TraitModel';

import {TraitFatTissue, TraitSymbiosis} from './traitTypes/index';
import {TRAIT_ANIMAL_FLAG} from './constants';

export class AnimalModel extends Record({
  id: null
  , ownerId: null
  , food: 0
  , foodSize: 1
  , fatSize: 0
  , traits: List()
  , flags: Map()
}) {
  static new(ownerId) {
    return new AnimalModel({
      id: uuid.v4()
      , ownerId
    });
  }

  static fromServer(js) {
    return js == null
      ? null
      : new AnimalModel(js)
      .set('traits', List(js.traits).map(trait => TraitModel.fromServer(trait)))
      .set('flags', Map(js.flags));
  }

  toClient() {
    return this
      .update('traits', traits => traits
        .map(trait => trait.toClient()))
  }

  toOthers() {
    return this
      .update('traits', traits => traits
        .map(trait => trait.toOthers())
        .filter(trait => trait != null))
  }

  toString() {
    return `Animal#${this.id}`;
  }

  hasTrait(type) {
    return this.traits.find(trait => trait.type === type)
  }

  traitAdd(trait) {
    return this
      .update('traits', traits => traits.push(trait))
      .update('foodSize', foodSize => foodSize + trait.getDataModel().food)
      .update('fatSize', fatSize => fatSize + (trait.type === TraitFatTissue ? 1 : 0));
  }

  traitRemove(lookup) {
    const traits = this.traits.filterNot(lookup);
    let foodSize = 1;
    let fatSize = 0;
    traits.forEach(trait => {
      if (trait.type === TraitFatTissue) fatSize++;
      foodSize += trait.getDataModel().food;
    });
    return (this
      .set('traits', traits)
      .set('foodSize', foodSize)
      .set('fatSize', fatSize)
    );
  }

  updateTrait(filterFn, updateFn, direction = true) {
    const index = this.traits[direction ? 'findIndex' : 'findLastIndex'](filterFn);
    return (~index
      ? this.updateIn(['traits', index], updateFn)
      : this);
  }

  hasFlag(flag) {
    return this.flags.get(flag);
  }

  /**
   * Food
   * */

  getFood() {
    return this.food;
  }

  getFat() {
    return this.traits.filter(trait => trait.type === TraitFatTissue && trait.value).size
  }

  getFoodAndFat() {
    return this.getFood() + this.getFat();
  }

  isFull() {
    return this.food >= this.foodSize
      || this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)
  }

  canEat(game) {
    return (this.getFood() + this.getFat() < this.foodSize + this.fatSize)
      && !this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)
      && !this.hasFlag(TRAIT_ANIMAL_FLAG.SHELL)
      && !this.traits // TODO replace by flag
        .filter(trait => trait.type === TraitSymbiosis && trait.linkSource && trait.hostAnimalId === this.id)
        .some(trait => {
          const {animal: hostAnimal} = game.locateAnimal(trait.linkAnimalId);
          return !hostAnimal.isFull();
        });
  }

  receiveFood(amount) {
    let self = this;
    const needOfFood = self.foodSize - self.getFood();

    self = self.set('food', self.food + Math.min(self.foodSize, self.food + amount));
    amount -= needOfFood;
    if (amount > 0) self = self.set('fat', self.fat + Math.min(self.fatSize, self.fat + amount));


    return self;
  }

  digestFood() {
    let self = this;
    if (!this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)) {
      const needOfFood = self.foodSize - self.getFood();
      while (needOfFood > 0 && self.fat > 0) {
        needOfFood--;
        self = self.updateTrait(
          trait => trait.type === TraitFatTissue && trait.value
          , trait => trait.set('value', false)
          , false
        );
      }
    }
    return self.set('food', 0)
  }

  recalculateFat() {
    let fatCounter = this.fat;
    return this.update('traits', traits => traits.map(trait =>
      trait.type !== TraitFatTissue ? trait : trait.set('value', fatCounter-- > 0)
    ));
  }

  countScore() {
    return 2 + this.traits.reduce((result, trait) => result + 1 + trait.getDataModel().food, 0);
  }
}