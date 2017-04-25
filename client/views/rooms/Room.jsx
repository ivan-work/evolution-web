import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {connect} from 'react-redux';
import {
  IconButton
  , Card
  , CardText
  , Tooltip
  , List
  , ListItem
  , ListItemAction
  , ListItemContent
} from 'react-mdl';

import {RoomModel, VotingModel} from '../../../shared/models/RoomModel';

import {Portal} from './../utils/Portal.jsx';

import Chat from '../Chat.jsx';
import UsersList from '../utils/UsersList.jsx';

import RoomControlGroup from './RoomControlGroup.jsx';
import RoomSettings from './RoomSettings.jsx';
import RoomStartVotingDialog, {RoomStartVotingTimer} from './RoomStartVotingDialog.jsx';

import {redirectTo} from '~/shared/utils'
import {
  roomEditSettingsRequest,
  roomKickRequest,
  roomBanRequest,
  roomUnbanRequest
} from '../../../shared/actions/actions';

export class Room extends React.Component {
  static propTypes = {
    room: PropTypes.instanceOf(RoomModel)
    , userId: PropTypes.string.isRequired
    , $roomEditSettings: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.renderUser = this.renderUser.bind(this);
    this.renderBannedUser = this.renderBannedUser.bind(this);
  }

  render() {
    const {room, roomId, userId} = this.props;

    return (<div className='Room'>
      <Portal target='header'>
        <RoomControlGroup inRoom={true}/>
      </Portal>
      <h1>{T.translate('App.Room.Room')} «{room.name}» <RoomStartVotingTimer room={room}/></h1>
      <RoomStartVotingDialog/>
      <div className='flex-row'>
        <Card className='RoomSettings'>
          <CardText>
            <RoomSettings {...this.props}/>
          </CardText>
        </Card>
        <Card>
          <CardText>
            <h4>{T.translate('App.Chat.Label')}</h4>
            <Chat chatTargetType='ROOM' roomId={room.id}/>
          </CardText>
        </Card>
        <Card>
          <CardText>
            <h4>{T.translate('App.Room.Players')} ({room.users.size}/{room.settings.maxPlayers}):</h4>
            <UsersList list={room.users}>{this.renderUser}</UsersList>
            <h4>{T.translate('App.Room.Spectators')}:</h4>
            <UsersList list={room.spectators}>{this.renderUser}</UsersList>
            {room.banlist.size > 0 && (<div>
              <h4>{T.translate('App.Room.Banned')}:</h4>
              <UsersList list={room.banlist}>{this.renderBannedUser}</UsersList>
            </div>)}
          </CardText>
        </Card>
      </div>
    </div>);
  }

  renderUser(user) {
    const {room, userId, $Kick, $Ban, $Unban} = this.props;
    const isHost = room.users.get(0) === userId;
    return (<ListItem key={user.id} className='small'>
      <ListItemContent>{user.login}</ListItemContent>
      <ListItemAction>
        {user.id !== userId && isHost && <Tooltip label={T.translate('App.Room.$Kick')}>
          <IconButton name='clear' onClick={() => $Kick(user.id)}/>
        </Tooltip>}
        {user.id !== userId && isHost && <Tooltip label={T.translate('App.Room.$Ban')}>
          <IconButton name='block' onClick={() => $Ban(user.id)}/>
        </Tooltip>}
      </ListItemAction>
    </ListItem>);
  }

  renderBannedUser(user) {
    const {room, userId, $Kick, $Ban, $Unban} = this.props;
    const isHost = room.users.get(0) === userId;
    return (<ListItem key={user.id} className='small'>
      <ListItemContent>{user.login}</ListItemContent>
      <ListItemAction>
        {user.id !== userId && isHost && <Tooltip label={T.translate('App.Room.$Unban')}>
          <IconButton name='remove_circle_outline' onClick={() => $Unban(user.id)}/>
        </Tooltip>}
      </ListItemAction>
    </ListItem>);
  }
}

export const RoomCheck = (props) => (!!props.room
  ? <Room {...props}/>
  : <div>Error! <a onClick={props.$goHome}>go back</a></div>);

export const RoomView = connect(
  (state, props) => {
    const roomId = state.get('room');
    //if (!roomId) throw new Error('Room ID is invalid');
    return {
      roomId
      , room: state.getIn(['rooms', roomId])
      , userId: state.getIn(['user', 'id'])
    }
  }
  , (dispatch) => ({
    $roomEditSettings: (settings) => dispatch(roomEditSettingsRequest(settings))
    , $goHome: () => dispatch(redirectTo('/'))
    , $Kick: (userId) => dispatch(roomKickRequest(userId))
    , $Ban: (userId) => dispatch(roomBanRequest(userId))
    , $Unban: (userId) => dispatch(roomUnbanRequest(userId))
  })
)(RoomCheck);

export default RoomView