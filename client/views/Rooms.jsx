import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import * as MDL from 'react-mdl';
import {UsersList} from './UsersList.jsx';
import {RoomsList} from './RoomsList.jsx';
import {Portal} from './utils/Portal.jsx';
import {RoomCreateDialog} from './room/RoomCreateDialog.jsx';
import {RoomControlGroupView} from './Room.jsx';

import {redirectTo} from '../../shared/utils';
import {roomCreateRequest, roomJoinRequest} from '../../shared/actions/actions';

export class Rooms extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.onRoomClick = this.onRoomClick.bind(this);
  }

  onRoomClick(roomId) {
    if (this.props.room === roomId) {
      this.props.$redirectTo(roomId);
    } else {
      this.props.$joinRequest(roomId);
    }
  }

  render() {
    //console.log('RENDERING Rooms', this.props.actions.roomJoinRequest)
    return <div className="loginForm">
      <Portal target='header'>
        <div className='control-group'>
          <div className='control-group__title'>Rooms</div>
          <div className='control-group__body'>
            <RoomCreateDialog onCreateRoom={this.props.$createRequest}/>
          </div>
        </div>
        {!this.props.room ? null : <RoomControlGroupView/>}
      </Portal>
      <div>Hello {this.props.username}</div>
      <div>Online: <UsersList list={this.props.online}/></div>
      <div>Rooms: <RoomsList rooms={this.props.roomsList} onRoomClick={this.onRoomClick}/></div>
    </div>;
  }
}

export const RoomsView = connect(
  (state) => {
    //console.log(state.toJS());
    return {
      username: state.getIn(['user', 'login'], '%USERNAME%')
      , online: state.getIn(['online'], [])
      , room: state.get('room')
      , roomsList: state.getIn(['rooms'], Map()).filter(room => !room.gameId)
    }
  }
  , (dispatch) => ({
    $createRequest: (data) => dispatch(roomCreateRequest(data))
    , $joinRequest: (roomId) => dispatch(roomJoinRequest(roomId))
    , $redirectTo: (roomId) => dispatch(redirectTo(`/room/${roomId}`))
  })
)(Rooms);
