import React from "react";
import {connect} from "react-redux";

import IconButton from "@material-ui/core/IconButton/IconButton";
import SettingOn from '@material-ui/icons/RadioButtonChecked';
import SettingOff from '@material-ui/icons/RadioButtonUnchecked';

import {appUseUIv3} from "../../actions/app";
import {compose, withHandlers} from "recompose";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";

export const SettingUIv3 = ({uiv3, toggleSetting, disabled}) => (
  <Tooltip title={uiv3 ? 'UIv3 is ON' : 'UIv3 is OFF'}>
    <span>
      <IconButton color="inherit"
                  disabled={disabled}
                  onClick={toggleSetting}>
        {uiv3 ? <SettingOn/> : <SettingOff/>}
      </IconButton>
    </span>
  </Tooltip>
);

export default compose(
  connect((state) => ({
      uiv3: state.getIn(['app', 'uiv3'])
      // , disabled: !state.getIn(['app', 'adminMode'])
    })
    , {appUseUIv3}
  )
  , withHandlers({
    toggleSetting: ({uiv3, appUseUIv3}) => e => {
      appUseUIv3(!uiv3)
    }
  })
)(SettingUIv3)