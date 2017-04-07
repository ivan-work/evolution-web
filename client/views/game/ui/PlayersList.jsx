import {List} from 'immutable'
import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import {GameModel, GameModelClient} from '../../../../shared/models/game/GameModel';

import {Icon, Badge, Tooltip as MDLTooltip} from 'react-mdl';
import User from '../../utils/User.jsx';

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
      <User id={player.id}/>
    </li>
  }

  render() {
    const {game} = this.props;
    return <ul className='PlayersList'>
      <h6 style={{display: 'inline-block'}}>{T.translate('App.Room.Players')}: </h6>{this.renderSpectators()}
      {GameModel.sortPlayersFromIndex(game)
        .map(player => this.renderPlayer(game, player))}
    </ul>
  }

  renderSpectators() {
    const spectatorsList = this.props.spectatorsList;
    return (spectatorsList.size > 0 && <MDLTooltip label={T.translate('App.Room.Spectators') + ': ' + spectatorsList.join(', ')}>
      <span>
        <Badge text={spectatorsList.size}>&nbsp;</Badge>
      </span>
    </MDLTooltip>)
  }
}

const PlayersListView = connect((state, {game}) => ({
  spectatorsList: state.getIn(['rooms', game.roomId, 'spectators'], List())
    .map(id => state.getIn(['online', id, 'login'], '---'))
}))(PlayersList);


export default PlayersListView;