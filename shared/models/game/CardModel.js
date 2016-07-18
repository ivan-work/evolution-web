import uuid from 'node-uuid';

export class CardModel extends Record({
  id: 'UNKNOWN'
  , name: 'UNKNOWN CARD'
  , description: 'UNKNOWN CARD'
  , imageFront: ''
  , imageBack: ''
}) {
}

CardModel.DefaultCard = CardModel.new();