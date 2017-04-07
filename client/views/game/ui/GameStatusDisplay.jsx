import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';

import {UserService} from '../../../services/UserService'

export class GameStatusDisplay extends Component {
  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getPhaseAsString() {
    switch (this.props.game.status.phase){
      case PHASE.DEPLOY:
        return 'Deploy';
      case PHASE.FEEDING:
        return 'Feeding';
      default:
        return '-'
    }
  }

  getPlayerNameByIndex(index) {
    const player = this.props.game.players.find(player => player.index === index);
    return UserService.get(player.id).login;
  }

  render() {
    const {game} = this.props;
    return <ul className="GameStatus">
      <h6>Game Status:</h6>
      <li>
        <span className='key'>Turn:</span>
        <span className='value'>{game.status.turn}</span>
      </li>
      <li>
        <span className='key'>Phase:</span>
        <span className='value'>{this.getPhaseAsString()}</span>
      </li>
      <li>
        <span className='key'>Round:</span>
        <span className='value'>{game.status.round}</span>
      </li>
      <li>
        <span className='key'>Player:</span>
        <span className='value'>{this.getPlayerNameByIndex(game.status.currentPlayer)}</span>
      </li>
    </ul>
  }
}