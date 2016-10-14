import ReactDOM from 'react-dom';
import Velocity from 'velocity-animate'

import {CardUnknown} from '../../../shared/models/game/evolution/cards'

export const gameGiveCards = (done, game, cards, Deck, Cards) => {
  const DeckHtml = ReactDOM.findDOMNode(Deck);
  console.log('game.deck.size', game.deck.size);

  cards.map((card, index) => {
    try {
      const CardComponent = Cards[card.id];
      console.log(CardComponent);
      const CardHtml = ReactDOM.findDOMNode(CardComponent);

      const sourceBbx = DeckHtml.getBoundingClientRect();
      const deckOffset = Deck.getXYForCard(game.deck.size + index);
      const targetBbx = CardHtml.getBoundingClientRect();

      const style = {
        innerHTML: CardHtml.innerHTML
        , backgroundImage: CardHtml.style.backgroundImage
      };
      CardHtml.innerHTML = '';
      CardHtml.style.backgroundImage = `url(${CardUnknown.image})`;

      Velocity(CardHtml, {
        translateX: -targetBbx.left + sourceBbx.left + deckOffset.x
        , translateY: -targetBbx.top + sourceBbx.top + deckOffset.y
        , rotateY: 0
      }, 0);

      Velocity(CardHtml, {translateX: -targetBbx.left + 200, translateY: -targetBbx.top + 200, rotateY: 90}
        , {
          duration: 800
          , delay: (cards.size - index) * 200
          , easing: 'easeOutCubic'
          , complete: () => {
            CardHtml.innerHTML = style.innerHTML;
            CardHtml.style.backgroundImage = style.backgroundImage;
          }
        });

      Velocity(CardHtml, {translateX: 0, translateY: 0, rotateY: 0}
        , {
          duration: 800
          , easing: 'easeInOutCubic'
        });
    } catch (e) {
      console.error(e)
    }
  });
  setTimeout(() => done(), cards.size * 200);
};