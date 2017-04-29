import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import {connect} from 'react-redux';
import {compose} from 'redux';

import Game from './Game.jsx'
import {GameWrapperView as GameWrapper} from '../game/GameWrapper.jsx'

// Animations
import {AnimationServiceContext} from '../../services/AnimationService';
import {createAnimationServiceConfig} from '../game/animations';

export class GamePage extends React.Component {
  render() {
    const {game, newUI} = this.props;
    if (!game) return null;
    if (newUI) return <Game/>;
    return <GameWrapper/>;
  }
}

export const GamePageView = compose(
  AnimationServiceContext(createAnimationServiceConfig())
  , connect(
    (state, props) => {
      const game = state.get('game');
      const user = state.get('user');
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      const newUI = state.getIn(['app', 'newUI']);
      return {game, user, roomId, room, newUI}
    }
    , (dispatch) => ({})
  ))(GamePage);

export default GamePageView;