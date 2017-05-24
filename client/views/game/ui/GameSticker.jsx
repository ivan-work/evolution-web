import {List} from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import * as MDL from 'react-mdl';

import {GameModel, GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';
import {traitAmbushContinueRequest} from '../../../../shared/actions/actions';

import Tooltip from 'rc-tooltip';
import GameEndTurnButton from './GameEndTurnButton.jsx';
import GameLog from '../ui/GameLog.jsx';
import Pause from '../ui/Pause.jsx';

import {Timer} from '../../utils/Timer.jsx';

export class GameSticker extends React.PureComponent {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  playerHasAmbushes() {
    const game = this.props.game;
    if (game.getIn(['ambush', 'ambushers']) && game.userId) {
      return game.getIn(['ambush', 'ambushers']).some((wants, animalId) => {
        const animal = game.locateAnimal(animalId, game.userId).animal;
        if (animal && wants === null) return true;
      });
    }
  }

  render() {
    const {game, $traitAmbushContinue} = this.props;
    const {status, settings, question} = game;
    return (<div className="GameSticker">
      <span>
        <h6>{T.translate('Game.UI.Status.Title')}:</h6>
      </span>
      <ul>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Turn')}:&nbsp;</span>
          <span className='value'>{status.turn}</span>
          &nbsp;/&nbsp;
          <span className='key'>{T.translate('Game.UI.Status.Round')}:&nbsp;</span>
          <span className='value'>{status.round}</span>
        </li>
        <li className='line'>
          <span className='key'></span>
          <span className='value'>{T.translate('Game.Phase.' + status.phase)}</span>
        </li>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Time')}:&nbsp;</span>
          <span className='value'>
          {(game.status.paused ? <span>{T.translate('Game.UI.Status.Pause')}</span>
            : !!question ? <Timer start={question.time} duration={settings.timeTraitResponse}/>
            : status.phase === PHASE.REGENERATION ?
            <Timer start={status.turnStartTime} duration={settings.timeTraitResponse}/>
            : status.phase === PHASE.AMBUSH ? <Timer start={status.turnStartTime} duration={settings.timeAmbush}/>
            : status.turnStartTime != null ? <Timer start={status.turnStartTime} duration={status.turnDuration}/>
            : '-')}
          </span>
        </li>
      </ul>
      <div className='controls'>
        <GameLog game={game}/>
        <Pause/>
      </div>
      <div className='flex'/>
      {game.status.phase !== PHASE.AMBUSH && <GameEndTurnButton game={game}/>}
      {game.status.phase === PHASE.AMBUSH &&
      <MDL.Button raised accent disabled={!this.playerHasAmbushes()} onClick={$traitAmbushContinue}>
        {T.translate('Game.UI.EndAmbush')}
      </MDL.Button>}
    </div>);
  }
}

const GameStickerView = connect((state, {game}) => {
    const userId = state.getIn(['user', 'id']);
    const roomId = state.get('room');
    const isHost = state.getIn(['rooms', roomId, 'users', 0]) === userId;
    return {isHost}
  }
  , (dispatch, props) => ({
    $traitAmbushContinue: () => dispatch(traitAmbushContinueRequest())
  }))(GameSticker);

export default GameStickerView