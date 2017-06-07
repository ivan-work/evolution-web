import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import {connect} from 'react-redux';

import {List, ListItem, IconButton} from 'react-mdl';

import {roomJoinRequestSoft, roomSpectateRequestSoft} from '../../../shared/actions/actions';
import {PHASE} from '../../../shared/models/game/GameModel';

import {failsChecks} from '../../../shared/actions/checks';
import {checkCanJoinRoomToPlay, checkCanJoinRoomToSpectate, checkUserNotInPlayers} from '../../../shared/actions/rooms.checks';

export class RoomsList extends React.Component {
  static propTypes = {
    rooms: RIP.listOf(RIP.record).isRequired
    , $roomJoin: PropTypes.func.isRequired
    , $roomSpectate: PropTypes.func.isRequired
  };

  static defaultProps = {
    onRoomClick: () => null
  };

  render() {
    const {rooms, userId, $roomJoin, $roomSpectate} = this.props;
    //console.log(this.props.rooms.map((room, roomId) => roomId).valueSeq().toArray())
    return <List className="RoomsList">
      {rooms.map(room =>
      <ListItem key={room.id}>
          <span>
            <a href="#"
               disabled={failsChecks(() => checkCanJoinRoomToPlay(room, userId))}
               onClick={() => $roomJoin(room.id)}>
              {room.name}
            </a>
            &nbsp;({room.users.size}/{room.settings.maxPlayers}) {room.spectators.size > 0 && '+' + room.spectators.size}
            &nbsp;<IconButton name='visibility' colored
                              disabled={failsChecks(() => {
                                checkCanJoinRoomToSpectate(room, userId);
                                checkUserNotInPlayers(room, userId);
                              })}
                              onClick={() => $roomSpectate(room.id)}/>
          </span>
      </ListItem>)}
    </List>;
  }
}

export default connect(
  (state) => {
    //console.log(state.toJS());
    return {
      room: state.get('room')
      , userId: state.getIn(['user', 'id'])
      , rooms: state.getIn(['rooms'])
        //.filter((room) => !room.gameFinished)
        .sort((r1, r2) => {
          if (r1.gameId && !r2.gameId) return 1;
          if (!r1.gameId && r2.gameId) return -1;
          return r2.timestamp - r1.timestamp;
        })
        .toList()
    }
  }
  , (dispatch) => ({
    $roomJoin: (roomId) => dispatch(roomJoinRequestSoft(roomId))
    , $roomSpectate: (roomId) => dispatch(roomSpectateRequestSoft(roomId))
  })
)(RoomsList);