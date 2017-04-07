import {Record, Range} from 'immutable';
import uuid from 'node-uuid';

export const CARD_TARGET_TYPE = (i => ({
  DROP_AS_ANIMAL: 1 << i++
  , ANIMAL_SELF: 1 << i++
  , ANIMAL_ENEMY: 1 << i++
  , LINK_SELF: 1 << i++
  , LINK_ENEMY: 1 << i++
}))(0);

export class CardModel extends Record({
  id: null
  , type: null
  , name: 'UNKNOWN CARD'
  , image: 'http://evolive.ru/images/def.png'
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