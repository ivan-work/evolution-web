import {List, Map, Record} from 'immutable';
import * as cardData from './evolution/cardData';

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
  //TEST: [[24, cardData.CardCamouflage]]
  //, CommunicationCarnivorous: [
  //  [24, cardData.CardCommunicationAndCarnivorous]
  //]
};

const NormalDecks = {
  Base: [
    // 0
    //[4, cardData.CardPiracy]
    //, [4, cardData.CardPoisonousAndCarnivorous]
    //, [4, cardData.CardGrazingAndFatTissue]
    //, [4, cardData.CardMimicry]
    //// 1
    //, [4, cardData.CardScavenger]
    //, [8, cardData.CardSwimming]
    //, [4, cardData.CardHibernationAndCarnivorous]
    //, [4, cardData.CardRunning]
    //// 2
    //, [4, cardData.CardTailLoss]
    //, [4, cardData.CardCamouflageAndFatTissue]
    //, [4, cardData.CardHighBodyWeightAndCarnivorous]
    //, [4, cardData.CardHighBodyWeightAndFatTissue]
    //// 3
    //, [4, cardData.CardParasiteAndCarnivorous]
    //, [4, cardData.CardParasiteAndFatTissue]
    //, [4, cardData.CardBurrowingAndFatTissue]
    //, [4, cardData.CardSharpVisionAndFatTissue]
    //// 4
    //, [4, cardData.CardSymbiosis]
    //, [4, cardData.CardCooperationAndCarnivorous]
    //, [4, cardData.CardCommunicationAndFatTissue]
    //, [4, cardData.CardCommunicationAndCarnivorous]
  ]
};

export const Decks = Object.assign({}, NormalDecks, process.env.NODE_ENV !== 'production' ? TestDecks : null);