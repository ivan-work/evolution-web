import T from 'i18n-react';

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
    });
};