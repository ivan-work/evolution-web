import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import {GameModel, GameModelClient} from '../../../../shared/models/game/GameModel';

import {
  Icon
  , Badge
  , Tooltip
  , IconButton
  , ListItem
  , ListItemAction
  , ListItemContent
} from 'react-mdl';

import {Tooltip as CustomTooltip} from '../../utils/Tooltips';
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
      <User id={player.id}/> {player.wantsPause && <Icon name='pause'/>}
    </li>
  }

  render() {
    const {game} = this.props;
    return <ul className='PlayersList'>
      <h6 style={{display: 'inline-block'}}
          data-tip='hey hey'>{T.translate('App.Room.Players')}: </h6>
      {this.renderSpectators()}
      {GameModel.sortPlayersFromIndex(game)
        .map(player => this.renderPlayer(game, player))}
    </ul>
  }

  renderSpectators() {
    const spectatorsList = this.props.spectatorsList;
    // return (spectatorsList.size > 0 && <CustomTooltip label={this.renderSpectatorsList()}>
    //   <span>
    //     <Badge text={spectatorsList.size}>&nbsp;</Badge>
    //   </span>
    // </CustomTooltip>)
    return (spectatorsList.size > 0 && <span>
        <Badge text={spectatorsList.size}>&nbsp;</Badge>
      </span>)
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
              {isHost && <Tooltip label={T.translate('App.Room.$Kick')}>
                <IconButton name='clear' onClick={() => $Kick(user.id)}/>
              </Tooltip>}
              {isHost && <Tooltip label={T.translate('App.Room.$Ban')}>
                <IconButton name='block' onClick={() => $Ban(user.id)}/>
              </Tooltip>}
            </ListItemAction>
          </ListItem>)}
      </UsersList>
    </div>);
  }
}

const PlayersListView = connect((state, {game}) => {
    const userId = state.getIn(['user', 'id']);
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    const isHost = room.users.get(0) === userId;
    return {
      isHost
      , spectatorsList: room.spectators
    }
  }
  , (dispatch) => ({
    $Kick: (userId) => dispatch(roomKickRequest(userId))
    , $Ban: (userId) => dispatch(roomBanRequest(userId))
  }))(PlayersList);


export default PlayersListView;