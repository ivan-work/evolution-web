import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'
import {connect} from 'react-redux'
import Button from "@material-ui/core/Button";

import {gameEndTurnRequest, traitAmbushContinueRequest} from '../../../../shared/actions/actions';
import {branch, compose, withProps} from "recompose";
import {PHASE} from "../../../../shared/models/game/GameModel";

const playerHasAmbushes = (game) => {
  if (game.getIn(['ambush', 'ambushers']) && game.userId) {
    return game.getIn(['ambush', 'ambushers']).some((wants, animalId) => {
      const animal = game.locateAnimal(animalId, game.userId);
      if (animal && wants === null) return true;
    });
  }
};

export const GameEndAmbushButton = ({game, $traitAmbushContinue}) => (<div>
  <Button variant='contained'
          color='secondary'
          size='small'
          disabled={!playerHasAmbushes(game)}
          onClick={$traitAmbushContinue}>
    {T.translate('Game.UI.EndAmbush')}
  </Button>
</div>);

export default compose(connect(null, {$traitAmbushContinue: traitAmbushContinueRequest}))(GameEndAmbushButton);