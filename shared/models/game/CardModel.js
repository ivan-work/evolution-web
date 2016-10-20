import {Record, Range} from 'immutable';
import uuid from 'node-uuid';

import {CARD_TARGET_TYPE} from './evolution/constants';

import {TraitDataModel} from './evolution/TraitDataModel'
import {CardUnknown} from './evolution/cardData'


export class CardModel extends Record({
  id: null
  , type: null
  , image: null
  , trait1: null
  , trait2: null
  , trait1type: null
  , trait2type: null
}) {
  static new(cardClass) {
    const id = !process.env.BROWSER
      ? uuid.v4().slice(0, 4)
      : Math.floor(Math.random() * 0xFFFF);
    if (!cardClass) throw new Error('CardClass is null!');
    return CardModel.fromServer({
      id
      , ...cardClass
    });
  }

  static generate(count, cardClass = CardUnknown) {
    return Range(0, count).map(i => CardModel.new(cardClass)).toList();
  }

  static fromServer(js) {
    if (js !== null && js.type !== 'CardUnknown' && js.trait1type === null) {
      throw new Error(`Card ${js.type} doesn't have trait #1`)
    }
    return js == null
      ? null
      : new CardModel(js)
      .set('trait1', js.trait1type ? TraitDataModel.new(js.trait1type) : null)
      .set('trait2', js.trait2type ? TraitDataModel.new(js.trait2type) : null)
      .remove('trait1type')
      .remove('trait2type');
  }

  toClient() {
    return this
      .set('trait1type', this.trait1 && this.trait1.type)
      .set('trait2type', this.trait2 && this.trait2.type)
      .set('trait1', null)
      .set('trait2', null);
  }

  toOthers() {
    return CardModel.new(CardUnknown)
  }

  get traitsCount() {
    return (this.trait1 === null
      ? 0
      : this.trait2 === null
      ? 1
      : 2)
  }

  getTraitDataModel(alternateTrait) {
    return !alternateTrait ? this.trait1 : this.trait2;
  }

  toString() {
    return `Card #${this.id} (${this.type})`;
  }
}