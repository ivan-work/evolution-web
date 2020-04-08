import React from 'react';
import T from "i18n-react";
import {connect} from 'react-redux';
import {List} from 'immutable';

import Typography from "@material-ui/core/Typography";
import MUIList from '@material-ui/core/List'

import WhiteTooltip from '../../utils/WhiteTooltip'
import {IgnoreButton, UnignoreButton} from "../../../components/IgnoreUnignoreTooltip";

import User from "../../utils/User";

const withSpectators = connect((state) => {
  const roomId = state.get('room');
  return {
    spectators: state.getIn(['rooms', roomId, 'spectators'], List())
  }
});

export const SpectatorsList = (({spectators}) => (
  <MUIList>
    {spectators.map(userId => (
      <span key={userId}>
        <User id={userId}/>&nbsp;
        <IgnoreButton userId={userId}/>
        <UnignoreButton userId={userId}/>
      </span>
    ))}
  </MUIList>
));

export const SpectatorsStatement = withSpectators(({classes, spectators}) => (
  spectators && spectators.size > 0 && <WhiteTooltip title={<SpectatorsList spectators={spectators}/>} interactive>
    <Typography className={classes.statement}>
      <span className={classes.key}>{T.translate('App.Room.Spectators')}:&nbsp;</span>
      <span className={classes.value}>{spectators.size}</span>
    </Typography>
  </WhiteTooltip>
));