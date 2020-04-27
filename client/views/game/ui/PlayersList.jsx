import React from 'react';
import PropTypes from 'prop-types';

import {GameModelClient} from '../../../../shared/models/game/GameModel';
import withStyles from "@material-ui/core/styles/withStyles";
import PlayerUser from "./PlayerUser";

const styles = theme => ({
  PlayersList: {}
});

export const PlayersList = withStyles(styles)(({classes, game}) => (
  <div className={classes.PlayersList}>
    {game.sortPlayersFromIndex(game.players).map(player => <PlayerUser key={player.id} game={game} playerId={player.id}/>)}
  </div>
));

PlayersList.propTypes = {
  game: PropTypes.instanceOf(GameModelClient).isRequired
};

export default PlayersList;