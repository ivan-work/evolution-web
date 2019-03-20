import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'
import {connect} from 'react-redux'
import Button from "@material-ui/core/Button";

import {gameEndTurnRequest} from '../../../../shared/actions/actions';

export const GameEndTurnButton = ({game, $endTurn}) => (<div>
  {game.getPlayer() &&
  <Button id="Game$endTurn"
          color={!game.getPlayer().acted ? 'primary' : 'secondary'}
          variant='contained'
          disabled={!game.isPlayerTurn()}
          onClick={$endTurn}>
    {T.translate(game.getPlayer().acted ? 'Game.UI.EndTurn' : 'Game.UI.EndPhase')}
  </Button>}
</div>);

export const GameEndTurnButtonView = connect(() => ({})
  , (dispatch) => ({
    $endTurn: () => dispatch(gameEndTurnRequest())
  }))(GameEndTurnButton);

export default GameEndTurnButtonView;