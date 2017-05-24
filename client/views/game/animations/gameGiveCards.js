import ReactDOM from 'react-dom';
import Velocity from 'velocity-animate'

import {CardUnknown} from '../../../../shared/models/game/evolution/cards/index'
import PlayerSticker from '../PlayerSticker.jsx';

export const gameGiveCards = (game, cards, getRef) => {
  const DELAY = 100;
  const DURATION = 800;

  const Deck = getRef('Deck');
  const DeckHtml = ReactDOM.findDOMNode(Deck);

  if (!Deck || !DeckHtml) return;

  return Promise.all(cards.map((card, index) => Promise.resolve()
    .then(() => {
      const CardHtml = document.getElementById('Card' + card.id);

      const sourceBbx = DeckHtml.getBoundingClientRect();
      const deckOffset = Deck.getXYForCard(game.deck.size - cards.size + index);
      const targetBbx = CardHtml.getBoundingClientRect();
      // console.log(CardHtml, targetBbx)

      const CardClone = CardHtml.cloneNode(true);
      CardHtml.classList.add('invisible');
      CardClone.style.position = 'absolute';
      CardClone.style.top = '0px';
      CardClone.style.left = '0px';
      CardClone.style.zIndex = '100';
      window.document.body.appendChild(CardClone);
      CardClone.classList.add('cover');

      return Promise.resolve()
        .then(() =>
          Velocity(CardClone, {
            translateX: sourceBbx.left + deckOffset.x
            , translateY: sourceBbx.top + deckOffset.y
          }, 0))
        .then(() => new Promise(resolve => setTimeout(resolve, DELAY * index)))
        .then(() => {
          if (CardHtml.classList.contains('isUser')) // For old UI
            Velocity(CardClone, {rotateY: 90}
              , {duration: DURATION / 2, queue: false})
              .then(() => CardClone.classList.remove('cover'))
              .then(() => Velocity(CardClone, {rotateY: 0}
                , {duration: DURATION / 2, queue: false}));
          return Velocity(CardClone, {
              translateX: targetBbx.left
              , translateY: targetBbx.top
            }
            , DURATION)
        })
        .then(() => {
          window.document.body.removeChild(CardClone);
          CardHtml.classList.remove('invisible');
        })
        .catch((e) => {
          console.error(e);
          window.document.body.removeChild(CardClone);
        })
    })
  ));
};

export const gameGiveCardsOther = (userId, deckSize, cards, getRef) => {
  const DELAY = 100;
  const DURATION = 800;

  const Deck = getRef('Deck');
  const DeckHtml = ReactDOM.findDOMNode(Deck);

  return Promise.all(cards.map((card, index) => Promise.resolve()
    .then(() => {
      const CardHtml = document.getElementById('Card' + card.id);
      const StickerHtml = PlayerSticker.getContainerById(userId);
      const CardClone = CardHtml.cloneNode(true);
      CardClone.style.position = 'absolute';
      CardClone.style.top = '0px';
      CardClone.style.left = '0px';
      CardClone.style.zIndex = '100';
      window.document.body.appendChild(CardClone);

      const sourceBbx = DeckHtml.getBoundingClientRect();
      const deckOffset = Deck.getXYForCard(deckSize - cards.size + index);
      const targetBbx = StickerHtml.getBoundingClientRect();

      CardHtml.classList.add('invisible');
      CardClone.classList.add('cover');
      return Promise.resolve()
        .then(() =>
          Velocity(CardClone, {
            translateX: sourceBbx.left + deckOffset.x
            , translateY: sourceBbx.top + deckOffset.y
          }, 0))
        .then(() => new Promise(resolve => setTimeout(resolve, DELAY * index)))
        .then(() => {
          return Velocity(CardClone, {
              translateX: targetBbx.left
              , translateY: targetBbx.top + targetBbx.height * .9
              , rotateX: 90
            }
            , DURATION)
        })
        .then(() => {
          window.document.body.removeChild(CardClone);
          CardHtml.classList.remove('invisible');
        })
        .catch(() => {
          window.document.body.removeChild(CardClone);
        })
    })
  ));
};