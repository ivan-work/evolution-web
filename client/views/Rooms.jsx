import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import * as MDL from 'react-mdl';
import {UsersList} from './UsersList.jsx';
import {RoomsList} from './RoomsList.jsx';

import {roomCreateRequest, roomJoinRequest} from '~/shared/actions/actions';

export const Rooms = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    //console.log('RENDERING Rooms', this.props.actions.roomJoinRequest)
    return <div className="loginForm">
      <div>Hello {this.props.username}</div>
      <div>Online: <UsersList list={this.props.online}/></div>
      <div>Rooms: <RoomsList map={this.props.rooms} onItemClick={this.props.actions.roomJoinRequest}/></div>
      <MDL.Button raised colored id="Rooms$create" onClick={this.props.actions.roomCreateRequest}>Create room</MDL.Button>
    </div>;
  }
});

export const RoomsView = connect(
  (state) => {
    //console.log(state.toJS());
    return {
      username: state.get('user').login
      , online: state.getIn(['online'], [])
      , rooms: state.getIn(['rooms'], Map()).toJS()
    }
  }
  , (dispatch) => ({
    actions: {
      roomCreateRequest: () => dispatch(roomCreateRequest())
      , roomJoinRequest: function (e) {
        e.preventDefault();
        dispatch(roomJoinRequest(e.target.getAttribute('data-id')))
      }
    }
  })
)(Rooms);
