import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Dialog} from '../utils/Dialog.jsx';
import {DialogTitle, DialogContent, Button, Icon, ListItem} from 'react-mdl';

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
  static propTypes = {};

  constructor(props) {
    super(props);
    this.$vote = props.$vote;
  }

  render() {
    const {room, userId} = this.props;

    const show = room.votingForStart && room.votingForStart.showOnClient
      && shouldShow(room, userId);

    return (
      <div>
        <Dialog show={show}>
          <DialogTitle>
            {T.translate('App.Room.StartVoting_Title')}&nbsp;
            {room.votingForStart &&
            <Timer start={room.votingForStart.timestamp} duration={VotingModel.START_VOTING_TIMEOUT}/>}
          </DialogTitle>
          {show && room.votingForStart && this.renderDialogContent()}
        </Dialog>
      </div>);
  }

  renderDialogContent() {
    const {room, userId} = this.props;
    return (<DialogContent>
      <UsersList list={room.users}>
        {(user) => (<ListItem className='small'>
          <div>{this.renderVoteState(user.id)} {user.login}</div>
        </ListItem>)}
      </UsersList>
      <div style={{display: 'flex', justifyContent: 'space-around'}}>
        <Button raised primary disabled={!isUserInPlayers(room, userId)}
                onClick={this.$vote(true)}>{T.translate('App.Misc.Agree')}</Button>
        <Button raised primary disabled={!isUserInPlayers(room, userId)}
                onClick={this.$vote(false)}>{T.translate('App.Misc.Disagree')}</Button>
      </div>
    </DialogContent>);
  }

  renderVoteState(userId) {
    const {room} = this.props;

    if (!room.votingForStart) return null;

    const state = room.votingForStart.votes.get(userId);
    const props = {style: {}};

    if (state === true) {
      props.name = 'check';
      props.style.color = 'green'
    } else if (state === false) {
      props.name = 'close';
      props.style.color = 'red';
    } else {
      props.name = 'snooze';
    }
    return <Icon {...props}/>
  }
}

export const RoomStartVotingDialogView = connect(
  (state, props) => ({
    room: state.getIn(['rooms', state.get('room')])
    , userId: state.getIn(['user', 'id'])
  })
  , (dispatch, props) => ({
    $vote: (vote) => () => dispatch(roomStartVoteActionRequest(vote))
  })
)(RoomStartVotingDialog);

export class RoomStartVotingTimer extends React.Component {
  render() {
    const {room} = this.props;
    const show = passesChecks(() => checkStartVotingIsInProgress(room, TimeService.getServerTimestamp()));
    if (!show) return null;
    return (<span>
      {T.translate('App.Room.StartVoting_InProgress')}&nbsp;
      <Timer start={room.votingForStart.timestamp} duration={VotingModel.START_VOTING_TIMEOUT}/>
      </span>);
  }
}

export default RoomStartVotingDialogView;