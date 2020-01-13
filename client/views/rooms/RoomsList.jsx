import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import {connect} from 'react-redux';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import IconButton from '@material-ui/core/IconButton';
import IconVisibility from '@material-ui/icons/Visibility'

import {roomJoinRequestSoft, roomSpectateRequestSoft} from '../../../shared/actions/actions';

import {failsChecks} from '../../../shared/actions/checks';
import {
  checkCanJoinRoomToPlay,
  checkCanJoinRoomToSpectate,
  checkUserNotInPlayers
} from '../../../shared/actions/rooms.checks';

export class RoomsList extends React.Component {
  static propTypes = {
    rooms: RIP.listOf(RIP.record).isRequired
    , $roomJoin: PropTypes.func.isRequired
    , $roomSpectate: PropTypes.func.isRequired
  };

  render() {
    const {rooms, userId, $roomJoin, $roomSpectate} = this.props;
    return (
      <List className="RoomsList">
        {rooms.map(room =>
          <ListItem key={room.id}
                    button
                    onClick={() => $roomJoin(room.id)}
                    disabled={!!failsChecks(() => checkCanJoinRoomToPlay(room, userId))}>
            <ListItemText primary={room.name}
                          secondary={`(${room.users.size}/${room.settings.maxPlayers}) ${room.spectators.size > 0 ? `+${room.spectators.size}` : ''}`}/>
            <ListItemSecondaryAction>
              <IconButton name='visibility'
                          color='secondary'
                          disabled={!!failsChecks(() => {
                            checkCanJoinRoomToSpectate(room, userId);
                            checkUserNotInPlayers(room, userId);
                          })}
                          onClick={() => $roomSpectate(room.id)}>
                <IconVisibility/>
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>)}
      </List>
    );
  }
}

export default connect(
  (state) => {
    return {
      room: state.get('room')
      , userId: state.getIn(['user', 'id'])
      , rooms: state.getIn(['rooms'])
      //.filter((room) => !room.gameFinished)
        .toList()
        .sort((r1, r2) => {
          if (r1.gameId && !r2.gameId) return 1;
          if (!r1.gameId && r2.gameId) return -1;
          return r2.timestamp - r1.timestamp;
        })
    }
  }
  , (dispatch) => ({
    $roomJoin: (roomId) => dispatch(roomJoinRequestSoft(roomId))
    , $roomSpectate: (roomId) => dispatch(roomSpectateRequestSoft(roomId))
  })
)(RoomsList);