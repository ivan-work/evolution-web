import T from 'i18n-react';
import throttle from 'lodash/throttle';

import RootService from '../services/RootService';
import deepForceUpdate from 'react-deep-force-update';

export const appChangeLanguage = (langCode) => (dispatch, getState) => {
  //console.log('fetching', langCode);
  window.fetch(`/api/i18n/${langCode}`)
    .then(r => r.json())
    .then(r => {
      T.setTexts(r);
      dispatch({
        type: 'appChangeLanguage'
        , data: langCode
      });
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

export const appUnignoreAll = () => ({
  type: 'appUnignoreAll'
  , data: null
});

const SHOULD_PLAY_AUDIO = GLOBAL_BROWSER && process.env.NODE_ENV !== 'test' && window && window.Audio;

const AUDIO_FILES = {};

class AudioFile {
  constructor(name, filename, options = {}) {
    const {throttleTime, volume = 1} = options;
    this.name = name;
    this.file = new window.Audio(filename);
    this.file.volume = volume;
    this._play = () => this.file.play();
    if (!throttleTime) {
      this.play = this._play;
    } else {
      this.play = throttle(this._play, throttleTime, {leading: true, trailing: false});
    }
  }
}

export const AudioFileName = {
  NOTIFICATION: 'NOTIFICATION'
  , ROOM_CREATED: 'ROOM_CREATED'
  , ROOM_JOIN: 'ROOM_JOIN'
  , ROOM_JOIN_FULL: 'ROOM_JOIN_FULL'
  , START_D2: 'START_D2'
  , CLOCK_TICK: 'CLOCK_TICK'
};

const loadAudioFiles = () => {
  AUDIO_FILES.NOTIFICATION = new AudioFile(AudioFileName.NOTIFICATION, require('../assets/sound/notification-02.wav'));
  AUDIO_FILES.ROOM_CREATED = new AudioFile(AudioFileName.ROOM_CREATED, require('../assets/sound/searching-03.wav'), {throttleTime: 30e3});
  AUDIO_FILES.ROOM_JOIN = new AudioFile(AudioFileName.ROOM_JOIN, require('../assets/sound/connected-02.wav'));
  AUDIO_FILES.ROOM_JOIN_FULL = new AudioFile(AudioFileName.ROOM_JOIN_FULL, require('../assets/sound/searching-02.wav'));
  AUDIO_FILES.START_D2 = new AudioFile(AudioFileName.START_D2, require('../assets/sound/dota-ready.mp3'));
  AUDIO_FILES.CLOCK_TICK = new AudioFile(AudioFileName.CLOCK_TICK, require('../assets/sound/metal-tick.wav'), {volume: .4});
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