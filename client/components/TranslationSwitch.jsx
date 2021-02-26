import React from 'react'
import {connect} from 'react-redux';
import langCodes from '../../i18n';

import {appChangeLanguage} from '../actions/app';

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";


const TranslationSwitch = ({changeLanguage, currentLanguage}) => (
  <FormControl>
    {/* Not translated because why? :D */}
    <InputLabel id="select-language">Language</InputLabel>
    <Select
      id='select-language'
      value={currentLanguage}
      onChange={({target}) => changeLanguage(target.value)}
    >
      {langCodes.map((code, index) =>
        <MenuItem key={index} value={code}>
          {code}
        </MenuItem>
      )}
    </Select>
  </FormControl>
);

export default connect((state) => ({
  currentLanguage: state.getIn(['app', 'lang'])
}), (dispatch) => ({
  changeLanguage: (code) => dispatch(appChangeLanguage(code))
}))(TranslationSwitch);