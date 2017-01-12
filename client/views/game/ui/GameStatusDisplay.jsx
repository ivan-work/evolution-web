import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';

import UserView from '../../utils/User.jsx'

import {Timer} from '../../utils/Timer.jsx';

export class GameStatusDisplay extends Component {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getPlayerNameByIndex(players, index) {
    const playerId = players.findKey(player => player.index === index);
    return <UserView id={playerId} output='name'/>;
  }

  render() {
    const {game} = this.props;
    const {status, players, settings} = game;
    return (<ul className="GameStatus">
      <h6>Game Status:</h6>
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
        <span className='value'>{this.getPlayerNameByIndex(players, status.currentPlayer)}</span>
      </li>
      <li className='line'>
        <span className='key'>{T.translate('Game.UI.Status.Time')}:</span>
        <span className='value'>{status.turnTime != null ? <Timer start={status.turnTime} duration={settings.timeTurn}/> : '-'}</span>
      </li>
    </ul>);
  }
}