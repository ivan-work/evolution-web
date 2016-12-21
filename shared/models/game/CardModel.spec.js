import {CardModel} from './CardModel';
import {CardCamouflage} from './evolution/cards/index';

describe('CardModel:', function () {
  it('encode/decode', () => {
    const card = CardModel.new(CardCamouflage.type);
    expect(card.type).equal('CardCamouflage');
    expect(card.trait1).equal('TraitCamouflage');

    const cardJS = card.toClient();
    expect(cardJS.get('type'), 'cardJS.type').equal('CardCamouflage');
    expect(cardJS.get('trait1')).equal('TraitCamouflage');

    const cardFromJS = CardModel.fromServer(cardJS);
    expect(cardFromJS.type).equal('CardCamouflage');
    expect(cardFromJS.trait1).equal('TraitCamouflage');
  })
});