import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import T from 'i18n-react';

import {compose} from "recompose";
import {connect} from 'react-redux';

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

import {Timer} from '../../utils/Timer.jsx';
import Pause from "./Pause";
import GameLog from "./GameLog";
import GameEndTurnButton from './GameEndTurnButton.jsx';

import {PHASE} from '../../../../shared/models/game/GameModel';
import IconArrowUp from "@material-ui/icons/KeyboardArrowUp";
import IconArrowDown from "@material-ui/icons/KeyboardArrowDown";
import Button from "@material-ui/core/Button/Button";
import {SpectatorsStatement} from "./SpectatorsList";

import './GameInfoToolbar.scss';

/*@formatter:off*/
const renderTime = (game) => (
    (game.status.paused ? <span>{T.translate('Game.UI.Status.Pause')}</span>
   : game.question ? <Timer start={game.question.time} duration={game.settings.timeTraitResponse}/>
   : game.status.phase === PHASE.REGENERATION ? <Timer start={game.status.turnStartTime} duration={game.settings.timeTraitResponse}/>
   : game.status.phase === PHASE.AMBUSH ? <Timer start={game.status.turnStartTime} duration={game.settings.timeAmbush}/>
   : game.status.turnStartTime != null ? <Timer start={game.status.turnStartTime} duration={game.status.turnDuration}/>
   : '-')
);
/*@formatter:on*/

const ToggleCompress = ({compress, toggleCompress}) => (
  <Button size='small'
          onClick={toggleCompress}>
    {compress ? <IconArrowUp/> : <IconArrowDown/>}
  </Button>
);

export const GameToolbar = ({game, compressControls}) => {
  return (
    <div className={cn('GameToolbar', {compress: compressControls.compress})}>
      <div className='row'>
        <Typography className='statement'>
          <span className='key'>{T.translate('Game.UI.Status.Turn')}:&nbsp;</span>
          <span className='value'>{game.status.turn}</span>
        </Typography>
        <Typography className='statement'>
          <span className='key'>{T.translate('Game.UI.Status.Round')}:&nbsp;</span>
          <span className='value'>{game.status.round}</span>
        </Typography>
      </div>
      <div className='row'>
        <Typography className={cn('statement', {mark: game.deck.size === 0})}>
          <span className='key'>{T.translate('Game.UI.Deck')}:&nbsp;</span>
          <span className='value'>{game.deck.size}</span>
        </Typography>
        <SpectatorsStatement/>
      </div>
      <div className='row'>
        <Typography className='statement'>
          <span className='key'>{T.translate('Game.UI.Status.Time')}:&nbsp;</span>
          <span className='value'>{renderTime(game)}</span>
        </Typography>
        <Typography className='statement'>
          <span className='value'>{T.translate('Game.Phase.' + game.status.phase)}</span>
        </Typography>
      </div>
      <div className='row'>
        <div className='statement'>
          <GameEndTurnButton game={game}/>
        </div>
      </div>
      <div className='row'>
        <div className='row'>
          {/*<GameEndTurnButton game={game}/>*/}
          <GameLog game={game}/>
          <Pause/>
          <ToggleCompress {...compressControls}/>
        </div>
      </div>
      {compressControls.compress && (
        <Fragment>
          <Typography className='statement'>
            <span className='value'>{T.translate('Game.Phase.' + game.status.phase)}</span>
          </Typography>
          <Typography className='statement'>
            <span className='value'>({game.deck.size})</span>
          </Typography>
          <div className='statement'>
            <GameEndTurnButton game={game}/>
          </div>
          <Typography className='statement'>
            <span className='value'>{renderTime(game)}</span>
            <ToggleCompress {...compressControls}/>
          </Typography>
        </Fragment>
      )}
    </div>
  );
};

export default connect((state, {game}) => {
  const userId = state.getIn(['user', 'id']);
  const roomId = state.get('room');
  const isHost = state.getIn(['rooms', roomId, 'users', 0]) === userId;
  return {isHost}
})(GameToolbar)