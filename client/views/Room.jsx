import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import * as MDL from 'react-mdl';
import {UsersList} from './UsersList.jsx';
import {Portal} from './utils/Portal.jsx';
import {ControlGroup} from './utils/ControlGroup.jsx';

import {redirectTo} from '../../shared/utils';
import {roomExitRequest, gameCreateRequest} from '../../shared/actions/actions';
import {RoomModel} from '../../shared/models/RoomModel';

export class Room extends Component {
  static propTypes = {
    room: React.PropTypes.instanceOf(RoomModel)
    , userId: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {room} = this.props;

    if (!room) return null;

    return <div className="Room">
      <Portal target='header'>
        <RoomControlGroupView inRoom={true}/>
      </Portal>
      <h1>Room «{room.name}»</h1>
      <div>Online users: <UsersList list={this.props.online.toList()}/></div>
      <div className="Room-online">In this room: <UsersList list={room.users.map(userId => this.props.online.get(userId))}/></div>
    </div>;
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
  })
)(Room);

/*
* RoomControlGroup
* */

export class RoomControlGroup extends Component {
  static propTypes = {
    room: React.PropTypes.instanceOf(RoomModel)
    , userId: React.PropTypes.string.isRequired
    , inRoom: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  back() {
    const {room, userId, inRoom} = this.props;
    this.props.$redirectTo(inRoom ? '/' : '/room/' + room.id)
  }

  render() {
    const {room, userId, inRoom} = this.props;

    if (!room) return null;

    return <ControlGroup name='Room'>
      <MDL.Button id="Room$back" onClick={() => this.back()}>back</MDL.Button>
      <MDL.Button id="Room$exit" onClick={this.props.$exit}>exit</MDL.Button>
      <MDL.Button id="Room$start" onClick={this.props.$start(room.id)}
                  disabled={!room.checkCanStart(userId)}>start</MDL.Button>
    </ControlGroup>
  }
}

export const RoomControlGroupView = connect(
  (state) => {
    const roomId = state.get('room');
    return {
      room: state.getIn(['rooms', roomId])
      , userId: state.getIn(['user', 'id'])
    }
  }
  , (dispatch) => ({
    $redirectTo: (location) => dispatch(redirectTo(location))
    , $exit: () => dispatch(roomExitRequest())
    , $start: roomId => () => dispatch(gameCreateRequest(roomId))
  })
)(RoomControlGroup);