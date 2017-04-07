import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {Map} from 'immutable';

import * as MDL from 'react-mdl';
import {UsersList} from './UsersList.jsx';

import {roomExitRequest, gameCreateRequest} from '~/shared/actions/actions';
import {RoomModel} from '~/shared/models/RoomModel';

export const Room = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <div className="Room">
      <MDL.Button id="Room$back" raised onClick={this.props.$back}>back</MDL.Button>
      <MDL.Button id="Room$exit" raised onClick={this.props.$exit}>exit</MDL.Button>
      <MDL.Button id="Room$start" raised onClick={this.props.$start(this.props.room.id)}
                  disabled={!this.props.room.checkCanStart(this.props.user.id)}>start</MDL.Button>
      <div>Room {this.props.room.name}</div>
      <div>Online users: <UsersList list={this.props.online.toList()}/></div>
      <div className="Room-online">In this room: <UsersList list={this.props.room.users.map(userId => this.props.online.get(userId))}/></div>
    </div>;
  }
});

//<MDL.Button raised colored onClick={this.props.actions.roomCreateRequest}>Create room</MDL.Button>

export const RoomView = connect(
  (state) => {
    const roomId = state.get('room');
    return {
      room: state.getIn(['rooms', roomId], new RoomModel())
      , user: state.get('user')
      , online: state.get('online')
    }
  }
  , (dispatch) => ({
    $back: () => dispatch(push(`/`))
    , $exit: () => dispatch(roomExitRequest())
    , $start: roomId => () => dispatch(gameCreateRequest(roomId))
  })
)(Room);