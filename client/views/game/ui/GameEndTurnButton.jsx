import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'
import {connect} from 'react-redux'

import {Button} from 'react-mdl';

import {gameEndTurnRequest} from '../../../../shared/actions/actions';

export const GameEndTurnButton = ({game, $endTurn}) => (<div>
  {game.getPlayer() &&
  <Button id="Game$endTurn" colored={game.getPlayer().acted} accent={!game.getPlayer().acted} raised
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