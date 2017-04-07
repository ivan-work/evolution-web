import T from 'i18n-react';

export const appChangeLanguage = (langCode) => (dispatch) => {
  //console.log('fetching', langCode);
  window.fetch(`/i18n/${langCode}.json`)
    .then(r => r.json())
    .then(r => {
      T.setTexts(r);
      dispatch({
        type: 'appChangeLanguage'
        , data: langCode
      });
    });
};