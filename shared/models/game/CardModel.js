import {Record} from 'immutable';
import uuid from 'node-uuid';

export class CardModel extends Record({
  id: 'UNKNOWN'
  , name: 'UNKNOWN CARD'
  , description: 'UNKNOWN CARD'
  , imageFront: ''
  , imageBack: ''
}) {
  static fromJS(js) {
    //checkNotNull(js)
    return new CardModel(js);
  }
  static new(index) {
    return new CardModel({
      id: index
      , name: 'Card#' + index
    });
  }
  toString() {
    return this.name;
  }
}

CardModel.DefaultCard = new CardModel({
  id: 'DefaultCard'
  , name: 'Default Card'
  , description: 'Default Card'
});