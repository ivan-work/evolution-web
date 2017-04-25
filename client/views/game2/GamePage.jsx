import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import {connect} from 'react-redux';

import Game from './Game.jsx'

export class GamePage extends React.Component {
  render() {
    const {game} = this.props;
    if (!game) return null;
    return <Game/>
  }
}

export const GamePageView = connect(
  (state, props) => {
    const game = state.get('game');
    const user = state.get('user');
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    return {game, user, roomId, room}
  }
  , (dispatch) => ({})
)(GamePage);

export default GamePageView;