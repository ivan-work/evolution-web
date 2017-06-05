import {List, Map, Record} from 'immutable';
import * as cardsData from './evolution/cards/index';

export const SETTINGS_PLAYERS = [2, 8];

export const SETTINGS_TIME_VALUES = [.1, 5];

export const SETTINGS_MINUTES = 60e3; // by 1 minute

export const SETTINGS_TIMED_OUT_TURN_TIME = 5e3;
export const SETTINGS_AMBUSH_TIME = 10e3;
export const SETTINGS_DEFAULT_TIME_TURN = 2 * SETTINGS_MINUTES;
export const SETTINGS_DEFAULT_TIME_TRAIT = 1 * SETTINGS_MINUTES;

export const SettingsRules = {
  name: 'string|between:4,20|required|regex:/^[a-zA-Zа-яА-ЯёЁ\\d\\s]*$/'
  , maxPlayers: `integer|between:${SETTINGS_PLAYERS[0]},${SETTINGS_PLAYERS[1]}`
  , timeTurn: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , timeTraitResponse: `numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , randomPlayers: `boolean`
  , halfDeck: `boolean`
  , addon_timeToFly: `boolean`
  , addon_continents: `boolean`
  , addon_bonus: `boolean`
  , addon_plantarium: `boolean`
};

export class SettingsRecord extends Record({
  maxPlayers: 4
  , timeTurn: SETTINGS_DEFAULT_TIME_TURN
  , timeTraitResponse: SETTINGS_DEFAULT_TIME_TRAIT
  , timeAmbush: SETTINGS_AMBUSH_TIME
  , randomPlayers: !process.env.TEST
  , halfDeck: false
  , addon_timeToFly: false
  , addon_continents: false
  , addon_bonus: false
  , addon_plantarium: false
  , seed: null
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
        case 'randomPlayers':
        case 'halfDeck':
        case 'addon_timeToFly':
        case 'addon_continents':
        case 'addon_bonus':
        case 'addon_plantarium':
        case 'seed':
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
//0
//полёт / хищник - 2,
//полёт / специализация А - 2,
//полёт / специализация В - 2,
//интеллект / жировой запас - 2,
  [2, cardsData.CardFlightAndCarnivorous.type]
  , [2, cardsData.CardFlightAndSpecA.type]
  , [2, cardsData.CardFlightAndSpecB.type]
  , [2, cardsData.CardIntellectAndFatTissue.type]
//1
//интеллект / специализация А - 2,
//засада / специализация В - 2,
//засада / водоплавающее - 2,
//удильщик - 4,
  , [2, cardsData.CardIntellectAndSpecA.type]
  , [2, cardsData.CardAmbushAndSpecB.type]
  , [2, cardsData.CardAmbushAndSwimming.type]
  , [4, cardsData.CardAnglerfish.type]
//2
//чернильное облако - 4,
//раковина - 4,
//метаморфоза / хищник - 2,
//метаморфоза / специализация А - 2,
//живорождение / специализация В - 2,
  , [4, cardsData.CardInkCloud.type]
  , [4, cardsData.CardShell.type]
  , [2, cardsData.CardMetamorphoseAndCarnivorous.type]
  , [2, cardsData.CardMetamorphoseAndSpecA.type]
  , [2, cardsData.CardViviparousAndSpecB.type]
//3
//живорождение / водоплавающее - 2,
//трематода / сотрудничество - 4,
//трематода / взаимодействие - 2,
//трематода / жировой запас - 2.
  , [2, cardsData.CardViviparousAndSwimming.type]
  , [4, cardsData.CardTrematodeAndCommunication.type]
  , [2, cardsData.CardTrematodeAndCooperation.type]
  , [2, cardsData.CardTrematodeAndFatTissue.type]
];

export const Deck_ContinentsShort = [
// 0
// стадность / водоплавающее - 2,
// стадность / сотрудничество - 4,
// стадность / хищник - 2,
// миграция / хищник - 4,

// 1
// миграция / водоплавающее - 4,
// прилипала / водоплавающее - 2,
// прилипала / сотрудничество - 2,
// регенерация / сотрудничество - 2,
  [2, cardsData.CardRegenerationAndCommunication.type]

// 2
// регенерация / водоплавающее - 2,
// регенерация / хищник - 2,
// стрекательные клетки / водоплавающее - 2,
// стрекательные клетки / взаимодействие - 2,

  , [2, cardsData.CardRegenerationAndSwimming.type]
  , [2, cardsData.CardRegenerationAndCarnivorous.type]
  , [2, cardsData.CardCnidocytesAndSwimming.type]
  , [2, cardsData.CardCnidocytesAndCooperation.type]

// 3
// рекомбинация / хищник - 2,
// рекомбинация / водоплавающее - 2,
// эдификатор / хищник - 2,
// эдификатор / водоплавающее - 2,

  , [2, cardsData.CardRecombinationAndSwimming.type]
  , [2, cardsData.CardRecombinationAndCarnivorous.type]
  , [2, cardsData.CardAedificatorAndSwimming.type]
  , [2, cardsData.CardAedificatorAndCarnivorous.type]

// 4
// неоплазия / водоплавающее - 2,
// неоплазия / взаимодействие - 2.

  , [2, cardsData.CardNeoplasmAndSwimming.type]
  , [2, cardsData.CardNeoplasmAndCooperation.type]
];

export const Deck_Bonus = [
  // 0
  // r-Strategy 6
  // Homeothermy/Swimming 3
  // Homeothermy/Fat 3
  // Shy/Swimming 3
  // Shy/Carnivorous 3
  [6, cardsData.CardRstrategy.type]
  , [3, cardsData.CardHomeothermyAndSwimming.type]
  , [3, cardsData.CardHomeothermyAndFatTissue.type]
  , [3, cardsData.CardShyAndSwimming.type]
  , [3, cardsData.CardShyAndCarnivorous.type]
];