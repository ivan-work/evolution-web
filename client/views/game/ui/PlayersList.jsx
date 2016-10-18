import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import cn from 'classnames';

import {GameModel, GameModelClient} from '../../../../shared/models/game/GameModel';

import {UserService} from '../../../services/UserService'

export class PlayersList extends Component {
  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  static renderPlayer(game, player) {
    const user = UserService.get(player.id);
    const className = cn({
      Player: true
      , isPlayerTurn: game.isPlayerTurn(player.id)
    });
    return <li key={player.id} className={className}>
      {user.login}
    </li>
  }

  render() {
    const {game} = this.props;
    return <ul className='PlayersList'>
      <h6>Players:</h6>
      {GameModel.getSortedPlayersByIndex(game)
        .map(player => PlayersList.renderPlayer(game, player))}
    </ul>
  }
}