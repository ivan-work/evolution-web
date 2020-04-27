import React from 'react';
import T from "i18n-react";
import cn from 'classnames';
import {compose, lifecycle, withStateHandlers} from "recompose";
import {connect} from "react-redux";
import repeat from 'lodash/times';
import wrap from '../utils/wrap';

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

import {debugMirrorPlayer} from "../../actions/debug";
import {InteractionContext, InteractionManagerProvider} from './InteractionManager'
import {CurrentInteractionDebug, CurrentInteractionHelp} from './ui/InteractionManagerHelp'
import {SVGContextProvider, SVGContextSpy} from "./SVGContext";
import GameSVGOverlay from "./GameSVGOverlay";
import GameTimedOutDialog from "./ui/GameTimedOutDialog";
import QuestionIntellect from "./ui/QuestionIntellect";
import QuestionDefence from "./ui/QuestionDefence";
import GameStyles from "./GameStyles";
import FoodWrapper from "./food/FoodWrapper";
import PlantsContainer from "./plants/PlantsContainer";
import Typography from "@material-ui/core/Typography/Typography";

const styles = theme => ({
  GameUIv3Container: {
    flex: '1 1 0'
    , flexWrap: 'nowrap'
    , background: theme.palette.background.accent
    , paddingTop: 2
  }
  , GameUIv3: {
    flex: '1 1 0'
    , overflowX: 'hidden'
    , overflowY: 'auto'
    , scrollBehavior: 'smooth'
    , flexWrap: 'nowrap'
    , position: 'relative'
  }
  , gridGameToolbar: {
    background: theme.palette.background.paper
    , marginTop: 2
    , marginBottom: 2
  }
  , gridMiscRow: {
    display: 'flex'
    , flexFlow: 'row wrap'
  }
  , gridMiscSubRow: {
    display: 'flex'
    , flex: `1 1 0`
  }
  , gridMiscItem: {
    flex: '1 1 0'
    , margin: 1
    , minHeight: 140
    , maxHeight: 140
    , [theme.breakpoints.down('sm')]: {
      maxHeight: 180
    }
    , '&.PlayersList': {
      overflowY: 'auto'
      , minWidth: 180
      , maxWidth: 340
    }
    , '&.Toolbar': {
      minWidth: 250
      , maxWidth: 360
    }
    , '&.Chat': {
      minWidth: 200
      , flex: '2 1 25%'
    }
    , '&.Food': {
      minWidth: 140
      , maxWidth: 320
    }
    , '&.Compressed': {
      maxHeight: 36
      , minHeight: 36
      , minWidth: 'none'
      , maxWidth: 'none'
      , '&.Toolbar': {
        minWidth: 500
      }
      , '& .Food': {
        maxWidth: 140
        , flex: '0 0 0'
      }
      , '& .Chat': {
        minWidth: 100
        , flex: '1 1 0'
        , [theme.breakpoints.down('sm')]: {
          display: 'none'
        }
      }
    }
  }
  , gridPlayers: {
    flex: '1 1 auto'
    , display: 'flex'
    , flexFlow: 'row wrap'
  }
  , gridHand: {}

  , GridWrapper: {
    display: 'flex'
    , flexFlow: 'column nowrap'

    , margin: 2

    , flex: '1 1 0'
    , minWidth: GameStyles.defaultWidth * 4

    , textAlign: 'center'
  }
  , PlayerWrapper: {
    '&.isUserTurn': {
      background: '#F3FFFA'
    }
  }
  , ContinentContainer: {
    display: 'flex'
    , flex: '1 1 auto'
  }
});

export class SVGContextInteractionSpy extends React.PureComponent {
  static contextType = InteractionContext;

  render() {
    return <SVGContextSpy name='SVGContextInteractionSpy' watch={this.context.interaction} />
  }
}

export const GameUIv3 = ({classes, game, compress, toggleCompress}) => {
  return (
    <Grid container direction='column' className={classes.GameUIv3Container}>
      <CurrentInteractionHelp/>
      {/*<CurrentInteractionDebug/>*/}
      <Grid item container direction='column' className={classes.GameUIv3}>

        <GameSVGOverlay />
        <SVGContextInteractionSpy />
        <GameTimedOutDialog />
        <QuestionIntellect />
        <QuestionDefence />

        <Grid item className={cn(classes.gridMiscRow, {'Compressed': compress})}>
          {!compress && <Paper className={cn(classes.gridMiscItem, 'PlayersList', {'Compressed': compress})}>
            <PlayersList game={game} />
          </Paper>}
          <Paper className={cn(classes.gridMiscItem, 'Toolbar', {'Compressed': compress})}>
            <GameInfoToolbar game={game} compressControls={{compress, toggleCompress}} />
          </Paper>
          <div className={classes.gridMiscSubRow}>
            {!game.isPlantarium() && <Paper className={cn(classes.gridMiscItem, 'Food', {'Compressed': compress})}>
              <FoodWrapper game={game} />
            </Paper>}
            <Paper className={cn(classes.gridMiscItem, 'Chat', {'Compressed': compress})}>
              {!compress ? <ChatWrapper game={game} /> : <ChatWrapperSmall game={game} />}
            </Paper>
          </div>
        </Grid>
        <Grid item className={classes.gridPlayers}>
          {game.isPlantarium() && <PlantsWrapper game={game} classes={classes} />}
          {game.sortPlayersFromIndex(game.players, 0).map((player) => (
            (player.playing || player.continent.size > 0) &&
            <PlayerWrapper key={player.id} playerId={player.id} classes={classes} game={game} />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export const ChatWrapper = ({game}) => <Chat chatTargetType='ROOM' roomId={game.roomId} />;

export const ChatWrapperSmall = ({game}) => <ChatWindow chatTargetType='ROOM' roomId={game.roomId} length={1} />;

export const PlantsWrapper = ({classes, game}) => {
  const className = cn(classes.GridWrapper, {});
  return <Paper id='Plants' className={className}>
    <Typography>{T.translate('Game.UI.Plants')}</Typography>
    <div className={classes.ContinentContainer}>
      <PlantsContainer game={game} />
    </div>
  </Paper>
};

export const PlayerWrapper = ({classes, playerId, game}) => {
  const currentPlayerId = game.getPlayer() ? game.getPlayer().id : null;
  const isUserWrapper = currentPlayerId === playerId;
  const isPlayerTurn = game.isPlayerTurn();
  const className = cn(classes.GridWrapper, classes.PlayerWrapper, 'PlayerWrapper', {
    isUserWrapper
    , isPlayerTurn
    , isUserTurn: isUserWrapper && isPlayerTurn
  });
  return <Paper id={playerId} className={className}>
    <PlayerUser game={game} playerId={playerId} />
    <div className={classes.ContinentContainer}>
      <Continent playerId={playerId} />
    </div>
    {isUserWrapper && <Grid item className={classes.gridHand}>
      <PlayerHandWrapper><PlayerHand /></PlayerHandWrapper>
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
  , wrap(SVGContextProvider)
  , wrap(InteractionManagerProvider)
  , withStateHandlers(({compress: false}), {
    toggleCompress: ({compress}) => () => ({compress: !compress})
  })
  // debug
  // , connect(null, {debugMirrorPlayer})
  // , lifecycle({
  //   mirrorPlayer() {
  //     if (process.env.NODE_ENV !== 'development') return;
  //     // if (this.props.game.players.size === 1) {
  //     //   this.props.debugMirrorPlayer({limit: 10});
  //     // }
  //     // else if (this.props.game.players.size === 2) {
  //     //   this.props.debugMirrorPlayer({limit: 1});
  //     // } else if (this.props.game.players.size === 3) {
  //     //   this.props.debugMirrorPlayer({limit: 2});
  //     // } else if (this.props.game.players.size === 4) {
  //     //   this.props.debugMirrorPlayer({limit: 5});
  //     // } else if (this.props.game.players.size === 5) {
  //     //   this.props.debugMirrorPlayer({limit: 8});
  //     // }
  //   },
  //   componentDidMount() {
  //     this.mirrorPlayer();
  //   }
  //   , componentDidUpdate() {
  //     this.mirrorPlayer();
  //   }
  // })
)(GameUIv3);