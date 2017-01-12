import React from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import RIP from 'react-immutable-proptypes';
import {connect} from 'react-redux';

import {List, ListItem} from 'react-mdl';

import {roomJoinRequestSoft, roomSpectateRequestSoft} from '../../../shared/actions/actions';

export class RoomsList extends React.Component {
  static propTypes = {
    rooms: RIP.listOf(RIP.record).isRequired
    , $roomJoin: React.PropTypes.func.isRequired
    , $roomSpectate: React.PropTypes.func.isRequired
  };

  static defaultProps = {
    onRoomClick: () => null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {rooms, $roomJoin, $roomSpectate} = this.props;
    //console.log(this.props.rooms.map((room, roomId) => roomId).valueSeq().toArray())
    return <List className="RoomsList">
      {rooms.map(room =>
      <ListItem key={room.id}>
        <span>
          <a disabled={room.gameId !== null} href="#" onClick={() => $roomJoin(room.id)}>{room.name}</a>
          (<a href="#" onClick={() => $roomSpectate(room.id)}>{T.translate('App.Rooms.$Watch')}</a>)
          &nbsp;({room.users.size}/{room.settings.maxPlayers}) {room.spectators.size > 0 && '+' + room.spectators.size}
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
      , rooms: state.getIn(['rooms'])
        .sort((r1, r2) => r1.gameId !== null)
        .toList()
    }
  }
  , (dispatch) => ({
    $roomJoin: (roomId) => dispatch(roomJoinRequestSoft(roomId))
    , $roomSpectate: (roomId) => dispatch(roomSpectateRequestSoft(roomId))
  })
)(RoomsList);