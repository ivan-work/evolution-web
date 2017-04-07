import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import {CardModel} from '../CardModel';

export class AnimalModel extends Record({
  id: null
  , base: null
  , cards: List()
}) {
  static new(card) {
    return new AnimalModel({
      id: card.id//uuid.v4().slice(0, 4)
      , base: card
    });
  }

  static fromServer(js) {
    return js == null
      ? null
      : new AnimalModel(js)
      .set('base', CardModel.fromServer(js.base))
      .set('cards', List(js.cards).map(card => CardModel.fromServer(card)));
  }

  toOthers() {
    return this.set('base', null);
  }

  toString() {
    return `Animal#${this.id}`;
  }

  validateTrait(card) {
    if (!card.trait.multiple && this.cards.some(c => c.type === card.type)) {
      return 'duplicate type';
    }

    return true;
  }
}