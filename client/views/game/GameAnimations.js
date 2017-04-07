import ReactDOM from 'react-dom';
import Velocity from 'velocity-animate'

export const gameGiveCards = (done, game, cards, Deck, Cards) => {
  const DeckHtml = ReactDOM.findDOMNode(Deck);

  cards.map((card, index) => {
    const CardComponent = Cards[card.id];
    const CardHtml = ReactDOM.findDOMNode(CardComponent);

    const sourceBbx = DeckHtml.getBoundingClientRect();
    const deckOffset = Deck.getXYForCard(game.deck.size + index);
    const targetBbx = CardHtml.getBoundingClientRect();

    Velocity(CardHtml, {
      translateX: -targetBbx.left + sourceBbx.left + deckOffset.x
      , translateY: -targetBbx.top + sourceBbx.top + deckOffset.y
      , rotateY: 180
    }, 0);

    Velocity(CardHtml, {translateX: -targetBbx.left + 200, translateY: -targetBbx.top + 200, rotateY: 90}
      , {
        duration: 200
        , delay: (cards.size - index) * 200
      });

    Velocity(CardHtml, {translateX: 0, translateY: 0, rotateY: 0}
      , {
        duration: 800
      });
  });
  setTimeout(() => done(), cards.size * 200);
};