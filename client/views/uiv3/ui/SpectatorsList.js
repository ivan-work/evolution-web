import {List} from 'immutable';
import React from 'react';
import {connect} from 'react-redux';

import Badge from '@material-ui/core/Badge'
import MUIList from '@material-ui/core/List'
import WhiteTooltip from '../../utils/WhiteTooltip'

import User from "../../utils/User";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IgnoreUnignoreTooltip, {IgnoreButton, UnignoreButton} from "../../../components/IgnoreUnignoreTooltip";
import T from "i18n-react";
import Typography from "@material-ui/core/Typography";

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