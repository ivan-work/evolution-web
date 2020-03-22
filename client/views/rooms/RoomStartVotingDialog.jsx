import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import IconVotePending from '@material-ui/icons/Snooze';
import IconVoteYes from '@material-ui/icons/Check';
import IconVoteNo from '@material-ui/icons/Close';

import RoomDescription from './RoomDescription';
import TimeService from '../../services/TimeService';
import {Timer} from '../utils/Timer.jsx';
import UsersList from '../utils/UsersList.jsx';

import {VotingModel} from '../../../shared/models/RoomModel.js';
import {roomStartVoteActionRequest} from '../../../shared/actions/actions';
import {passesChecks} from '../../../shared/actions/checks';
import {isUserInPlayers, checkStartVotingIsInProgress} from '../../../shared/actions/rooms.checks';

const shouldShow = (room, userId) => (isUserInPlayers(room, userId)
  && passesChecks(() => checkStartVotingIsInProgress(room, TimeService.getServerTimestamp())));

export class RoomStartVotingDialog extends React.Component {
  render() {
    const {room, userId} = this.props;

    const open = !!(room.votingForStart && room.votingForStart.showOnClient && shouldShow(room, userId));

    return (
      <Dialog open={open}>
        <DialogTitle>
          {T.translate('App.Room.StartVoting_Title')}&nbsp;
          {room.votingForStart &&
          <Timer start={room.votingForStart.timestamp} duration={VotingModel.START_VOTING_TIMEOUT} />}
        </DialogTitle>
        {open && room.votingForStart && this.renderDialogContent()}
      </Dialog>
    );
  }

  renderDialogContent() {
    const {room, userId, $voteYes, $voteNo} = this.props;
    return (
      <DialogContent>
        <RoomDescription room={room}/>
        <UsersList list={room.users}>{this.renderUserVote}</UsersList>
        <DialogActions>
          <Button variant={"contained"} color={"primary"} disabled={!isUserInPlayers(room, userId)}
                  onClick={$voteYes}>{T.translate('App.Misc.Agree')}</Button>
          <Button variant={"contained"} color={"primary"} disabled={!isUserInPlayers(room, userId)}
                  onClick={$voteNo}>{T.translate('App.Misc.Disagree')}</Button>
        </DialogActions>
      </DialogContent>
    );
  }

  renderUserVote = ({user}) => {
    const {room} = this.props;

    // if (!room.votingForStart) return null;

    const vote = room.votingForStart.votes.get(user.id);
    let Icon = IconVotePending;

    if (vote === true) {
      Icon = IconVoteYes;
      // props.style.color = 'green'
    } else if (vote === false) {
      Icon = IconVoteNo;
      // props.style.color = 'red';
    }

    return (
      <ListItem>
        <ListItemText primary={user.login} />
        <ListItemSecondaryAction><Icon /></ListItemSecondaryAction>
      </ListItem>
    );
  }
}

export const RoomStartVotingDialogView = connect(
  (state, props) => ({
    room: state.getIn(['rooms', state.get('room')])
    , userId: state.getIn(['user', 'id'])
  })
  , (dispatch, props) => ({
    $voteYes: () => dispatch(roomStartVoteActionRequest(true))
    , $voteNo: () => dispatch(roomStartVoteActionRequest(false))
  })
)(RoomStartVotingDialog);

export class RoomStartVotingTimer extends React.Component {
  render() {
    const {room} = this.props;
    const show = passesChecks(() => checkStartVotingIsInProgress(room, TimeService.getServerTimestamp()));
    if (!show) return null;
    return (<span>
      {T.translate('App.Room.StartVoting_InProgress')}&nbsp;
      <Timer start={room.votingForStart.timestamp} duration={VotingModel.START_VOTING_TIMEOUT} />
    </span>);
  }
}

export default RoomStartVotingDialogView;