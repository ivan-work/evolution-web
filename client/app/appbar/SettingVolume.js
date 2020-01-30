import React from "react";
import T from 'i18n-react';
import {connect} from "react-redux";
import {compose, withHandlers} from "recompose";

import Tooltip from "@material-ui/core/Tooltip";
import MenuItem from "@material-ui/core/MenuItem";

import IconButton from "@material-ui/core/IconButton/IconButton";
import IconVolumeOn from '@material-ui/icons/VolumeUp';
import IconVolumeOff from '@material-ui/icons/VolumeOff';

import {appChangeSound} from "../../actions/app";

export const SettingVolumeBody = ({sound, toggleVolume}) =>
  <Tooltip title={`${T.translate('App.Settings.Sound')} ${T.translate(`App.Misc.$${sound ? 'on' : 'off'}`)}`}>
    <IconButton color="inherit" onClick={toggleVolume}>
      {sound ? <IconVolumeOn /> : <IconVolumeOff />}
    </IconButton>
  </Tooltip>;

export const SettingVolumeMenuItemBody = ({sound, toggleVolume}) =>
  <Tooltip title={`${T.translate('App.Settings.Sound')} ${T.translate(`App.Misc.$${sound ? 'on' : 'off'}`)}`}>
    <MenuItem onClick={toggleVolume}>
      {T.translate('App.Settings.Sound')}&nbsp;
      {sound ? <IconVolumeOn /> : <IconVolumeOff />}
    </MenuItem>
  </Tooltip>;

export const withSettingVolume = compose(
  connect((state) => ({
      sound: state.getIn(['app', 'sound'])
    })
    , {appChangeSound}
  )
  , withHandlers({
    toggleVolume: ({sound, appChangeSound}) => e => appChangeSound(!sound)
  })
);

export const SettingVolume = withSettingVolume(SettingVolumeBody);

export const SettingVolumeMenuItem = withSettingVolume(SettingVolumeMenuItemBody);