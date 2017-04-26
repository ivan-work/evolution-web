import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'
import {connect} from 'react-redux';
import {compose} from 'redux';
import * as MDL from 'react-mdl'

// shared
import {traitAnswerRequest, roomExitRequest} from '../../../shared/actions/actions';

// Animations
import {AnimationServiceContext} from '../../services/AnimationService';
import {createAnimationServiceConfig} from '../game/animations';

// DnD
import {DragDropContext} from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import TestBackend from 'react-dnd-test-backend';
const backend = !process.env.TEST ? TouchBackend({enableMouseEvents: true}) : TestBackend;

import CustomDragLayer from '../game/dnd/CustomDragLayer.jsx';

// Style
import './Game.scss'

// Components
import {Portal} from '../utils/Portal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
// import {GameFoodContainer} from './food/GameFoodContainer.jsx';
// import TraitShell from './animals/TraitShell.jsx';

import GameScoreboardFinal from '../game/ui/GameScoreboardFinal.jsx';

import GameTimedOutDialog from './ui/GameTimedOutDialog.jsx'
import TraitIntellectDialog from './ui/TraitIntellectDialog.jsx'
import TraitDefenceDialog from '../game/ui/TraitDefenceDialog.jsx'

import DeckSticker from './ui/DeckSticker.jsx';

import GameSticker from './ui/GameSticker.jsx';

import Chat from '../Chat.jsx';
import PlayerSticker from "./PlayerSticker.jsx";

export class Game extends React.Component {
  render() {
    const {game, $traitAnswer, $exit} = this.props;
    const shadow = 2;
    return <div className="Game2-wrapper">
      <GameTimedOutDialog game={game}/>
      <TraitIntellectDialog game={game} $traitAnswer={$traitAnswer}/>
      <TraitDefenceDialog game={game} $traitAnswer={$traitAnswer}/>

      <Portal target='header'>
        <ControlGroup name={T.translate('Game.Game')}>
          <MDL.Button id="Game$Exit" onClick={$exit}>{T.translate('App.Room.$Exit')}</MDL.Button>
          <GameScoreboardFinal game={game}/>
        </ControlGroup>
      </Portal>

      <div className='Game2'>
        <div className='row'>
          <MDL.Card shadow={shadow} className='GameStickerCard Short'>
            <GameSticker game={game}/>
          </MDL.Card>
          <MDL.Card shadow={shadow} className='DeckStickerCard Short'>
            <DeckSticker game={game}/>
          </MDL.Card>
          <MDL.Card shadow={shadow}>Food</MDL.Card>
          <MDL.Card shadow={shadow}>
            <h6>{T.translate('App.Chat.Label')}:</h6>
            <Chat chatTargetType='ROOM' roomId={game.roomId}/>
          </MDL.Card>
        </div>
        <div className='row'>
          <MDL.Card shadow={shadow} className='PlayerStickerCard'>
            <PlayerSticker game={game}/>
          </MDL.Card>
          <MDL.Card shadow={shadow}>Player4</MDL.Card>
          <MDL.Card shadow={shadow}>Player6</MDL.Card>
          <MDL.Card shadow={shadow}>Player8</MDL.Card>
        </div>
        <div className='row'>
          <MDL.Card shadow={shadow}>Player2</MDL.Card>
          <MDL.Card shadow={shadow}>Player3</MDL.Card>
          <MDL.Card shadow={shadow}>Player5</MDL.Card>
          <MDL.Card shadow={shadow}>Player7</MDL.Card>
        </div>
          {/*{game.getActualPlayers().size > 3 && <MDL.Card shadow={shadow}>Player4</MDL.Card>}*/}
          {/*{game.getActualPlayers().size > 5 && <MDL.Card shadow={shadow}>Player6</MDL.Card>}*/}
          {/*{game.getActualPlayers().size > 7 && <MDL.Card shadow={shadow}>Player8</MDL.Card>}*/}
        {/*</div>*/}
        {/*<div className='row'>*/}
          {/*{game.getActualPlayers().size > 1 && <MDL.Card shadow={shadow}>Player2</MDL.Card>}*/}
          {/*{game.getActualPlayers().size > 2 && <MDL.Card shadow={shadow}>Player3</MDL.Card>}*/}
          {/*{game.getActualPlayers().size > 4 && <MDL.Card shadow={shadow}>Player5</MDL.Card>}*/}
          {/*{game.getActualPlayers().size > 6 && <MDL.Card shadow={shadow}>Player7</MDL.Card>}*/}
        {/*</div>*/}
      </div>

      <CustomDragLayer />
    </div>
  }
}

export const GameView = compose(
  DragDropContext(backend)
  , AnimationServiceContext(createAnimationServiceConfig())
  , connect((state, props) => {
      const game = state.get('game');
      const user = state.get('user');
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      return {game, user, roomId, room}
    }
    , (dispatch) => ({
      $traitAnswer: (...args) => dispatch(traitAnswerRequest(...args))
      , $exit: () => dispatch(roomExitRequest())
    })
  ))(Game);

export default GameView;