import React from 'react';
import {compose, lifecycle, withStateHandlers} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import Chat from "../Chat";
import Grid from "@material-ui/core/Grid/Grid";
import PlayerHand from "./PlayerHand";
import Continent from "./continent/Continent";
import ContinentPreview from "./continent/ContinentPreview";
import {debugMirrorPlayer} from "../../actions/debug";
import PreviewTab from "./preview/PreviewTab";
import PreviewPlayer from "./preview/PreviewPlayer";
import PreviewFood from "./preview/PreviewFood";
// import GamePreviews from "./GamePreviews";
import IconFood from '@material-ui/icons/Spa';
import User from "../utils/User";
import PlayerHandWrapper from "./PlayerHandWrapper";
import GameInfoToolbar from "./ui/GameInfoToolbar";
import Paper from "@material-ui/core/Paper/Paper";
import PreviewChat from "./preview/PreviewChat";

const styles = theme => ({
  game: {
    flex: '1 1 0'
    , overflowX: 'hidden'
    , overflowY: 'auto'
    , flexWrap: 'nowrap'
  }
  , gridPreviews: {
    flexWrap: 'wrap'
    , justifyContent: 'space-evenly'
    , marginTop: 4
  }
  , gridGameToolbar: {
    // marginTop: theme.spacing.unit
  }
  , gridFocus: {
    flex: '1 1 auto'
    , display: 'flex'
    , flexFlow: 'row nowrap'
    , marginTop: 4
  }
  , gridHand: {
    marginTop: 4
  }
  , FocusContainer: {
    display: 'flex'
    , flexFlow: 'column nowrap'

    , flex: '1 0 0'
    , minWidth: 0

    , textAlign: 'center'
    , '&.hideWhenSmall': {
      [theme.breakpoints.down('md')]: {
        display: 'none'
      }
    }
  }
  , FocusScroll: {
    display: 'flex'
    , overflow: 'auto'
    , flex: '1 1 0'
  }
});

export const FOCUS_TYPE = {
  PLAYER: 'PLAYER'
  , FOOD: 'FOOD'
  , CHAT: 'CHAT'
};

export const GameUIv3 = ({classes, game, focus, setHoverFocus, setClickFocus}) => {
  const currentPlayerId = game.getPlayer() ? game.getPlayer().id : null;
  return (
    <Grid container direction='column' className={classes.game}>
      {/*<Chat chatTargetType='ROOM' roomId={game.roomId}/>*/}
      {/*<Previews/>*/}
      <Grid item container className={classes.gridPreviews}>
        <PreviewChat game={game}
                     focus={focus}
                     setHoverFocus={setHoverFocus}
                     setClickFocus={setClickFocus}/>
        <PreviewFood game={game}
                     focus={focus}
                     setHoverFocus={setHoverFocus}
                     setClickFocus={setClickFocus}/>
        {game.players.toList().map(player => (
          <PreviewPlayer key={player.id}
                         player={player}
                         focus={focus}
                         setHoverFocus={setHoverFocus}
                         setClickFocus={setClickFocus}
          />
        ))}
      </Grid>
      <Grid item className={classes.gridGameToolbar}>
        <GameInfoToolbar game={game}/>
      </Grid>
      {/*{JSON.stringify(focus, null, ' ')}*/}
      <Grid item className={classes.gridFocus}>
        {currentPlayerId && <FocusedElement classes={classes}
                                            game={game}
                                            hideWhenSmall
                                            focus={{type: FOCUS_TYPE.PLAYER, data: currentPlayerId}}/>}
        <FocusedElement classes={classes}
                        game={game}
                        focus={focus.hover || focus.click || {type: FOCUS_TYPE.PLAYER, data: currentPlayerId}}/>
        {/*<Continent playerId={game.getPlayer().id}/>*/}
      </Grid>
      <Grid item className={classes.gridHand}>
        <Paper>
          {currentPlayerId && <PlayerHandWrapper><PlayerHand/></PlayerHandWrapper>}
        </Paper>
      </Grid>
    </Grid>
  );
}

export const FocusedElement = ({classes, focus, hideWhenSmall, game}) => {
  if (focus.type === FOCUS_TYPE.PLAYER && focus.data) {
    return <Paper className={`${classes.FocusContainer} ${hideWhenSmall ? 'hideWhenSmall' : ''}`}>
      <User id={focus.data}/>
      <div className={classes.FocusScroll}>
        <Continent playerId={focus.data}/>
      </div>
    </Paper>
  } else if (focus.type === FOCUS_TYPE.FOOD) {
    return <Paper className={classes.FocusContainer}>Some food here</Paper>;
  } else if (focus.type === FOCUS_TYPE.CHAT) {
    return <Paper className={classes.FocusContainer}>
      <Chat chatTargetType='ROOM' roomId={game.roomId}/>
    </Paper>;
  } else {
    return null;
  }
};

export default compose(
  withStyles(styles)
  , connect((state, props) => {
    const game = state.get('game');
    return {game}
  })
  , withStateHandlers({
    focus: {
      hover: null
      , click: null
    }
  }, {
    setHoverFocus: ({focus}) => (focusData) => ({focus: {hover: focusData, click: focus.click}})
    , setClickFocus: ({focus}) => (focusData) => ({focus: {hover: focus.hover, click: focusData}})
  })
  // debug
  , connect(null, {debugMirrorPlayer})
  , lifecycle({
    mirrorPlayer() {
      if (this.props.game.players.size === 1) {
        this.props.debugMirrorPlayer();
      } else if (this.props.game.players.size === 2) {
        this.props.debugMirrorPlayer({limit: 1});
      } else if (this.props.game.players.size === 3) {
        this.props.debugMirrorPlayer({limit: 2});
      } else if (this.props.game.players.size === 4) {
        this.props.debugMirrorPlayer({limit: 5});
      } else if (this.props.game.players.size === 5) {
        this.props.debugMirrorPlayer({limit: 8});
      }
    },
    componentDidMount() {
      this.mirrorPlayer();
    }
    , componentDidUpdate() {
      this.mirrorPlayer();
    }
  })
)(GameUIv3);