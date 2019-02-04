import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import {connect} from 'react-redux';
import {branch, compose, renderComponent} from 'recompose';

import Game from '../views/game/Game.jsx'
import Room from '../views/rooms/Room.jsx'
import {redirectTo} from '~/shared/utils'

import get from 'lodash/fp/get';
import Typography from "@material-ui/core/Typography/Typography";
import MUILink from "@material-ui/core/Link/Link";
import { Link } from 'react-router-dom'

export default compose(
  connect(
    (state, props) => {
      const game = state.get('game');
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      return {room, game}
    }
  )
  , branch(get('game'), renderComponent(Game))
  , branch(get('room'), renderComponent(Room))
)(() => (<Typography color={"error"} align={"center"}>
  Error!&nbsp;
  <MUILink component={Link} color={"inherit"} underline={'always'} to='/'>Back</MUILink>
  .
</Typography>));