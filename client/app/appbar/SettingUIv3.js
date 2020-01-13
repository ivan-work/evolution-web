import React from "react";
import T from 'i18n-react';
import {connect} from "react-redux";
import {compose, withHandlers} from "recompose";

import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import MenuItem from "@material-ui/core/MenuItem";

import IconButton from "@material-ui/core/IconButton/IconButton";
import SettingOn from '@material-ui/icons/RadioButtonChecked';
import SettingOff from '@material-ui/icons/RadioButtonUnchecked';

import {appUseUIv3} from "../../actions/app";

export const SettingUIv3Body = ({uiv3, toggleSetting, disabled}) => (
  <Tooltip title={`${T.translate('App.Settings.UIv3')} ${T.translate(`App.Misc.${uiv3 ? 'On' : 'Off'}`)}`}>
    <IconButton color="inherit"
                disabled={disabled}
                onClick={toggleSetting}>
      {uiv3 ? <SettingOn /> : <SettingOff />}
    </IconButton>
  </Tooltip>
);

export const SettingUIv3MenuItemBody = ({uiv3, toggleSetting, disabled}) => (
  <Tooltip title={`${T.translate('App.Settings.UIv3')} ${T.translate(`App.Misc.${uiv3 ? 'On' : 'Off'}`)}`}>
    <MenuItem onClick={toggleSetting} disabled={disabled}>
      {T.translate('App.Settings.UIv3')}&nbsp;
      {uiv3 ? <SettingOn /> : <SettingOff />}
    </MenuItem>
  </Tooltip>
);

const withSettingUIv3 = compose(
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
);

export const SettingUIv3 = withSettingUIv3(SettingUIv3Body);

export const SettingUIv3MenuItem = withSettingUIv3(SettingUIv3MenuItemBody);