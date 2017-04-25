import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';

import {GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';

import UserView from '../../utils/User.jsx'

import {Timer} from '../../utils/Timer.jsx';

export class GameStatusDisplay extends React.PureComponent {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  getPlayerNameByIndex(players, index) {
    const playerId = players.findKey(player => player.index === index);
    return <UserView id={playerId}/>;
  }

  render() {
    const {game} = this.props;
    const {status, players, settings, question} = game;
    return (<ul className="GameStatus">
      <h6>{T.translate('Game.UI.Status.Title')}:</h6>
      <li className='line'>
        <span className='key'>{T.translate('Game.UI.Status.Turn')}:</span>
        <span className='value'>{status.turn}</span>
      </li>
      <li className='line'>
        <span className='key'>{T.translate('Game.UI.Status.Phase')}:</span>
        <span className='value'>{T.translate('Game.Phase.' + status.phase)}</span>
      </li>
      <li className='line'>
        <span className='key'>{T.translate('Game.UI.Status.Round')}:</span>
        <span className='value'>{status.round}</span>
      </li>
      <li className='line'>
        <span className='key'>{T.translate('Game.UI.Status.Player')}:</span>
        <span className='value'>
          {question ? <UserView id={question.targetPid} output='name'/>
            : this.getPlayerNameByIndex(players, status.currentPlayer)}
        </span>
      </li>
      <li className='line'>
        <span className='key'>{T.translate('Game.UI.Status.Time')}:</span>
        <span className='value'>
          {(game.status.paused ? <span>{T.translate('Game.UI.Status.Pause')}</span>
            : !!question ? <Timer start={question.time} duration={settings.timeTraitResponse}/>
            : status.turnStartTime != null ? <Timer start={status.turnStartTime} duration={status.turnDuration}/>
            : '-')}
          </span>
      </li>
    </ul>);
  }
}