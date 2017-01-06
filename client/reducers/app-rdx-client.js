import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';
import langCodes from '../../i18n';
import {appChangeLanguage} from '../actions/app';

import T from 'i18n-react';

const getInitialState = () => {
  let appSettings = Map();
  if (!process.env.TEST) {
    try {
      appSettings = Map(JSON.parse(window.localStorage.getItem('appSettings')));
    } catch (e) {
      console.error('Error in app-rdx-client', e);
      window.localStorage.removeItem('appSettings')
    }
    if (!appSettings.get('lang')) {
      const userLang = langCodes.hasOwnProperty(window.navigator.language) ? window.navigator.language : 'ru-ru';
      appSettings = appSettings.set('lang', userLang);
    }
  }
  return appSettings;
};

const saveState = (state) => {
  if (!process.env.TEST) window.localStorage.setItem('appSettings', JSON.stringify(state.toJS()));
  return state;
};

export const reducer = createReducer(getInitialState(), {
  appChangeLanguage: (state, data) => saveState(state.set('lang', data))
  , socketConnect: (state, {connectionId}) => state.set('connectionId', connectionId)
});