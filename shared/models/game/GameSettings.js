import {List, Map, Record} from 'immutable';
import * as cardsData from './evolution/cards/index';

export const SETTINGS_PLAYERS = [2, 8];

export const SETTINGS_TIME_VALUES = [.5, 20];

export const SETTINGS_TIME_MODIFIER = 60000; // by 1 minute

export const SettingsRules = {
  name: 'string|between:4,20|regex:/^[a-zA-Zа-яА-Я\\d\\s]*$/'
  , maxPlayers: `integer|between:${SETTINGS_PLAYERS[0]},${SETTINGS_PLAYERS[1]}`
  , timeTurn: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , timeTraitResponse: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , halfDeck: `boolean`
  , addon_timeToFly: `boolean`
  , addon_continents: `boolean`
  , addon_bonus: `boolean`
  , addon_plantarium: `boolean`
};

export class SettingsRecord extends Record({
  maxPlayers: 4
  , timeTurn: process.env.TEST ? 0 : 4 * SETTINGS_TIME_MODIFIER
  , timeTraitResponse: process.env.TEST ? 0 : 1 * SETTINGS_TIME_MODIFIER
  , halfDeck: false
  , addon_timeToFly: false
  , addon_continents: false
  , addon_bonus: false
  , addon_plantarium: false
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
    return this.mergeWith((prev, next, key) => {
      //console.log(prev, next, key, Number.isInteger(next));
      switch (key) {
        case 'halfDeck':
        case 'addon_timeToFly':
        case 'addon_continents':
        case 'addon_bonus':
        case 'addon_plantarium':
          return next;
        default:
          return Number.isInteger(+next) ? next : prev;
      }
    }, SettingsRecord.fromJS(settings));
  }
}

export const Deck_Base = [
  // 0
  [4, cardsData.CardPiracy.type]
  , [4, cardsData.CardPoisonousAndCarnivorous.type]
  , [4, cardsData.CardGrazingAndFatTissue.type]
  , [4, cardsData.CardMimicry.type]
  // 1
  , [4, cardsData.CardScavenger.type]
  , [8, cardsData.CardSwimming.type]
  , [4, cardsData.CardHibernationAndCarnivorous.type]
  , [4, cardsData.CardRunning.type]
  // 2
  , [4, cardsData.CardTailLoss.type]
  , [4, cardsData.CardCamouflageAndFatTissue.type]
  , [4, cardsData.CardMassiveAndCarnivorous.type]
  , [4, cardsData.CardMassiveAndFatTissue.type]
  // 3
  , [4, cardsData.CardParasiteAndCarnivorous.type]
  , [4, cardsData.CardParasiteAndFatTissue.type]
  , [4, cardsData.CardBurrowingAndFatTissue.type]
  , [4, cardsData.CardSharpVisionAndFatTissue.type]
  // 4
  , [4, cardsData.CardSymbiosis.type]
  , [4, cardsData.CardCooperationAndCarnivorous.type]
  , [4, cardsData.CardCommunicationAndFatTissue.type]
  , [4, cardsData.CardCommunicationAndCarnivorous.type]
];

export const Deck_TimeToFly = [

];