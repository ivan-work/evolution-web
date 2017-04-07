import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import {CardModel} from '../CardModel';
import {TraitModel} from './TraitModel';
import {TraitDataModel} from './TraitDataModel';

export class AnimalModel extends Record({
  id: null
  , base: null
  , food: 0
  , traits: List()
}) {
  static new(card) {
    return new AnimalModel({
      id: uuid.v4().slice(0, 4)
      , base: card
    });
  }

  static fromServer(js) {
    return js == null
      ? null
      : new AnimalModel(js)
      .set('base', CardModel.fromServer(js.base))
      .set('traits', List(js.traits).map(trait => TraitModel.fromServer(trait)));
  }

  toClient() {
    return this
      .update('traits', traits => traits.map(trait => trait.toClient()))
  }

  toOthers() {
    return this.set('base', null);
  }

  toString() {
    return `Animal#${this.id}`;
  }

  validateTrait(trait) {
    if (!trait.multiple && this.traits.some(t => t.type === trait.type)) {
      return 'duplicate type';
    }
    return true;
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
}