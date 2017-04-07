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
  , fat: 0
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
      .update('foodSize', foodSize => foodSize + trait.getDataModel().food);
  }

  traitRemove(lookup) {
    return this.update('traits', traits => traits.filterNot(lookup))
      .update('foodSize', foodSize => 1 + this.traits.reduce(
        (result, trait) => result + trait.getDataModel().food
        , 0));
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

  getFood() {
    return this.food + this.fat;
  }

  get fat() {
    return this.traits.filter(trait => trait.type === TraitFatTissue && trait.value).size
  }

  getCapacity() {
    return this.foodSize + this.fatSize;
  }

  isFull() { //Without fat
    return this.food >= this.foodSize
      || this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)
  }

  canEat(game) {
    return this.getFood() < this.getCapacity()
      && !this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)
      && !this.hasFlag(TRAIT_ANIMAL_FLAG.SHELL)
      && !this.traits // TODO replace by flag
        .filter(trait => trait.type === TraitSymbiosis && trait.linkSource && trait.hostAnimalId === this.id)
        .some(trait => {
          const {animal: hostAnimal} = game.locateAnimal(trait.linkAnimalId);
          return !hostAnimal.isFull();
        });
  }

  canSurvive() {
    return this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) || this.getFood() >= this.foodSize;
  }

  receiveFood(amount) {
    let self = this;
    let needOfFood = this.foodSize - this.food;
    let needOfFat = this.fatSize - this.fat;
    self = self.set('food', this.food + Math.min(this.foodSize, this.food + amount));


    while (amount > 0 && needOfFat > 0) {
      amount--;
      needOfFat--;
      self = self.updateTrait(
        trait => trait.type === TraitFatTissue && !trait.value
        , trait => trait.set('value', true)
      );
    }
    return self;
  }

  digestFood() {
    let self = this;
    if (!this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)) {
      let toEat = self.foodSize - self.food; // +1 means animal overate, -1 means to generate from fat
      while (toEat > 0 && self.fat > 0) {
        toEat--;
        self = self.updateTrait(
          trait => trait.type === TraitFatTissue && trait.value
          , trait => trait.set('value', false)
          , false
        );
      }
    }
    return self.set('food', 0)
  }

  countScore() {
    return 2 + this.traits.reduce((result, trait) => result + 1 + trait.getDataModel().food, 0);
  }
}