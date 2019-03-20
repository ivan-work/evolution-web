import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'
import {connect} from 'react-redux';
import {compose} from 'redux';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import Button from "@material-ui/core/Button/Button";
import Card from "@material-ui/core/Card/Card";

// shared
import {GameModel, PHASE} from '../../../shared/models/game/GameModel';
import {traitAnswerRequest, roomExitRequest} from '../../../shared/actions/actions';

// DnD
import {DragDropContext} from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import TestBackend from 'react-dnd-test-backend';

const backend = !process.env.TEST ? TouchBackend({enableMouseEvents: true}) : TestBackend;

import CustomDragLayer from './dnd/CustomDragLayer.jsx';

// Style
import './Game.scss'

// Animations
import {AnimationServiceContext} from '../../services/AnimationService';
import {createAnimationServiceConfig} from './animations';

// Components
import {Portal} from '../utils/Portal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import TraitShell from './animals/TraitShell.jsx';

import GameScoreboardFinal from './ui/GameScoreboardFinal.jsx';

import GameTimedOutDialog from './ui/GameTimedOutDialog.jsx'
import TraitIntellectDialog from './ui/TraitIntellectDialog.jsx'
import TraitDefenceDialog from './ui/TraitDefenceDialog.jsx'

import DeckSticker from './ui/DeckSticker.jsx';

import GameSticker from './ui/GameSticker.jsx';

import withStyles from "@material-ui/core/styles/withStyles";

import Chat from '../Chat.jsx';
import PlayerSticker from "./PlayerSticker.jsx";
import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";
import Typography from "@material-ui/core/Typography/Typography";
import PlayersList from "./ui/PlayersList";

const SHADOW = 8;

const styles = theme => ({
  root: {
    flex: '1 1 0'
    , flexWrap: 'nowrap'
    , overflowX: 'hidden'
    , overflowY: 'auto'
    , font: '12px Roboto, Arial'
  }
  , padding: {
    padding: theme.spacing.unit
  }
  , stickerRow: {
    flex: '1 1 0'
    , flexWrap: 'nowrap'
    , minHeight: 200
  }
  , stickerRowFirst: {
    flex: '0 1 auto'
    , flexWrap: 'nowrap'
    // , minHeight: 100
  }
  , sticker: {
    flex: '1 1 0'
    , minWidth: 0 // Hack for flex-basis: 0 to work
    , margin: 1
  }
});

export class Game extends React.Component {
  render() {
    const {classes, game, $traitAnswer} = this.props;

    const playerIndex = game.getPlayer() && game.getPlayer().index;
    const players = game.sortPlayersFromIndex(game.players, playerIndex);

    return (
      <Grid container direction='column' className={`Game-wrapper Game ${classes.root}`}>
        <GameTimedOutDialog game={game}/>
        <TraitIntellectDialog game={game} $traitAnswer={$traitAnswer}/>
        <TraitDefenceDialog game={game} $traitAnswer={$traitAnswer}/>
        <Portal target='header'>
          <ControlGroup name={T.translate('Game.Game')}>
            <GameScoreboardFinal game={game}/>
          </ControlGroup>
        </Portal>

        <Grid item container className={`${classes.stickerRowFirst}`} wrap='nowrap'>
          <Paper className={`PlayersStickerCard Short ${classes.sticker} ${classes.padding}`}>
            <PlayersList game={game}/>
          </Paper>

          <Paper className={`DeckStickerCard Short ${classes.sticker} ${classes.padding}`}>
            <DeckSticker game={game}/>
          </Paper>
          <Paper className={`GameStickerCard Short ${classes.sticker} ${classes.padding}`}>
            <GameSticker game={game}/>
          </Paper>

          <Paper className={`FoodCard ${classes.sticker} ${classes.padding}`}>
            <Typography variant='h6'>{T.translate('Game.UI.FoodBase')}{game.status.phase === PHASE.FEEDING && <span> ({game.food})</span>}:</Typography>
            <div className='GameShellContainer'>
              {game.continents.get('standard').shells.map((shell) =>
                <TraitShell key={shell.id} game={game} trait={shell}/>).toList()}
            </div>
            <GameFoodContainer game={game} food={game.food}/>
          </Paper>

          <Paper shadow={SHADOW} className={`ChatCard ${classes.sticker}`}>
            <Chat chatTargetType='ROOM' roomId={game.roomId}/>
          </Paper>
        </Grid>

        <Grid item container className={`${classes.stickerRow}`}>
          {this.renderPlayer(players.get(0))}
          {(players.size > 3) && this.renderPlayer(players.get(1))}
          {(players.size > 5) && this.renderPlayer(players.get(2))}
          {(players.size > 7) && this.renderPlayer(players.get(3))}
        </Grid>

        <Grid item container className={`${classes.stickerRow}`}>
          {(players.size > 7) && this.renderPlayer(players.get(7))}
          {(players.size > 6) && this.renderPlayer(players.get(6))}
          {(players.size > 5) && this.renderPlayer(players.get(5))}
          {(players.size > 4) && this.renderPlayer(players.get(4))}
          {(players.size > 3 && players.size < 8) && this.renderPlayer(players.get(3))}
          {(players.size > 2 && players.size < 6) && this.renderPlayer(players.get(2))}
          {(players.size > 1 && players.size < 4) && this.renderPlayer(players.get(1))}
        </Grid>

        <CustomDragLayer/>
      </Grid>
    );
  }

  renderPlayer(player) {
    const {classes, game} = this.props;
    if (!player) return null;
    return (
      <Grid item className={`PlayerStickerCard ${classes.sticker}`}>
        <PlayerSticker key={player.id} game={game} player={player}/>
      </Grid>);
  }
}

export const GameView = compose(
  withStyles(styles)
  , DragDropContext(backend)
  , connect((state, props) => {
      const game = state.get('game');
      const user = state.get('user');
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      const lastAction = state.get('animation');
      return {game, user, roomId, room, lastAction}
    }
    , (dispatch) => ({
      $traitAnswer: (...args) => dispatch(traitAnswerRequest(...args))
      , $exit: () => dispatch(roomExitRequest())
    })
  )
  , AnimationServiceContext(createAnimationServiceConfig())
)(Game);

export default GameView;