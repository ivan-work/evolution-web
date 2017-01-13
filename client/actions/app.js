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
      if (RootService.root) deepForceUpdate(RootService.root);
    });
};

export const appChangeSound = (value) => ({
  type: 'appChangeSound'
  , data: value
});