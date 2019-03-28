import {Set} from 'immutable';

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
import {chatMessageRequest} from "../../../shared/actions/chat";
import GameStyles from "./GameStyles";
import LocationService from "../../services/LocationService";

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
  , gridPreviews: {
    background: theme.palette.background.paper
    , flexWrap: 'wrap'
    , justifyContent: 'space-evenly'
    , marginTop: 2
    , flex: '0 0 auto'
  }
  , gridGameToolbar: {
    background: theme.palette.background.paper
    , marginTop: 2
    , marginBottom: 2
    // marginTop: theme.spacing.unit
  }
  , gridFocus: {
    flex: '1 1 auto'
    , display: 'flex'
    , flexFlow: 'row wrap'
  }
  , gridHand: {
    marginTop: 2
    , flex: '1 1 auto'
  }
  , FocusContainer: {
    display: 'flex'
    , flexFlow: 'column nowrap'

    , margin: 2

    , flex: '1 1 auto'
    , maxWidth: '100%'
    // , minHeight: GameStyles.animal.height * 1.2 + 60
    // , maxHeight: GameStyles.animal.height * 2.2 + 60

    , textAlign: 'center'
    , '&.hideWhenSmall': {
      [theme.breakpoints.down('md')]: {
        display: 'none'
      }
    }
    , '&.FOOD': {minWidth: 150, maxWidth: 300}
    , '&.CHAT': {minWidth: 300, maxWidth: '50%'}
    , '&.PLAYER': {minWidth: 200}
    , '&.highlight': {
      background: theme.palette.tertiary[50]
    }
  }
  , FocusScroll: {
    display: 'flex'
    , flex: '1 1 auto'
  }
});

export const GameUIv3 = ({classes, game, currentPlayerId, focusHover, focusSelect, setHoverFocus, setClickFocus, preview, togglePreview}) => {
  const focusControls = {
    setHoverFocus, setClickFocus, focusHover, focusSelect
  };
  return (
    <Grid container direction='column' className={classes.GameUIv3Container}>
      {preview && <Grid item container className={classes.gridPreviews}>
        {/*<PreviewChat game={game}*/}
                     {/*focusId='CHAT'*/}
                     {/*focusControls={focusControls}/>*/}
        <PreviewFood game={game}
                     focusId='FOOD'
                     focusControls={focusControls}/>
        {game.players.toList().map(player => (
          <PreviewPlayer key={player.id}
                         player={player}
                         focusId={player.id}
                         focusControls={focusControls}
          />
        ))}
      </Grid>}
      <Grid item className={classes.gridGameToolbar}>
        <GameInfoToolbar game={game} previewControls={{preview, togglePreview}}/>
      </Grid>
      <Grid item container direction='column' className={classes.GameUIv3}>
        {/*<Chat chatTargetType='ROOM' roomId={game.roomId}/>*/}
        {/*{JSON.stringify(focus, null, ' ')}*/}
        <Grid item className={classes.gridFocus}>
          <FocusedElement focusId={'FOOD'} classes={classes} game={game}/>
          <FocusedElement focusId={'CHAT'} classes={classes} game={game}/>
          {game.players.toList().map((player) => (
            <FocusedElement key={player.id} focusId={player.id} classes={classes} game={game}/>
          ))}

          {/*{currentPlayerId && <FocusedElement focusId={currentPlayerId} classes={classes} game={game}/>}*/}
          {/*{focusSelect.has('FOOD') && <FocusedElement focusId={'FOOD'} classes={classes} game={game}/>}*/}
          {/*{*/}
          {/*focusSelect.map((focusId) => (*/}
          {/*focusId !== currentPlayerId*/}
          {/*&& focusId !== 'FOOD'*/}
          {/*&& focusId !== 'CHAT'*/}
          {/*&& focusSelect.has(focusId)*/}
          {/*&& <FocusedElement key={focusId} focusId={focusId} classes={classes} game={game}/>*/}
          {/*))*/}
          {/*}*/}
          {/*{focusSelect.has('CHAT') && <FocusedElement focusId={'CHAT'} classes={classes} game={game}/>}*/}


          {/*{currentPlayerId && <FocusedElement classes={classes}*/}
          {/*game={game}*/}
          {/*hideWhenSmall*/}
          {/*focus={{type: FOCUS_TYPE.PLAYER, data: currentPlayerId}}/>}*/}
          {/*<FocusedElement classes={classes}*/}
          {/*game={game}*/}
          {/*focus={focus.hover || focus.click || {type: FOCUS_TYPE.PLAYER, data: currentPlayerId}}/>*/}
          {/*<Continent playerId={game.getPlayer().id}/>*/}
        </Grid>
      </Grid>
    </Grid>
  );
};

export const FocusedElement = ({classes, focusId, hideWhenSmall, game}) => {
  const currentPlayerId = game.getPlayer() ? game.getPlayer().id : null;
  const locationHash = LocationService.getLocationHash();

  if (focusId === 'FOOD') {
    return <Paper id={focusId}
                  className={`${classes.FocusContainer} ${focusId} ${locationHash === focusId ? 'highlight' : ''}`}>
      {Array.from({length: game.food}).map((u, index) => 'F ')}
    </Paper>;
  } else if (focusId === 'CHAT') {
    return <Paper id={focusId}
                  className={`${classes.FocusContainer} ${focusId} ${locationHash === focusId ? 'highlight' : ''}`}>
      <Chat chatTargetType='ROOM' roomId={game.roomId}/>
    </Paper>;
  } else if (focusId) {
    return <Paper id={focusId}
                  className={`${classes.FocusContainer} PLAYER ${focusId} ${locationHash === focusId ? 'highlight' : ''}`}>
      <User id={focusId}/>
      <div className={classes.FocusScroll}>
        <Continent playerId={focusId}/>
      </div>
      {currentPlayerId === focusId && <Grid item className={classes.gridHand}>
        <PlayerHandWrapper><PlayerHand/></PlayerHandWrapper>
      </Grid>}
    </Paper>
  } else {
    return null;
  }
};

export default compose(
  withStyles(styles)
  , connect((state, props) => {
    const game = state.get('game');
    const currentPlayerId = game.getPlayer() ? game.getPlayer().id : null;
    return {game, currentPlayerId}
  })
  , withStateHandlers(({currentPlayerId}) => ({
    preview: true
    , focus: Set(['CHAT', 'FOOD', currentPlayerId])
    , focusSelect: Set(['CHAT', 'FOOD', currentPlayerId])
    , focusHover: null
  }), {
    togglePreview: ({preview}) => () => ({preview: !preview})
    , setHoverFocus: () => (focusHover) => ({focusHover})
    , setClickFocus: ({focusSelect}) => (focusId, flag = false) => {
      return ({
        focusSelect: flag
          ? focusSelect.add(focusId)
          : focusSelect.remove(focusId)
      })
    }
  })
  // debug
  , connect(null, {debugMirrorPlayer, chatMessageRequest})
  , lifecycle({
    mirrorPlayer() {
      if (process.env.NODE_ENV !== 'development') return;
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