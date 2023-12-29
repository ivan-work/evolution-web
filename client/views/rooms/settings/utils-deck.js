import React from "react";
import T from "i18n-react";

import memoizeOne from "memoize-one";
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual'

import * as cards from "../../../../shared/models/game/evolution/cards";
import {
  Deck_Base,
  Deck_Bonus,
  Deck_ContinentsShort
  , Deck_customff
  , Deck_lifecycle,
  Deck_Plantarium,
  Deck_TimeToFly
} from "../../../../shared/models/game/GameSettings";

const makeDeckHelp = (deck) => (
  <div>
    {deck.map(([count, cardType], index) => {
      const card = cards[cardType];
      let traits = '';
      if (card.trait1) traits += T.translate('Game.Trait.' + card.trait1);
      if (card.trait2) traits += '/' + T.translate('Game.Trait.' + card.trait2);
      return (<div key={index}>{count}x {traits}</div>)
    })}
  </div>
);

const countDeckCards = (deck) => deck.reduce((result, [count]) => result + count, 0);

export const decksHelper = {
  'addon_base': {
    cardCount: countDeckCards(Deck_Base)
    , help: makeDeckHelp(Deck_Base)
  },
  'addon_base2': {
    cardCount: countDeckCards(Deck_Base)
    , help: makeDeckHelp(Deck_Base)
  }
  , 'addon_timeToFly': {
    cardCount: countDeckCards(Deck_TimeToFly)
    , help: makeDeckHelp(Deck_TimeToFly)
  }
  , 'addon_continents': {
    cardCount: countDeckCards(Deck_ContinentsShort)
    , help: makeDeckHelp(Deck_ContinentsShort)
  }
  , 'addon_bonus': {
    cardCount: countDeckCards(Deck_Bonus)
    , help: makeDeckHelp(Deck_Bonus)
  }
  , 'addon_plantarium': {
    cardCount: countDeckCards(Deck_Plantarium)
    , help: makeDeckHelp(Deck_Plantarium)
  }
  , 'addon_customff': {
    cardCount: countDeckCards(Deck_customff)
    , help: makeDeckHelp(Deck_customff)
  }
  , 'addon_lifecycle': {
    cardCount: countDeckCards(Deck_lifecycle)
    , help: makeDeckHelp(Deck_lifecycle)
  }
};

export const getCardsTotal = (model) => {
  let total = Object.keys(decksHelper)
    .filter(addonName => model[addonName])
    .map(addonName => decksHelper[addonName].cardCount)
    .reduce((result, addonCardCount) => result + addonCardCount, 0);

  if (model.halfDeck) {
    total *= .5;
  }

  return total;
};

const fieldsToCheck = [...Object.keys(decksHelper), 'halfDeck'];

const modelEquality = ([m1], [m2]) => isEqual(pick(m1, fieldsToCheck), pick(m2, fieldsToCheck));

export const getMemoizedCardsTotal = () => memoizeOne(getCardsTotal, modelEquality);