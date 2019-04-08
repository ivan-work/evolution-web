import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';

import {compose} from "recompose";
import {connect} from 'react-redux';

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

import {Timer} from '../../utils/Timer.jsx';
import Pause from "../../game/ui/Pause";
import GameLog from "../../game/ui/GameLog";
import GameEndTurnButton from './GameEndTurnButton.jsx';

import {PHASE} from '../../../../shared/models/game/GameModel';
import IconArrowUp from "@material-ui/icons/KeyboardArrowUp";
import IconArrowDown from "@material-ui/icons/KeyboardArrowDown";
import Button from "@material-ui/core/Button/Button";

const styles = theme => ({
  GameToolbarContainer: {
    background: '#fefffe'
    , padding: 2
  }
  , GameToolbar: {
    display: 'flex'
    , justifyContent: 'space-evenly'
    , flexFlow: 'row wrap'
    , maxWidth: 1024
    , margin: `0 auto`
  }
  , statement: {
    marginLeft: '1em'
  }
  , key: {
    fontWeight: 500
    , verticalAlign: 'middle'
    , '&:after': {
      display: 'block',
      width: 5, height: 10, background: 'red',
      content: '|'
    }
  }
  , value: {
    verticalAlign: 'middle'
  }
});

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

export const GameToolbar = ({classes, game, compressControls}) => {
  return (
    <Paper elevation={1} className={classes.GameToolbarContainer}>
      <div className={classes.GameToolbar}>
        <Typography className={classes.statement}>
          <span className={classes.key}>{T.translate('Game.UI.Status.Turn')}:&nbsp;</span>
          <span className={classes.value}>{game.status.turn}</span>
        </Typography>
        <Typography className={classes.statement}>
          <span className={classes.key}>{T.translate('Game.UI.Status.Round')}:&nbsp;</span>
          <span className={classes.value}>{game.status.round}</span>
        </Typography>
        <div className={classes.statement}>
          <GameEndTurnButton game={game}/>
        </div>
        <Typography className={classes.statement}>
          <span className={classes.key}>{T.translate('Game.UI.Status.Time')}:&nbsp;</span>
          <span className={classes.value}>{renderTime(game)}</span>
        </Typography>
        <Typography className={classes.statement}>
          <span className={classes.value}>{T.translate('Game.Phase.' + game.status.phase)}</span>
        </Typography>
        <Typography className={classes.statement}>
          <span className={classes.key}>{T.translate('Game.UI.Deck')}:&nbsp;</span>
          <span className={classes.value}>{game.deck.size}</span>
        </Typography>
        <div className={classes.statement}>
          <GameLog game={game}/>
          <Pause/>
          <ToggleCompress {...compressControls}/>
        </div>
      </div>
    </Paper>
  );
};

export default compose(
  withStyles(styles)
  , connect((state, {game}) => {
    const userId = state.getIn(['user', 'id']);
    const roomId = state.get('room');
    const isHost = state.getIn(['rooms', roomId, 'users', 0]) === userId;
    return {isHost}
  })
)(GameToolbar)