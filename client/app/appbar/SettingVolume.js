import React from "react";
import {connect} from "react-redux";

import IconButton from "@material-ui/core/IconButton/IconButton";
import IconVolumeOn from '@material-ui/icons/VolumeUp';
import IconVolumeOff from '@material-ui/icons/VolumeOff';

import {appChangeSound} from "../../actions/app";
import {compose, withHandlers} from "recompose";

export const SettingVolume = ({sound, toggleVolume}) => <IconButton color="inherit" onClick={toggleVolume}>
  {sound ? <IconVolumeOn/> : <IconVolumeOff/>}
</IconButton>;

export default compose(
  connect((state) => ({
      sound: state.getIn(['app', 'sound'])
    })
    , {appChangeSound}
  )
  , withHandlers({
    toggleVolume: ({sound, appChangeSound}) => e => {
      appChangeSound(!sound)
    }
  })
)(SettingVolume)