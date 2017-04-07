import {Record} from 'immutable';
import uuid from 'node-uuid';

export class CardModel extends Record({
  id: 'UNKNOWN'
  , name: 'UNKNOWN CARD'
  , description: 'UNKNOWN CARD'
  , imageFront: ''
  , imageBack: ''
}) {
  static new() {
    return new CardModel();
  }
}

CardModel.DefaultCard = new CardModel({
  id: 'DefaultCard'
  , name: 'Default Card'
  , description: 'Default Card'
});