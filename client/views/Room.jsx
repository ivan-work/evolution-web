import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import * as MDL from 'react-mdl';
import {UsersList} from './UsersList.jsx';

//import {roomCreateRequest} from '~/shared/actions/actions';

export const Room = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <div className="Room">
      <div>Room {this.props.room.name}</div>
      <div>Online users: <UsersList list={this.props.online}/></div>
      <div>In this room: <UsersList list={this.props.room.users}/></div>
    </div>;
  }
});

//<MDL.Button raised colored onClick={this.props.actions.roomCreateRequest}>Create room</MDL.Button>

export const RoomView = connect(
  (state) => {
    const roomId = state.get('room');
    console.log('STATE', roomId, state.getIn(['rooms', roomId]))
    return {
      room: state.getIn(['rooms', roomId])
      , online: state.get('online')
    }
  }
  //, (dispatch) => ({
  //  actions: {
  //    roomCreateRequest: function () {
  //      console.log('this', this);
  //      dispatch(roomCreateRequest())
  //    }
  //  }
  //})
)(Room);