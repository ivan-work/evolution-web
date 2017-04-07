import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import cn from 'classnames';

import {GameModel, GameModelClient} from '../../../../shared/models/game/GameModel';

import {UserServicePropType} from '../../../services/UserService'

export class PlayersList extends Component {
  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  static contextTypes = {
    userService: UserServicePropType
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  renderPlayer(game, player) {
    const {userService} = this.context;

    const user = userService.get(player.id);
    const className = cn({
      Player: true
      , isPlayerTurn: game.isPlayerTurn(player.id)
    });
    return <li key={player.id} className={className}>
      {user ? user.login : '---'}
    </li>
  }

  render() {
    const {game} = this.props;
    return <ul className='PlayersList'>
      <h6>Players:</h6>
      {GameModel.sortPlayersFromIndex(game)
        .map(player => this.renderPlayer(game, player))}
    </ul>
  }
}