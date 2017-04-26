import {List} from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import {
  Icon
  , Badge
  , Tooltip as MDLTooltip
  , IconButton
  , ListItem
  , ListItemAction
  , ListItemContent
} from 'react-mdl';

import {GameModel, GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';
import {PlayerModel} from '../../../../shared/models/game/PlayerModel';

import Tooltip from 'rc-tooltip';
import User from '../../utils/User.jsx';
import UsersList from '../../utils/UsersList.jsx';
import GameEndTurnButton from './GameEndTurnButton.jsx';

import {Timer} from '../../utils/Timer.jsx';

import './GameSticker.scss'

export class GameSticker extends React.PureComponent {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  render() {
    const {game} = this.props;
    return (<div className="GameSticker">
      <span>
        <h6>{T.translate('App.Room.Players')}:</h6>
        {this.renderSpectators()}
      </span>
      <ul className='PlayersList'>
        {GameModel.sortPlayersFromIndex(game)
        // .concat([
        //   PlayerModel.new(0,0)
        //   , PlayerModel.new(1,1)
        //   , PlayerModel.new(2,1)
        //   , PlayerModel.new(3,3)
        //   , PlayerModel.new(4,4)
        //   , PlayerModel.new(5,5)
        //   , PlayerModel.new(6,6)
        // ])
          .map(player => this.renderPlayer(game, player))}
      </ul>
      <div className='flex'/>
      <GameEndTurnButton game={game}/>
    </div>);
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

  renderSpectators() {
    const spectatorsList = this.props.spectatorsList;
    return (spectatorsList.size > 0 && <Tooltip
      overlay={this.renderSpectatorsList()}>
      <span>
        <Badge text={spectatorsList.size}>&nbsp;</Badge>
      </span>
    </Tooltip>)
  }
}

const GameStickerView = connect((state, {game}) => {
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
  }))(GameSticker);

export default GameStickerView