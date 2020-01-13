import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import {connect} from 'react-redux';
import {branch, compose, renderComponent} from 'recompose';

import Game from '../views/game/Game.jsx'
import GameUIv3 from '../views/uiv3/GameUIv3'
import Room from '../views/rooms/Room.jsx'

import get from 'lodash/fp/get';
import Typography from "@material-ui/core/Typography/Typography";
import EvoLink from "../components/EvoLink";

export default compose(
  connect(
    (state, props) => {
      const game = state.get('game');
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      const uiv3 = state.getIn(['app', 'uiv3']);
      return {room, game, uiv3}
    }
  )
  , branch(({game, uiv3}) => uiv3 && game, renderComponent(GameUIv3))
  , branch(get('game'), renderComponent(Game))
  , branch(get('room'), renderComponent(Room))
)(() => (<Typography color={"error"} align={"center"}>
  Error!&nbsp;
  <EvoLink color='inherit' underline='always' to='/'>Back</EvoLink>
  .
</Typography>));