import React from 'react';
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

import {chatMessageRequest} from "../../../shared/actions/chat";
import {debugMirrorPlayer} from "../../actions/debug";
import {InteractiveFood} from "./food/Food";
import {InteractionContext, InteractionManagerProvider} from './InteractionManager'
import {SVGContextProvider, SVGContextSpy} from "./SVGContext";
import GameSVGOverlay from "./GameSVGOverlay";
import GameTimedOutDialog from "./ui/GameTimedOutDialog";
import QuestionIntellect from "./ui/QuestionIntellect";
import QuestionDefence from "./ui/QuestionDefence";
import {InteractiveShell} from "./food/Shell";
import AnimatedHOC from "../../services/AnimationService/AnimatedHOC";
import GameStyles from "./GameStyles";

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
  , gridMiscItem: {
    flex: '1 1 0'
    , margin: 1
    , minHeight: '4em'
    , maxHeight: 140
    , '&.Compressed': {
      maxHeight: 36
      , minHeight: 36
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

    , flex: '1 1 0'
    , minWidth: GameStyles.defaultWidth * 4

    , textAlign: 'center'
    , '&.isUserTurn': {
      background: '#F3FFFA'
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

export class SVGContextInteractionSpy extends React.PureComponent {
  static contextType = InteractionContext;

  render() {
    return <SVGContextSpy name='SVGContextInteractionSpy' watch={this.context.interaction}/>
  }
}

export const GameUIv3 = ({classes, game, compress, toggleCompress}) => {
  return (
    <Grid container direction='column' className={classes.GameUIv3Container}>
      <Grid item className={classes.gridGameToolbar}>
        <GameInfoToolbar game={game} compressControls={{compress, toggleCompress}}/>
      </Grid>
      <Grid item container direction='column' className={classes.GameUIv3}>

        <GameSVGOverlay/>
        <SVGContextInteractionSpy/>
        <GameTimedOutDialog/>
        <QuestionIntellect/>
        <QuestionDefence/>

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
          {game.sortPlayersFromIndex(game.players, 0).map((player) => (
            (player.playing || player.continent.size > 0) && <PlayerWrapper key={player.id} playerId={player.id} classes={classes} game={game}/>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export const FoodWrapper = AnimatedHOC(() => `FoodContainer`)(
  ({game}) => <div className='FoodContainer' style={{height: '100%'}}>
    {game.getArea().shells.map((trait) => <InteractiveShell key={trait.id} trait={trait}/>).toList()}
    {repeat(game.getFood(), i => <InteractiveFood key={i}/>)}
  </div>
);

export const ChatWrapper = ({game}) => <Chat chatTargetType='ROOM' roomId={game.roomId}/>;

export const ChatWrapperSmall = ({game}) => <ChatWindow chatTargetType='ROOM' roomId={game.roomId} length={1}/>;

export const PlayerWrapper = ({classes, playerId, game}) => {
  const currentPlayerId = game.getPlayer() ? game.getPlayer().id : null;
  const isUserWrapper = currentPlayerId === playerId;
  const isPlayerTurn = game.isPlayerTurn();
  const className = cn(classes.PlayerWrapper, 'PlayerWrapper', {
    isUserWrapper
    , isPlayerTurn
    , isUserTurn: isUserWrapper && isPlayerTurn
  });
  return <Paper id={playerId} className={className}>
    <PlayerUser game={game} playerId={playerId}/>
    <div className={classes.ContinentContainer}>
      <Continent playerId={playerId}/>
    </div>
    {isUserWrapper && <Grid item className={classes.gridHand}>
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
  , wrap(SVGContextProvider)
  , wrap(InteractionManagerProvider)
  , withStateHandlers(({compress: false}), {
    toggleCompress: ({compress}) => () => ({compress: !compress})
  })
  // debug
  , connect(null, {debugMirrorPlayer, chatMessageRequest})
  , lifecycle({
    mirrorPlayer() {
      if (process.env.NODE_ENV !== 'development') return;
      // if (this.props.game.players.size === 1) {
      //   this.props.debugMirrorPlayer({limit: 10});
      // }
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