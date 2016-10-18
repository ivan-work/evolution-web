import {CardModel} from './CardModel';
import {CardCamouflage} from './evolution/cardData';

describe('CardModel:', function () {
  it('encode/decode', () => {
    const card = CardModel.new(CardCamouflage);
    expect(card.type).equal('CardCamouflage');
    expect(card.trait1).ok;
    expect(card.trait1.type).equal('TraitCamouflage');

    const cardJS = card.toClient();
    expect(cardJS.get('type'), 'cardJS.type').equal('CardCamouflage');
    expect(cardJS.get('trait1')).null;
    expect(cardJS.get('trait1type')).equal('TraitCamouflage');

    const cardFromJS = CardModel.fromServer(cardJS);
    expect(cardFromJS.type).equal('CardCamouflage');
    expect(cardFromJS.trait1).ok;
    expect(cardFromJS.trait1.type).equal('TraitCamouflage');
  })
});