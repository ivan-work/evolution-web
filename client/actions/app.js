import T from 'i18n-react';
import deepForceUpdate from 'react-deep-force-update';

import RootService from '../services/RootService';

export const appChangeLanguage = (langCode) => (dispatch) => {
  //console.log('fetching', langCode);
  window.fetch(`/api/i18n/${langCode}`)
    .then(r => r.json())
    .then(r => {
      T.setTexts(r);
      dispatch({
        type: 'appChangeLanguage'
        , data: langCode
      });
      console.log('texts SET', !!RootService.root);
      RootService.rootPromise.then((root) => deepForceUpdate(root));
    });
};

export const appChangeSound = (value) => ({
  type: 'appChangeSound'
  , data: value
});

export const appUseUIv3 = (value) => ({
  type: 'appUseUIv3'
  , data: value
});

export const appIgnoreUser = (userId) => ({
  type: 'appIgnoreUser'
  , data: {userId}
});

export const appUnignoreUser = (userId) => ({
  type: 'appUnignoreUser'
  , data: {userId}
});

const SHOULD_PLAY_AUDIO = GLOBAL_BROWSER && process.env.NODE_ENV !== 'test' && window && window.Audio;

const AUDIO_FILES = {};

const loadAudioFiles = () => {
  AUDIO_FILES.NOTIFICATION = new window.Audio(require('../assets/sound/notification-02.mp3'));
  AUDIO_FILES.START_D2 = new window.Audio(require('../assets/sound/dota-ready.mp3'));
};
if (SHOULD_PLAY_AUDIO) loadAudioFiles();

export const appPlaySound = (soundName) => (dispatch, getState) => {
  const sound = getState().getIn(['app', 'sound']);
  if (sound && SHOULD_PLAY_AUDIO) {
    if (!!AUDIO_FILES[soundName]) {
      AUDIO_FILES[soundName].play();
    } else {
      console.warn('No audio file: ' + soundName);
    }
  }
};