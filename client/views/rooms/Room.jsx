import React, {Component} from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Button, Card, CardTitle, CardText} from 'react-mdl';

import {RoomModel} from '../../../shared/models/RoomModel';

import Chat from './../Chat.jsx';
import {UsersList} from './../UsersList.jsx';
import {Portal} from './../utils/Portal.jsx';
import RoomControlGroup from './RoomControlGroup.jsx';
import RoomSettings from './RoomSettings.jsx';

import {roomEditSettingsRequest} from '../../../shared/actions/actions';

export class Room extends Component {
  static propTypes = {
    room: React.PropTypes.instanceOf(RoomModel)
    , userId: React.PropTypes.string.isRequired
    , $roomEditSettings: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {room, userId} = this.props;

    if (!room) return null;

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
          <CardTitle>{T.translate('App.Room.in_this_room')} ({room.users.size}/{room.settings.maxPlayers}):</CardTitle>
          <CardText>
            <UsersList list={room.users.map(userId => this.props.online.get(userId))}/>
          </CardText>
        </Card>
      </div>
    </div>);
  }
}

export const RoomView = connect(
  (state) => {
    const roomId = state.get('room');
    return {
      room: state.getIn(['rooms', roomId])
      , userId: state.getIn(['user', 'id'])
      , online: state.get('online')
    }
  }
  , (dispatch) => ({
    $roomEditSettings: (settings) => dispatch(roomEditSettingsRequest(settings))
  })
)((props) => !props.room ? null : <Room {...props}/>);

export default RoomView;