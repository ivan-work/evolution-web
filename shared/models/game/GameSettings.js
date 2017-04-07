import {Record} from 'immutable';

export const SETTINGS_PLAYERS = [2, 8];
export const SETTINGS_TIME_VALUES = [0, 60 * 24 * 6000];

export const SettingsRules = {
  name: 'required|string|between:6,12|regex:/^[a-zA-Zа-яА-Я\\d\\s]*$/'
  , maxPlayers: `required|integer|between:${SETTINGS_PLAYERS[0]},${SETTINGS_PLAYERS[1]}`
  , timeTurn: `required|numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
  , timeTraitResponse: `required|numeric|between:${SETTINGS_TIME_VALUES[0]},${SETTINGS_TIME_VALUES[1]}`
};

export const SettingsRecord = Record({
  maxPlayers: 4
  , timeTurn: 2 * 6000
  , timeTraitResponse: .5 * 6000
});
