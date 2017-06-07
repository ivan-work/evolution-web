import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import {connect} from 'react-redux';
import {compose} from 'redux';

import Game from './game/Game.jsx'
import Room from './rooms/Room.jsx'
import {redirectTo} from '~/shared/utils'

export class RouteRoom extends React.Component {
  render() {
    const {user, room, game, $goHome} = this.props;
    if (game) return <Game/>;
    if (room) return <Room/>
    return (<div>Error! <a onClick={$goHome}>go back</a></div>)
  }
}

export const RouteRoomView = connect(
  (state, props) => {
    const game = state.get('game');
    const user = state.get('user');
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    return {user, room, game}
  }
  , (dispatch) => ({
    $goHome: () => dispatch(redirectTo('/'))
  })
)(RouteRoom);

RouteRoomView.getRoutePath = () => '/room';

export default RouteRoomView;