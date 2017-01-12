import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import cn from 'classnames';

import {GameModel, GameModelClient} from '../../../../shared/models/game/GameModel';

import UserView from '../../utils/User.jsx'

export class PlayersList extends Component {
  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  renderPlayer(game, player) {
    const className = cn({
      Player: true
      , isPlayerTurn: game.isPlayerTurn(player.id)
    });
    return <li key={player.id} className={className}>
      <UserView id={player.id} output='name'/>
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