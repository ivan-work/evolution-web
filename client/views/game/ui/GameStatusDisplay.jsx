import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import IPT from 'react-immutable-proptypes';

import {GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';
import {PlayerModel} from '../../../../shared/models/game/PlayerModel';

import {UserServicePropType} from '../../../services/UserService'

import {Timer} from '../../utils/Timer.jsx';

export class GameStatusDisplay extends Component {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  static contextTypes = {
    userService: UserServicePropType
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getPlayerNameByIndex(players, index) {
    const {userService} = this.context;
    const player = players.find(player => player.index === index);
    return (player && player.id && userService.get(player.id) && userService.get(player.id).login
      ? userService.get(player.id).login
      : '---'
    );
  }

  render() {
    const {game} = this.props;
    const {status, players, settings} = game;
    return <ul className="GameStatus">
      <h6>Game Status:</h6>
      <li>
        <span className='key'>{T.translate('Game.UI.Status.Turn')}:</span>
        <span className='value'>{status.turn}</span>
      </li>
      <li>
        <span className='key'>{T.translate('Game.UI.Status.Phase')}:</span>
        <span className='value'>{T.translate('Game.Phase.' + status.phase)}</span>
      </li>
      <li>
        <span className='key'>{T.translate('Game.UI.Status.Round')}:</span>
        <span className='value'>{status.round}</span>
      </li>
      <li>
        <span className='key'>{T.translate('Game.UI.Status.Player')}:</span>
        <span className='value'>{this.getPlayerNameByIndex(players, status.currentPlayer)}</span>
      </li>
      <li>
        <span className='key'>{T.translate('Game.UI.Status.Time')}:</span>
        <span className='value'><Timer start={status.turnTime} end={status.turnTime + settings.timeTurn}/></span>
      </li>
    </ul>
  }
}