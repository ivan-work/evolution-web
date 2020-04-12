import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import {GameModelClient} from '../../../../shared/models/game/GameModel';

import IconPause from '@material-ui/icons/Pause'

import User from '../../utils/User.jsx';

import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import GameStyles from "../GameStyles";

const styles = theme => ({
  Player: {
    ...GameStyles.ellipsis
  }
  , isPlayerTurn: {
    background: '#dfd'
    , fontWeight: 500
  }
  , isPlayerEnded: {
    color: '#bbb'
  }
  , Icon: {
    verticalAlign: 'middle'
  }
});

export const PlayerUser = withStyles(styles)(({classes, game, playerId}) => {
  const player = game.getPlayer(playerId);
  const className = cn({
    [classes.Player]: true
    , [classes.isPlayerTurn]: game.isPlayerTurn(playerId)
    , [classes.isPlayerEnded]: player.ended
  });
  return (
    <Typography key={playerId} className={className}>
      <User id={playerId} variant='simple' showAuth />&nbsp;
      ({player.hand.size})
      {player.getWantsPause() && <IconPause className={classes.Icon}/>}
    </Typography>
  )
});

PlayerUser.propTypes = {
  game: PropTypes.instanceOf(GameModelClient).isRequired
  , playerId: PropTypes.string.isRequired
};

export default PlayerUser;