import {Record, List, Map} from 'immutable';
import uuid from 'uuid';
import {TraitModel} from './TraitModel';

import {TraitFatTissue, TraitSymbiosis} from './traitTypes/index';
import {TRAIT_ANIMAL_FLAG} from './constants';

export class AnimalModel extends Record({
  id: null
  , ownerId: null
  , food: 0
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

  hasFlag(flag) {
    return this.flags.get(flag);
  }

  getFood() {
    return this.food + this.getFat();
  }

  getFat() {
    return this.traits.filter(trait => trait.type === TraitFatTissue && trait.value).size
  }

  sizeOfNormalFood() {
    return 1 + this.traits.reduce((result, trait) => result + trait.getDataModel().food, 0);
  }

  sizeOfFat() {
    return this.traits.filter(trait => trait.type === TraitFatTissue).size
  }

  canEat(game) {
    return this.needsFood() > 0
      && !this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)
      && !this.traits
        .filter(trait => trait.type === TraitSymbiosis && trait.linkSource && trait.hostAnimalId === this.id)
        .some(trait => {
          //console.log(`${this.id} is living on ${trait.linkAnimalId}`);
          const {animal: hostAnimal} = game.locateAnimal(trait.linkAnimalId);
          //console.log(`And ${trait.linkAnimalId} ${hostAnimal.canSurvive() ? `can` : `can't`} survive`)
          return !hostAnimal.canSurvive();
        });
  }

  needsFood() {
    return this.sizeOfNormalFood() + this.sizeOfFat() - this.getFood();
  }

  canSurvive() {
    return this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) || this.getFood() >= this.sizeOfNormalFood();
  }

  updateTrait(filterFn, updateFn, direction = true) {
    const index = this.traits[direction ? 'findIndex' : 'findLastIndex'](filterFn);
    return (~index
      ? this.updateIn(['traits', index], updateFn)
      : this);
  }

  receiveFood(amount) {
    let self = this;
    let needOfNormalFood = this.sizeOfNormalFood() - this.food;
    let needOfFat = this.sizeOfFat() - this.getFat();
    while (amount > 0 && needOfNormalFood > 0) {
      amount--;
      needOfNormalFood--;
      self = self.update('food', food => ++food)
    }
    while (amount > 0 && needOfFat > 0) {
      amount--;
      needOfFat--;
      self = self.updateTrait(
        trait => trait.type === TraitFatTissue && !trait.value
        , trait => trait.set('value', true)
      );
    }
//    console.log(`${this.id} has ${self.getFood()} (${self.food}/${self.getFood() - self.food}).
//Needs ${needOfNormalFood}/${needOfFat}`);
    return self;
  }

  digestFood() {
    let self = this;
    if (!this.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)) {
      let foodBalance = this.food - this.sizeOfNormalFood(); // +1 means animal overate, -1 means to generate from fat
      while (foodBalance < 0 && self.getFat() > 0) {
        foodBalance++;
        self = self.updateTrait(
          trait => trait.type === TraitFatTissue && trait.value
          , trait => trait.set('value', false)
          , false
        );
      }
    }
    return self
      .set('food', 0)
  }

  countScore() {
    return 2 + this.traits.reduce((result, trait) => result + 1 + trait.getDataModel().food, 0);
  }
}