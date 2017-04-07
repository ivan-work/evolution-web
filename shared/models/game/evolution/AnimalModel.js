import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import {CardModel} from '../CardModel';
import {TraitModel} from './TraitModel';

export class AnimalModel extends Record({
  id: null
  , base: null
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
}