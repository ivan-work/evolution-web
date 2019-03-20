import {List} from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import {GameModel, GameModelClient} from '../../../../shared/models/game/GameModel';

import Badge from '@material-ui/core/Badge'
import Tooltip from '../../utils/WhiteTooltip'

import IconPause from '@material-ui/icons/Pause'

import User from '../../utils/User.jsx';
import UsersList from '../../utils/UsersList.jsx';

import {
  roomKickRequest,
  roomBanRequest
} from '../../../../shared/actions/actions';
import {UserAsListItemWithActions} from "../../utils/User";
import Typography from "@material-ui/core/Typography/Typography";

export class PlayersList extends React.PureComponent {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  render() {
    const {game} = this.props;
    return <div className='PlayersList'>
      <Typography variant='h4'
                  style={{display: 'inline-block'}}>
        {T.translate('App.Room.Players')}:
      </Typography>
      {this.renderSpectators()}
      <div className='PlayersListUL'>
        {game.sortPlayersFromIndex(game.players)
          .map(player => this.renderPlayer(game, player))}
      </div>
    </div>
  }

  renderPlayer(game, player) {
    const className = cn({
      Player: true
      , isPlayerTurn: game.isPlayerTurn(player.id)
      , ended: player.ended
    });
    return <div key={player.id} className={className}>
      <User id={player.id}/> {player.getWantsPause() && <IconPause className='Icon'/>}
    </div>
  }

  renderSpectators() {
    const spectatorsList = this.props.spectatorsList;
    return (
      spectatorsList.size > 0 && <Tooltip title={this.renderSpectatorsList()} interactive>
      <span>
        <Badge badgeContent={spectatorsList.size} color='secondary'>&nbsp;</Badge>
      </span>
      </Tooltip>
    )
  }

  renderSpectatorsList() {
    const {isHost, spectatorsList, $Kick, $Ban} = this.props;

    return (<div>
      <Typography variant='h4'>{T.translate('App.Room.Spectators')}</Typography>
      <UsersList list={spectatorsList}>{({user}) => (
        <UserAsListItemWithActions user={user}
                                   userId={null}
                                   isHost={isHost}
                                   roomKickRequest={$Kick}
                                   roomBanRequest={$Ban}/>
      )}</UsersList>
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