import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react'
import {connect} from 'react-redux'

import Button from "@material-ui/core/Button";

import {gameEndTurnRequest, traitAmbushContinueRequest} from '../../../../shared/actions/actions';
import {compose, withProps} from "recompose";
import {PHASE} from "../../../../shared/models/game/GameModel";

const playerHasAmbushes = (game) => {
  if (game.getIn(['ambush', 'ambushers']) && game.userId) {
    return game.getIn(['ambush', 'ambushers']).some((wants, animalId) => {
      const animal = game.locateAnimal(animalId, game.userId);
      if (animal && wants === null) return true;
    });
  }
};

export const GameEndTurnButton = ({render = true, color, disabled, onClick, text}) => (!render ? null
    : <Button color={color}
              variant='contained'
              disabled={disabled}
              onClick={onClick}>{text}
    </Button>
);

export default compose(
  connect(null
    , {
      $endTurn: gameEndTurnRequest
      , $traitAmbushContinue: traitAmbushContinueRequest
    }
  )
  , withProps(({game, $endTurn, $traitAmbushContinue}) => {
    const isAmbush = game.status.phase === PHASE.AMBUSH;
    const isObserver = !game.getPlayer();
    if (isObserver) {
      return {render: false};
    } else if (isAmbush) {
      return {
        color: 'secondary'
        , disabled: playerHasAmbushes(game)
        , onClick: $traitAmbushContinue
        , text: T.translate('Game.UI.EndAmbush')
      }
    }
    const isActed = game.getPlayer().acted;
    return {
      color: isActed ? 'secondary' : 'primary'
      , disabled: !game.isPlayerTurn()
      , onClick: $endTurn
      , text: T.translate(isActed ? 'Game.UI.EndTurn' : 'Game.UI.EndPhase')
    }
  })
)(GameEndTurnButton);