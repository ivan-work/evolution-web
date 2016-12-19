import {List, Map, Record} from 'immutable';
import * as cardsData from './evolution/cards/index';

export const SETTINGS_PLAYERS = [2, 8];
export const SETTINGS_TIME_VALUES = [0, 60 * 24 * 6000];

export const SettingsRules = {
  name: 'string|between:6,12|regex:/^[a-zA-Zа-яА-Я\\d\\s]*$/'
  , maxPlayers: `integer|between:${SETTINGS_PLAYERS[0]},${SETTINGS_PLAYERS[1]}`
  , timeTurn: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , timeTraitResponse: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , decks: `array`
};

export class SettingsRecord extends Record({
  maxPlayers: 4
  , timeTurn: 2 * 6000
  , timeTraitResponse: .5 * 6000
  , decks: List(['Base'])
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
    const ops = [];
    return this.merge(SettingsRecord.fromJS(settings))
    //roomEditSettings
  }
}

const TestDecks = {
  TEST: [[24, cardsData.CardCamouflage.type]]
  , CommunicationCarnivorous: [
    [24, cardsData.CardCommunicationAndCarnivorous.type]
  ]
};

const NormalDecks = {
  Base: [
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
    , [4, cardsData.CardHighBodyWeightAndCarnivorous.type]
    , [4, cardsData.CardHighBodyWeightAndFatTissue.type]
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
  ]
};

export const Decks = Object.assign({}, NormalDecks, process.env.NODE_ENV !== 'production' ? TestDecks : null);