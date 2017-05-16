import {List} from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import * as MDL from 'react-mdl';

import {GameModel, GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';

import Tooltip from 'rc-tooltip';
import GameEndTurnButton from './GameEndTurnButton.jsx';
import GameLog from '../../game/ui/GameLog.jsx';
import Pause from '../../game/ui/Pause.jsx';

import {Timer} from '../../utils/Timer.jsx';

export class GameSticker extends React.PureComponent {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  render() {
    const {game} = this.props;
    const {status, settings, question} = game;
    return (<div className="GameSticker">
      <span>
        <h6>{T.translate('Game.UI.Status.Title')}:</h6>
      </span>
      <div className='controls'>
        <GameLog game={game}/>
        <Pause/>
      </div>
      <ul>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Turn')}:&nbsp;</span>
          <span className='value'>{status.turn}</span>
          &nbsp;/&nbsp;
          <span className='key'>{T.translate('Game.UI.Status.Round')}:&nbsp;</span>
          <span className='value'>{status.round}</span>
        </li>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Phase')}:&nbsp;</span>
          <span className='value'>{T.translate('Game.Phase.' + status.phase)}</span>
        </li>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Time')}:&nbsp;</span>
          <span className='value'>
          {(game.status.paused ? <span>{T.translate('Game.UI.Status.Pause')}</span>
            : !!question ? <Timer start={question.time} duration={settings.timeTraitResponse}/>
              : status.turnStartTime != null ? <Timer start={status.turnStartTime} duration={status.turnDuration}/>
                : '-')}
          </span>
        </li>
      </ul>
      <div className='flex'/>
      <GameEndTurnButton game={game}/>
    </div>);
  }
}

const GameStickerView = connect((state, {game}) => {
    const userId = state.getIn(['user', 'id']);
    const roomId = state.get('room');
    const isHost = state.getIn(['rooms', roomId, 'users', 0]) === userId;
    return {
      isHost
    }
  }
  , (dispatch) => ({
  }))(GameSticker);

export default GameStickerView