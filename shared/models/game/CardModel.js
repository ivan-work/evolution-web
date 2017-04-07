import {Record, Range} from 'immutable';
import uuid from 'node-uuid';

export const TARGET_TYPE = (i => ({
  DROP_AS_ANIMAL: 1 << i++
  , ANIMAL_SELF: 1 << i++
  , ANIMAL_ENEMY: 1 << i++
  , LINK_SELF: 1 << i++
  , LINK_ENEMY: 1 << i++
}))(0);

export class Trait extends Record({
  active: false
}) {
}

export class CardModel extends Record({
  id: null
  , type: null
  , name: 'UNKNOWN CARD'
  , image: 'http://evolive.ru/images/def.png'
  , target: -1
  , trait: null
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
      : new CardModel(js)
      .set('trait', new Trait(js.trait));
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