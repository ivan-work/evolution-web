import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {connect} from 'react-redux';
import {compose} from "recompose";

import {RoomModel, VotingModel} from '../../../shared/models/RoomModel';

import Chat from '../Chat.jsx';
import UsersList from '../utils/UsersList.jsx';

import RoomSettings from './RoomSettings.jsx';
import RoomStartVotingDialog, {RoomStartVotingTimer} from './RoomStartVotingDialog.jsx';

import {
  roomKickRequest,
  roomBanRequest,
  roomUnbanRequest
} from '../../../shared/actions/actions';

import Typography from "@material-ui/core/Typography/Typography";
import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";
import withStyles from "@material-ui/core/styles/withStyles";

import IconUnbanUser from '@material-ui/icons/RemoveCircleOutline';

import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton/IconButton";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import {UserVariants} from "../utils/User";

const styles = theme => ({
  root: {
    margin: theme.spacing.unit
  }
  , container: {}
  , column: {}
  , columnPaper: {
    padding: theme.spacing.unit
    , flex: '1'
  }
});

export class Room extends React.PureComponent {
  renderUser = ({user}) => {
    const {roomKickRequest, roomBanRequest, isHost, userId} = this.props;
    return (
      <UserVariants.listItemWithActions user={user} userId={userId} isHost={isHost} roomKickRequest={roomKickRequest} roomBanRequest={roomBanRequest}/>
    );
  };

  renderBannedUser = ({user}) => {
    const {roomUnbanRequest, isHost, userId} = this.props;
    return (
      <UserAsListItem user={user} actions={
        user.id !== userId && isHost && <ListItemSecondaryAction>
          <Tooltip title={T.translate('App.Room.$Unban')}>
            <IconButton onClick={() => roomUnbanRequest(user.id)}><IconUnbanUser/></IconButton>
          </Tooltip>
        </ListItemSecondaryAction>}
      />);
  };

  render() {
    const {classes, room} = this.props;
    return (
      <div className={classes.root}>
        <RoomStartVotingDialog/>
        <Typography variant='h3'>
          {T.translate('App.Room.Room')}&nbsp;«{room.name}»&nbsp;
          <RoomStartVotingTimer room={room}/>
        </Typography>
        <Grid container className={classes.container} spacing={8}>
          <Grid container item className={classes.column} xs={4}>
            <Paper className={classes.columnPaper}>
              <RoomSettings roomId={room.id}/>
            </Paper>
          </Grid>
          <Grid container item className={classes.column} xs={4}>
            <Paper className={classes.columnPaper}>
              <Chat chatTargetType='ROOM' roomId={room.id}/>
            </Paper>
          </Grid>
          <Grid container item className={classes.column} xs={4}>
            <Paper className={classes.columnPaper}>
              <Typography variant='h6'>
                {T.translate('App.Room.Players')} ({room.users.size}/{room.settings.maxPlayers}):
              </Typography>
              <UsersList list={room.users}>{this.renderUser}</UsersList>
              <Typography variant='h6'>{T.translate('App.Room.Spectators')}:</Typography>
              <UsersList list={room.spectators}>{this.renderUser}</UsersList>
              {room.banlist.size > 0 && (<div>
                <Typography variant='h6'>{T.translate('App.Room.Banned')}:</Typography>
                <UsersList list={room.banlist}>{this.renderBannedUser}</UsersList>
              </div>)}
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default compose(
  withStyles(styles)
  , connect((state) => {
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      const userId = state.getIn(['user', 'id']);
      return {
        roomId
        , room
        , userId
        , isHost: room.users.get(0) === userId
      }
    }
    , {roomKickRequest, roomBanRequest, roomUnbanRequest})
)(Room);