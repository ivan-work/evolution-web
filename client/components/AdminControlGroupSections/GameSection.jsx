import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, List, fromJS} from 'immutable';
import Button from "@material-ui/core/Button";
import {debugMirrorPlayer} from '../../actions/debug';

export const GameSection = ({debugMirrorPlayer}) => (
  <div>
    <Button onClick={debugMirrorPlayer}>Mirror player</Button>
  </div>
);

export default connect(
  (state) => {
    const userId = state.getIn(['user', 'id'], '%USERNAME%');
    const roomId = state.get('room');
    const game = state.getIn(['rooms', roomId]);
    return {
      roomId
      , userId
      , game
    }
  }
  , ({debugMirrorPlayer})
)(GameSection);
