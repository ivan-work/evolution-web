import React, {Component} from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {IconButton, Card, CardTitle, CardText, Tooltip} from 'react-mdl';

import {RoomModel} from '../../../shared/models/RoomModel';

import Chat from './../Chat.jsx';
import UsersList from './../UsersList.jsx';
import {Portal} from './../utils/Portal.jsx';
import RoomControlGroup from './RoomControlGroup.jsx';
import RoomSettings from './RoomSettings.jsx';

import {redirectTo} from '~/shared/utils'
import {roomEditSettingsRequest} from '../../../shared/actions/actions';

export class Room extends Component {
  static propTypes = {
    room: React.PropTypes.instanceOf(RoomModel)
    , userId: React.PropTypes.string.isRequired
    , $roomEditSettings: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    const {room, userId} = this.props;
    const isHost = room && room.users.get(0) === userId;
    this.renderUser = (user => <li key={user.id}>
      {user.login}
      {isHost && <Tooltip label={T.translate('App.Room.$Kick')}>
        <IconButton name='clear'/>
      </Tooltip>}
      {isHost && <Tooltip label={T.translate('App.Room.$Ban')}>
        <IconButton name='block'/>
      </Tooltip>}
    </li>)
    this.renderBannedUser = (user => <li key={user.id}>
      {user.login}
      {isHost && <Tooltip label={T.translate('App.Room.$Unban')}>
        <IconButton name='remove_circle_outline' raised/>
      </Tooltip>}
    </li>)
  }

  render() {
    const {room, roomId, userId} = this.props;

    if (!room) return <div>Error! <a onClick={this.props.$goHome}>go back</a></div>;

    return (<div className='Room'>
      <Portal target='header'>
        <RoomControlGroup inRoom={true}/>
      </Portal>
      <h1>{T.translate('App.Room.Room')} «{room.name}»</h1>
      <div className='flex-row'>
        <Card className='RoomSettings'>
          <CardText>
            <RoomSettings {...this.props}/>
          </CardText>
        </Card>
        <Card>
          <CardTitle>{T.translate('App.Chat.Label')} </CardTitle>
          <CardText>
            <Chat chatTargetType='ROOM' roomId={room.id}/>
          </CardText>
        </Card>
        <Card>
          <CardText>
            <h3>{T.translate('App.Room.Players')} ({room.users.size}/{room.settings.maxPlayers}):</h3>
            <UsersList list={room.users}>{this.renderUser}</UsersList>
            <h3>{T.translate('App.Room.Spectators')}:</h3>
            <UsersList list={room.spectators}>{this.renderUser}</UsersList>
            {room.banlist.size > 0 && (<div>
              <h3>{T.translate('App.Room.Banned')}:</h3>
              <UsersList list={room.spectators}>{this.renderBannedUser}</UsersList>
            </div>)}
          </CardText>
        </Card>
      </div>
    </div>);
  }
}

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
  })
)(Room);

export default RoomView;