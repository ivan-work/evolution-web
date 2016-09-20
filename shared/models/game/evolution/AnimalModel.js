import {Record} from 'immutable';
import uuid from 'node-uuid';
import {CardModel} from '../CardModel';

export class AnimalModel extends Record({
  id: null
  , card: null
}) {
  static new(card) {
    return new AnimalModel({
      id: uuid.v4().slice(0, 4)
      , card: card
    });
  }

  static fromServer(js) {
    return js == null
      ? null
      : new AnimalModel(js)
      .set('card', CardModel.fromServer(js.card));
  }

  toOthers() {
    return this.set('card', null);
  }

  toString() {
    return `Animal#${this.id}`;
  }
}