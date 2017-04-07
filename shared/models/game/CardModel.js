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
    return new CardModel({
      id: uuid.v4().slice(0, 2)
      , name: 'Card#' + index
    });
  }
  static generate(count) {
    return Range(0, count).map(i => CardModel.new(i)).toList();
  }
  static fromServer(js) {
    //checkNotNull(js)
    return new CardModel(js);
  }
  toString() {
    return this.name + this.id
  }
}

CardModel.DefaultCard = new CardModel({
  id: 'DefaultCard'
  , name: 'Default Card'
  , description: 'Default Card'
});