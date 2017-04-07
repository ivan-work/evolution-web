import React from 'react'
import {connect} from 'react-redux';
import langCodes from '../../i18n';

import {appChangeLanguage} from '../actions/app';

const createChangeLanguage = (changeLanguage) => ({currentTarget}) => changeLanguage(langCodes[currentTarget.selectedIndex]);

export const TranslationSwitch = ({changeLanguage, currentLanguage}) => (
  <div style={styles.container}>
    <select
      label='country'
      value={currentLanguage}
      onChange={createChangeLanguage(changeLanguage)}
    >{langCodes.map((code, index) =>
    <option key={index}>
      {code}
    </option>)}
    </select>
  </div>
);

const styles = {
  container: {
    position: 'absolute'
    , left: '0px'
    , top: '3em'
    , width: '2em'
    //background: '#333'
    //, color: '#fff'
    //, padding: 16
    //, textAlign: 'right'
    //, verticalAlign: 'middle'
  }
};

export const TranslationSwitchView = connect((state) => ({
  currentLanguage: state.getIn(['app', 'lang'])
}), (dispatch) => ({
  changeLanguage: (code) => dispatch(appChangeLanguage(code))
}))(TranslationSwitch);