import {Map, Set} from 'immutable';
import {createReducer} from '~/shared/utils';
import langCodes from '../../i18n';

const loadValue = (key, defValue) => {
  let value = null;
  if (!process.env.TEST) {
    try {
      value = JSON.parse(window.localStorage.getItem(key));
    } catch (e) {
      window.localStorage.removeItem(key);
    }
    return value !== null ? value : defValue;
  }
};

const loadJSONValue = (key, defValue) => {
  let value = null;
  if (!process.env.TEST) {
    try {
      value = JSON.parse(window.localStorage.getItem(key));
    } catch (e) {
      window.localStorage.removeItem(key);
    }
    return value !== null ? value : defValue;
  }
};

const saveValue = (key, value) => {
  if (!process.env.TEST) window.localStorage.setItem(key, JSON.stringify(value));
  return value;
};

const getInitialState = () => Map({
  lang: loadValue('lang', langCodes.hasOwnProperty(window.navigator.language) ? window.navigator.language : 'ru-ru')
  , sound: loadValue('sound', true)
  , uiv3: loadValue('uiv3', true)
  , adminMode: process.env.NODE_ENV !== 'production'
  , ignoreList: Set(loadValue('ignoreList', []))
  , forms: Map()
});

export const reducer = createReducer(getInitialState(), {
  appChangeLanguage: (state, data) => state.set('lang', saveValue('lang', data))
  , appChangeSound: (state, data) => state.set('sound', saveValue('sound', data))
  , setAdminMode: (state, data) => state.set('adminMode', !state.get('adminMode'))
  , socketConnectClient: (state, {connectionId}) => state.set('connectionId', connectionId)
  , appUseUIv3: (state, data) => state.set('uiv3', saveValue('uiv3', data))
  , appIgnoreUser: (state, {userId}) => {
    const ignoreList = state.get('ignoreList').takeLast(99).add(userId);
    saveValue('ignoreList', ignoreList.toJS());
    return state.set('ignoreList', ignoreList);
  }
  , appUnignoreUser: (state, {userId}) => {
    const ignoreList = state.get('ignoreList').remove(userId);
    saveValue('ignoreList', ignoreList.toJS());
    return state.set('ignoreList', ignoreList);
  }
  , appUnignoreAll: (state) => {
    const ignoreList = Set();
    saveValue('ignoreList', ignoreList.toJS());
    return state.set('ignoreList', ignoreList);
  }
  , formValidationError: (state, {formId, errors}) => state.updateIn(['forms', formId], formErrors => (formErrors || Map()).merge(Map(errors)))
  , formValidationClear: (state, {formId}) => state.removeIn(['forms', formId])
});