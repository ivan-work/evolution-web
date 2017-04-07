import {Record} from 'immutable';
import uuid from 'node-uuid';
//import {}

export class AnimalModel extends Record({
  id: null
  , card: null
}) {
  static new(card) {
    return new AnimalModel({
      id: uuid.v4().slice(0, 2)
      , card: null
    });
  }

  static fromServer(js) {
    //checkNotNull(js)
    return new AnimalModel(js);
  }

  toOthers() {
    return this.set('card', null);
  }

  toString() {
    return this.id;
  }
}