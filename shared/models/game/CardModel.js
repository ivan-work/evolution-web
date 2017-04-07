import {Record, Range} from 'immutable';
import uuid from 'node-uuid';

export class CardModel extends Record({
  id: null
  , name: 'UNKNOWN CARD'
  , description: 'UNKNOWN CARD'
  , imageFront: ''
  , imageBack: ''
}) {
  static new(index) {
    const id = uuid.v4().slice(0, 4);
    return new CardModel({
      id
      , name: 'Card#' + id
    });
  }

  static generate(count) {
    return Range(0, count).map(i => CardModel.new(i)).toList();
  }

  static fromServer(js) {
    return js == null
      ? null
      : new CardModel(js);
  }

  toString() {
    return this.name
  }
}

CardModel.DefaultCard = new CardModel({
  id: 'DefaultCard'
  , name: 'Default Card'
  , description: 'Default Card'
});