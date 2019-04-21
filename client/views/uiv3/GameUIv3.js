import React, {Fragment} from 'react';
import cn from 'classnames';
import {compose, lifecycle, withStateHandlers} from "recompose";
import {connect} from "react-redux";
import repeat from 'lodash/times';

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import withStyles from '@material-ui/core/styles/withStyles';

import Chat, {ChatWindow} from "../Chat";
import PlayerHandWrapper from "./PlayerHandWrapper";
import PlayerHand from "./PlayerHand";
import GameInfoToolbar from "./ui/GameInfoToolbar";
import PlayersList from "./ui/PlayersList";
import PlayerUser from "./ui/PlayerUser";
import Continent from "./continent/Continent";

import {chatMessageRequest} from "../../../shared/actions/chat";
import {debugMirrorPlayer} from "../../actions/debug";
import {InteractiveFood} from "./food/Food";
import {CurrentInteractionDebug, InteractionManagerProvider} from './InteractionManager'

const styles = theme => ({
  GameUIv3Container: {
    flex: '1 1 0'
    , flexWrap: 'nowrap'
    , background: theme.palette.background.accent
  }
  , GameUIv3: {
    flex: '1 1 0'
    , overflowX: 'hidden'
    , overflowY: 'auto'
    , scrollBehavior: 'smooth'
    , flexWrap: 'nowrap'
  }
  , gridGameToolbar: {
    background: theme.palette.background.paper
    , marginTop: 2
    , marginBottom: 2
    // marginTop: theme.spacing.unit
  }
  , gridMiscRow: {
    display: 'flex'
    , flexFlow: 'row wrap'
  }
  , gridMiscItem: {
    flex: '1 1 0'
    , margin: 1
    , minHeight: '4em'
    , maxHeight: 140
    , '&.Compressed': {
      maxHeight: 24
      , minHeight: 24
    }
    , '&.PlayersList': {
      minWidth: 180
      , maxWidth: 320
      , overflowY: 'auto'
    }
    , '&.Food': {
      minWidth: 140
    }
    , '&.Chat': {
      minWidth: 320
    }
  }
  , gridPlayers: {
    flex: '1 1 auto'
    , display: 'flex'
    , flexFlow: 'row wrap'
  }
  , gridHand: {}

  , PlayerWrapper: {
    display: 'flex'
    , flexFlow: 'column nowrap'

    , margin: 2

    , flex: '1 1 auto'
    , maxWidth: '100%'
    // , minHeight: GameStyles.animal.height * 1.2 + 60
    // , maxHeight: GameStyles.animal.height * 2.2 + 60

    , textAlign: 'center'
    , '&.highlight': {
      background: theme.palette.tertiary[50]
    }
  }
  , isPlayerTurn: {
    background: '#dfd'
  }
  , ContinentContainer: {
    display: 'flex'
    , flex: '1 1 auto'
  }
});

export const GameUIv3 = ({classes, game, compress, toggleCompress}) => {
  return (
    <InteractionManagerProvider>
      <Grid container direction='column' className={classes.GameUIv3Container}>
        <Grid item className={classes.gridGameToolbar}>
          <GameInfoToolbar game={game} compressControls={{compress, toggleCompress}}/>
        </Grid>
        <Grid item container direction='column' className={classes.GameUIv3}>
          <CurrentInteractionDebug/>
          <Grid item className={classes.gridMiscRow}>
            {!compress && <Paper className={classes.gridMiscItem + ' PlayersList ' + cn({'Compressed': compress})}>
              <PlayersList game={game}/>
            </Paper>}
            <Paper className={classes.gridMiscItem + ' Food ' + cn({'Compressed': compress})}>
              <FoodWrapper game={game}/>
            </Paper>
            <Paper className={classes.gridMiscItem + ' Chat ' + cn({'Compressed': compress})}>
              {!compress ? <ChatWrapper game={game}/> : <ChatWrapperSmall game={game}/>}
            </Paper>
          </Grid>
          <Grid item className={classes.gridPlayers}>
            {game.sortPlayersFromIndex(game.players).map((player) => (
              <PlayerWrapper key={player.id} playerId={player.id} classes={classes} game={game}/>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </InteractionManagerProvider>
  );
};

export const FoodWrapper = ({game}) => <Fragment>
  {repeat(game.food, i => <InteractiveFood key={i}/>)}
</Fragment>;

export const ChatWrapper = ({game}) => <Chat chatTargetType='ROOM' roomId={game.roomId}/>;

export const ChatWrapperSmall = ({game}) => <ChatWindow chatTargetType='ROOM' roomId={game.roomId} length={1}/>;

export const PlayerWrapper = ({classes, playerId, game}) => {
  const currentPlayerId = game.getPlayer() ? game.getPlayer().id : null;
  return <Paper id={playerId} className={`${classes.PlayerWrapper}`}>
    <PlayerUser game={game} playerId={playerId}/>
    <div className={classes.ContinentContainer}>
      <Continent playerId={playerId}/>
    </div>
    {currentPlayerId === playerId && <Grid item className={classes.gridHand}>
      <PlayerHandWrapper><PlayerHand/></PlayerHandWrapper>
    </Grid>}
  </Paper>
};

export default compose(
  withStyles(styles)
  , connect((state, props) => {
    const game = state.get('game');
    const currentPlayerId = game.getPlayer() ? game.getPlayer().id : null;
    return {game, currentPlayerId}
  })
  , withStateHandlers(({compress: false}), {
    toggleCompress: ({compress}) => () => ({compress: !compress})
  })
  // debug
  , connect(null, {debugMirrorPlayer, chatMessageRequest})
  , lifecycle({
    mirrorPlayer() {
      if (process.env.NODE_ENV !== 'development') return;
      if (this.props.game.players.size === 1) {
        this.props.debugMirrorPlayer({limit: 10});
      }
      // else if (this.props.game.players.size === 2) {
      //   this.props.debugMirrorPlayer({limit: 1});
      // } else if (this.props.game.players.size === 3) {
      //   this.props.debugMirrorPlayer({limit: 2});
      // } else if (this.props.game.players.size === 4) {
      //   this.props.debugMirrorPlayer({limit: 5});
      // } else if (this.props.game.players.size === 5) {
      //   this.props.debugMirrorPlayer({limit: 8});
      // }
    },
    componentDidMount() {
      this.mirrorPlayer();
    }
    , componentDidUpdate() {
      this.mirrorPlayer();
    }
  })
)(GameUIv3);