import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import IPT from 'react-immutable-proptypes';

import {StatusRecord, PHASE} from '../../../../shared/models/game/GameModel';
import {PlayerModel} from '../../../../shared/models/game/PlayerModel';

import {UserServicePropType} from '../../../services/UserService'

export class GameStatusDisplay extends Component {
  static propTypes = {
    status: PropTypes.instanceOf(StatusRecord).isRequired
    , players: IPT.mapOf(PropTypes.instanceOf(PlayerModel), PropTypes.string).isRequired
  };

  static contextTypes = {
    userService: UserServicePropType
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  static getPhaseAsString(phase) {
    switch (phase) {
      case PHASE.DEPLOY:
        return 'Deploy';
      case PHASE.FEEDING:
        return 'Feeding';
      default:
        return '-'
    }
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
    const {status, players} = this.props;
    return <ul className="GameStatus">
      <h6>Game Status:</h6>
      <li>
        <span className='key'>Turn:</span>
        <span className='value'>{status.turn}</span>
      </li>
      <li>
        <span className='key'>Phase:</span>
        <span className='value'>{GameStatusDisplay.getPhaseAsString(status.phase)}</span>
      </li>
      <li>
        <span className='key'>Round:</span>
        <span className='value'>{status.round}</span>
      </li>
      <li>
        <span className='key'>Player:</span>
        <span className='value'>{this.getPlayerNameByIndex(players, status.currentPlayer)}</span>
      </li>
    </ul>
  }
}