import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'
import {connect} from 'react-redux';
import {compose} from 'redux';
import * as MDL from 'react-mdl'

// shared
import {GameModel, PHASE} from '../../../shared/models/game/GameModel';
import {traitAnswerRequest, roomExitRequest} from '../../../shared/actions/actions';
import {appSwitchUI} from '../../actions/app';

// DnD
import {DragDropContext} from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import TestBackend from 'react-dnd-test-backend';
const backend = !process.env.TEST ? TouchBackend({enableMouseEvents: true}) : TestBackend;

import CustomDragLayer from './dnd/CustomDragLayer.jsx';

// Style
import './Game.scss'

// Components
import {Portal} from '../utils/Portal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import TraitShell from './animals/TraitShell.jsx';

import GameScoreboardFinal from '../game/ui/GameScoreboardFinal.jsx';

import GameTimedOutDialog from './ui/GameTimedOutDialog.jsx'
import TraitIntellectDialog from './ui/TraitIntellectDialog.jsx'
import TraitDefenceDialog from '../game/ui/TraitDefenceDialog.jsx'

import DeckSticker from './ui/DeckSticker.jsx';

import GameSticker from './ui/GameSticker.jsx';

import Chat from '../Chat.jsx';
import PlayerSticker from "./PlayerSticker.jsx";

const SHADOW = 2;

export class Game extends React.Component {
  render() {
    const {game, $traitAnswer, $exit, $switchUI} = this.props;

    const playerIndex = game.getPlayer() && game.getPlayer().index;
    const players = GameModel.sortActualPlayersFromIndex(game, playerIndex);

    return <div className="Game2-wrapper">
      <GameTimedOutDialog game={game}/>
      <TraitIntellectDialog game={game} $traitAnswer={$traitAnswer}/>
      <TraitDefenceDialog game={game} $traitAnswer={$traitAnswer}/>

      <Portal target='header'>
        <MDL.Button id="Game$switchUI" onClick={$switchUI}>{T.translate('Game.UI.SwitchUI.New')}</MDL.Button>
        <ControlGroup name={T.translate('Game.Game')}>
          <MDL.Button id="Game$Exit" onClick={$exit}>{T.translate('App.Room.$Exit')}</MDL.Button>
          <GameScoreboardFinal game={game}/>
        </ControlGroup>
      </Portal>

      <div className='Game2'>
        <div className='row'>
          <MDL.Card shadow={SHADOW} className='GameStickerCard Short'>
            <GameSticker game={game}/>
          </MDL.Card>
          <MDL.Card shadow={SHADOW} className='DeckStickerCard Short'>
            <DeckSticker game={game}/>
          </MDL.Card>
          <MDL.Card shadow={SHADOW}>
            <h6>{T.translate('Game.UI.FoodBase')}{game.status.phase === PHASE.FEEDING && <span> ({game.food})</span>}:</h6>
            {game.status.phase === PHASE.FEEDING && <GameFoodContainer game={game} food={game.food}/>}
            <div className='GameShellContainer'>
              {game.continents.get('standard').shells.map((shell) => <TraitShell key={shell.id} game={game} trait={shell}/>).toList()}
            </div>
          </MDL.Card>
          <MDL.Card shadow={SHADOW}>
            <h6>{T.translate('App.Chat.Label')}:</h6>
            <Chat chatTargetType='ROOM' roomId={game.roomId}/>
          </MDL.Card>
        </div>
        <div className='row'>
          {/*<MDL.Card shadow={SHADOW}>Player</MDL.Card>*/}
          {this.renderPlayer(game, players, 0)}
          {(players.size > 3) && this.renderPlayer(game, players, 1)}
          {(players.size > 5) && this.renderPlayer(game, players, 2)}
          {(players.size > 7) && this.renderPlayer(game, players, 3)}
          {/*<MDL.Card shadow={SHADOW}>Player6</MDL.Card>*/}
        </div>
        <div className='row'>
          {/*<MDL.Card shadow={SHADOW}>Player6</MDL.Card>*/}
          {(players.size > 7) && this.renderPlayer(game, players, 7)}
          {(players.size > 6) && this.renderPlayer(game, players, 6)}
          {(players.size > 5) && this.renderPlayer(game, players, 5)}
          {(players.size > 4) && this.renderPlayer(game, players, 4)}
          {(players.size > 3 && players.size < 8) && this.renderPlayer(game, players, 3)}
          {(players.size > 2 && players.size < 6) && this.renderPlayer(game, players, 2)}
          {(players.size > 1 && players.size < 4) && this.renderPlayer(game, players, 1)}
          {/*<MDL.Card shadow={SHADOW}>Player6</MDL.Card>*/}
        </div>
      </div>

      <CustomDragLayer />
    </div>
  }

  renderPlayer(game, players, index) {
    const player = players.get(index);
    if (!player) return null;
    return (
      <MDL.Card shadow={SHADOW} className='PlayerStickerCard'>
        <PlayerSticker game={game} player={player}/>
      </MDL.Card>);
  }
}

export const GameView = compose(
  DragDropContext(backend)
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
      , $switchUI: () => dispatch(appSwitchUI())
    })
  ))(Game);

export default GameView;