import {Record, Range} from 'immutable';
import uuid from 'node-uuid';

import {CARD_TARGET_TYPE} from './evolution/constants';

import {CardUnknown} from './evolution/cards'


export class CardModel extends Record({
  id: null
  , type: null
  , name: null
  , image: null
  , target: CARD_TARGET_TYPE.DROP_AS_ANIMAL
  , trait1type: null
  , trait2type: null
}) {
  static new(cardClass) {
    const id = uuid.v4().slice(0, 4);
    return CardModel.fromServer({
      id
      , ...cardClass
    });
  }

  static generate(count) {
    return Range(0, count).map(i => CardModel.new(CardUnknown)).toList();
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