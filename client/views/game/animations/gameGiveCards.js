import ReactDOM from 'react-dom';
import Velocity from 'velocity-animate'

import {CardUnknown} from '../../../../shared/models/game/evolution/cards/index'

export const gameGiveCards = (done, game, cards, getRef) => {
  const DELAY = 200;
  const DURATION = 400;

  const Deck = getRef('Deck');
  const DeckHtml = ReactDOM.findDOMNode(Deck);

  cards.map((card, index) => {
    const CardHtml = document.getElementById('Card' + card.id);

    //console.log(`index ${index}`, `deck pos ${game.deck.size - cards.size + index}`, cards.map(c => c.id).toArray());

    const sourceBbx = DeckHtml.getBoundingClientRect();
    const deckOffset = Deck.getXYForCard(game.deck.size - cards.size + index);
    const targetBbx = CardHtml.getBoundingClientRect();

    CardHtml.classList.add('cover');

    return Velocity(CardHtml, {
      translateX: -targetBbx.left + sourceBbx.left + deckOffset.x
      , translateY: -targetBbx.top + sourceBbx.top + deckOffset.y
      , rotateY: 0
    }, 0)
      .then(() =>
        Velocity(CardHtml, {translateX: -targetBbx.left + 200, translateY: -targetBbx.top + 200, rotateY: 90}
          , {
            duration: DURATION
            , delay: (cards.size - index + 1) * DELAY
            , easing: 'easeOutCubic'
            , complete: () => {
              if (CardHtml.classList.contains('isUser')) CardHtml.classList.remove('cover');
            }
          }))
      .then(() =>
        Velocity(CardHtml, {translateX: 0, translateY: 0, rotateY: 0}
          , {
            duration: DURATION
            , easing: 'easeInOutCubic'
          }))
  });
  setTimeout(() => done(), (cards.size + 1) * DELAY);
};