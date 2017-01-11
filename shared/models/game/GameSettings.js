import {List, Map, Record} from 'immutable';
import * as cardsData from './evolution/cards/index';

export const SETTINGS_PLAYERS = [2, 8];

export const SETTINGS_TIME_VALUES = [0, 20];

export const SETTINGS_TIME_MODIFIER = 60000; // by 1 minute

export const SettingsRules = {
  name: 'string|between:6,12|regex:/^[a-zA-Zа-яА-Я\\d\\s]*$/'
  , maxPlayers: `integer|between:${SETTINGS_PLAYERS[0]},${SETTINGS_PLAYERS[1]}`
  , timeTurn: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , timeTraitResponse: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , baseType: `string|in:Base,Base2`
  , decks: `array`
};

export class SettingsRecord extends Record({
  maxPlayers: 4
  , timeTurn: process.env.TEST ? 0 : 4 * SETTINGS_TIME_MODIFIER
  , timeTraitResponse: process.env.TEST ? 0 : 1 * SETTINGS_TIME_MODIFIER
  , baseType: `Base2`
  , decks: List(['Base2'])
}) {
  static fromJS(js) {
    return js == null
      ? new SettingsRecord()
      : new SettingsRecord({
      ...js
      , decks: List(js.decks)
    });
  }

  applySettings(settings) {
    if (settings.baseType === 'Base') {
      settings.decks = List(['Base']);
    } else if (settings.baseType === 'Base2') {
      settings.decks = List(['Base2']);
    }

    return this.mergeWith((prev, next, key) => {
      //console.log(prev, next, key, Number.isInteger(next));
      switch (key) {
        case 'decks':
          return next.size > 0 ? next : prev;
        case 'baseType':
          return next;
        default:
          return Number.isInteger(+next) ? next : prev;
      }
    }, SettingsRecord.fromJS(settings));
  }
}

const TestDecks = {
  TEST: [[24, cardsData.CardCamouflage.type]]
  , CommunicationCarnivorous: [
    [24, cardsData.CardCommunicationAndCarnivorous.type]
  ]
};

const Base = [
  // 0
  [2, cardsData.CardPiracy.type]
  , [2, cardsData.CardPoisonousAndCarnivorous.type]
  , [2, cardsData.CardGrazingAndFatTissue.type]
  , [2, cardsData.CardMimicry.type]
  // 1
  , [2, cardsData.CardScavenger.type]
  , [4, cardsData.CardSwimming.type]
  , [2, cardsData.CardHibernationAndCarnivorous.type]
  , [2, cardsData.CardRunning.type]
  // 2
  , [2, cardsData.CardTailLoss.type]
  , [2, cardsData.CardCamouflageAndFatTissue.type]
  , [2, cardsData.CardMassiveAndCarnivorous.type]
  , [2, cardsData.CardMassiveAndFatTissue.type]
  // 3
  , [2, cardsData.CardParasiteAndCarnivorous.type]
  , [2, cardsData.CardParasiteAndFatTissue.type]
  , [2, cardsData.CardBurrowingAndFatTissue.type]
  , [2, cardsData.CardSharpVisionAndFatTissue.type]
  // 4
  , [2, cardsData.CardSymbiosis.type]
  , [2, cardsData.CardCooperationAndCarnivorous.type]
  , [2, cardsData.CardCommunicationAndFatTissue.type]
  , [2, cardsData.CardCommunicationAndCarnivorous.type]
];

const NormalDecks = {
  Base
  , Base2: Base.map(([count, type]) => [count * 2, type])
};

export const DeckVariants = Object.assign({}, NormalDecks, process.env.NODE_ENV !== 'production' ? TestDecks : null);