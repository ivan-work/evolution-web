import {Record, Range} from 'immutable';
import uuid from 'node-uuid';

export class CardModel extends Record({
  id: null
  , type: null
  , name: 'UNKNOWN CARD'
  , image: 'http://evolive.ru/images/def.png'
}) {
  static new(cardClass) {
    const id = uuid.v4().slice(0, 4);
    return new CardModel({
      id
      , ...cardClass
    });
  }

  static generate(count) {
    return Range(0, count).map(i => CardModel.new()).toList();
  }

  static fromServer(js) {
    return js == null
      ? null
      : new CardModel(js);
  }

  toString() {
    return `Card #${this.id} (${this.type})`;
  }
}

CardModel.DefaultCard = new CardModel({
  id: 'DefaultCard'
  , name: 'Default Card'
  , description: 'Default Card'
  , imageBack: 'http://evolive.ru/images/def.png'
});