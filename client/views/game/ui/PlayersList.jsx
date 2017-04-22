import {List} from 'immutable';
import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import {GameModel, GameModelClient} from '../../../../shared/models/game/GameModel';

import {
  Icon
  , Badge
  , Tooltip as MDLTooltip
  , IconButton
  , ListItem
  , ListItemAction
  , ListItemContent
} from 'react-mdl';

import Tooltip from 'rc-tooltip';
import User from '../../utils/User.jsx';
import UsersList from '../../utils/UsersList.jsx';

import {
  roomKickRequest,
  roomBanRequest
} from '../../../../shared/actions/actions';

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
      , ended: player.ended
    });
    return <li key={player.id} className={className}>
      <User id={player.id}/> {player.getWantsPause() && <Icon name='pause'/>}
    </li>
  }

  render() {
    const {game} = this.props;
    return <ul className='PlayersList'>
      <h6 style={{display: 'inline-block'}}>
        {T.translate('App.Room.Players')}:
      </h6>
      {this.renderSpectators()}
      {GameModel.sortPlayersFromIndex(game)
        .map(player => this.renderPlayer(game, player))}
    </ul>
  }

  renderSpectators() {
    const spectatorsList = this.props.spectatorsList;
    return (spectatorsList.size > 0 && <Tooltip
      overlay={this.renderSpectatorsList()}>
      <span>
        <Badge text={spectatorsList.size}>&nbsp;</Badge>
      </span>
    </Tooltip>)
    // return (spectatorsList.size > 0 && <span>
    //     <Badge text={spectatorsList.size}>&nbsp;</Badge>
    //   </span>)
  }

  renderSpectatorsList() {
    const {isHost, spectatorsList, $Kick, $Ban} = this.props;

    return (<div>
      <h1>{T.translate('App.Room.Spectators')}</h1>
      <UsersList list={spectatorsList} className=''>
        {(user) => (
          <ListItem className='small'>
            <ListItemContent>{user.login}</ListItemContent>
            <ListItemAction>
              {isHost && <MDLTooltip label={T.translate('App.Room.$Kick')}>
                <IconButton name='clear' onClick={() => $Kick(user.id)}/>
              </MDLTooltip>}
              {isHost && <MDLTooltip label={T.translate('App.Room.$Ban')}>
                <IconButton name='block' onClick={() => $Ban(user.id)}/>
              </MDLTooltip>}
            </ListItemAction>
          </ListItem>)}
      </UsersList>
    </div>);
  }
}

const PlayersListView = connect((state, {game}) => {
    const userId = state.getIn(['user', 'id']);
    const roomId = state.get('room');
    const isHost = state.getIn(['rooms', roomId, 'users', 0]) === userId;
    return {
      isHost
      , spectatorsList: state.getIn(['rooms', roomId, 'spectators'], List())
    }
  }
  , (dispatch) => ({
    $Kick: (userId) => dispatch(roomKickRequest(userId))
    , $Ban: (userId) => dispatch(roomBanRequest(userId))
  }))(PlayersList);


export default PlayersListView;