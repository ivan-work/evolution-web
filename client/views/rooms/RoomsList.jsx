import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import RIP from 'react-immutable-proptypes';
import {connect} from 'react-redux';

import {List, ListItem} from 'react-mdl';

import {roomJoinRequest} from '../../../shared/actions/actions';

export class RoomsList extends React.Component {
  static propTypes = {
    rooms: RIP.listOf(RIP.record).isRequired
    , $joinRequest: React.PropTypes.func.isRequired
  };

  static defaultProps = {
    onRoomClick: () => null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {rooms, $joinRequest} = this.props;
    //console.log(this.props.rooms.map((room, roomId) => roomId).valueSeq().toArray())
    return <List className="RoomsList">
      {rooms.map(room =>
      <ListItem key={room.id} disabled={room.gameId !== null}>
        <span>
          <a href="#" onClick={() => $joinRequest(room.id)}>
            {room.name}
          </a>
          &nbsp;({room.users.size}/{room.settings.maxPlayers})
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
    $joinRequest: (roomId) => dispatch(roomJoinRequest(roomId))
  })
)(RoomsList);