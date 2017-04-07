import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import cn from 'classnames';

import {GameModelClient} from '../../../../shared/models/game/GameModel';

import {UserService} from '../../../services/UserService'

export class PlayersList extends Component {
  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  static getSortedPlayersByIndex(game) {
    let players = [];
    for (let i = 0, c = game.status.roundPlayer; i < game.players.size; ++i) {
      players.push(game.players.find(player => player.index === c));
      c = (c + 1) % game.players.size;
    }
    return players;
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
      {PlayersList.getSortedPlayersByIndex(game)
        .map(player => PlayersList.renderPlayer(game, player))}
    </ul>
  }
}