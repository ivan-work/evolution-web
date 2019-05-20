import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';
import langCodes from '../../i18n';

const loadValue = (key, defValue) => {
  let value = null;
  if (!process.env.TEST) {
    try {
      value = window.localStorage.getItem(key);
    } catch (e) {
      console.warn('Error in app-rdx-client', e);
      window.localStorage.removeItem(key);
    }
    return value !== null ? value : defValue;
  }
};

const saveValue = (key, value) => {
  if (!process.env.TEST) window.localStorage.setItem(key, '' + value);
  return value;
};

const getInitialState = () => Map({
  lang: loadValue('lang', langCodes.hasOwnProperty(window.navigator.language) ? window.navigator.language : 'ru-ru')
  , sound: 'true' === loadValue('sound', 'true')
  , uiv3: 'true' === loadValue('uiv3', 'true')
  , adminMode: process.env.NODE_ENV !== 'production'
});

export const reducer = createReducer(getInitialState(), {
  appChangeLanguage: (state, data) => state.set('lang', saveValue('lang', data))
  , appChangeSound: (state, data) => state.set('sound', saveValue('sound', data))
  , setAdminMode: (state, data) => state.set('adminMode', !state.get('adminMode'))
  , socketConnectClient: (state, {connectionId}) => state.set('connectionId', connectionId)
  , appUseUIv3: (state, data) => state.set('uiv3', saveValue('uiv3', data))
});