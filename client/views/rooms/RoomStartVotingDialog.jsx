import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Dialog} from '../utils/Dialog.jsx';
import {DialogTitle, DialogContent, Button, Icon, ListItem} from 'react-mdl';

import {Timer} from '../utils/Timer.jsx';
import UsersList from '../UsersList.jsx';

import {VotingModel} from '../../../shared/models/RoomModel.js';
import {roomStartVoteActionRequest, roomStartVoteEnd} from '../../../shared/actions/actions';
import {isUserInPlayers} from '../../../shared/actions/rooms.checks';

export class RoomStartVotingDialog extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.$vote = props.$vote;
  }

  render() {
    const {room, show, $voteEnd} = this.props;
    return (
      <div>
        <Dialog show={show}>
          <DialogTitle>
            {T.translate('App.Room.StartVoting')}&nbsp;
            {room.votingForStart &&
            <Timer start={room.votingForStart.timestamp} duration={VotingModel.START_VOTING_TIMEOUT} onEnd={$voteEnd}/>}
          </DialogTitle>
          {show && room.votingForStart && this.renderDialogContent()}
        </Dialog>
      </div>);
  }

  renderDialogContent() {
    const {room, userId} = this.props;
    return (<DialogContent>
      <UsersList list={room.users}>
        {(user) => {
          return <ListItem key={user.id} className='small'>{this.renderVoteState(user.id)} {user.login}</ListItem>
        }}
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
  (state, props) => {
    const roomId = state.get('room');
    //if (!roomId) throw new Error('Room ID is invalid');
    return {
      roomId
      , room: state.getIn(['rooms', roomId])
      , userId: state.getIn(['user', 'id'])
    }
  }
  , (dispatch, props) => ({
    $vote: (vote) => () => dispatch(roomStartVoteActionRequest(vote))
    , $voteEnd: () => dispatch(roomStartVoteEnd())
  })
)(RoomStartVotingDialog);

export default RoomStartVotingDialogView;