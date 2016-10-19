import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import {TraitModel} from './TraitModel';
import {TraitDataModel} from './TraitDataModel';

export class AnimalModel extends Record({
  id: null
  , ownerId: null
  , food: 0
  , traits: List()
}) {
  static new(ownerId) {
    return new AnimalModel({
      id: uuid.v4().slice(0, 4)
      , ownerId
    });
  }

  static fromServer(js) {
    return js == null
      ? null
      : new AnimalModel(js)
      .set('traits', List(js.traits).map(trait => TraitModel.fromServer(trait)));
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
    return this.traits.some(trait => trait.type === type)
  }

  getFood() {
    return this.food;
  }

  getFat() {
    return 0;
  }

  getMaxFood() {
    return 1 + this.traits.reduce((result, trait) => result + trait.dataModel.food, 0);
  }

  getMaxFat() {
    return 0;
  }

  canEat() {
    return this.food < (this.getMaxFood() + this.getMaxFat());
  }

  countScore() {
    return 2 + this.traits.reduce((result, trait) => result + 1 + trait.dataModel.food, 0);
  }
}