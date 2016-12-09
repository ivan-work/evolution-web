import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';


export class RoomsList extends React.Component {
  static propTypes = {
    rooms: ImmutablePropTypes.mapOf(ImmutablePropTypes.record, React.PropTypes.string).isRequired
    , onRoomClick: React.PropTypes.func
  };

  static defaultProps = {
    onRoomClick: () => null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    //console.log(this.props.rooms.map((room, roomId) => roomId).valueSeq().toArray())
    return <MDL.List className="RoomsList">
      {this.props.rooms.map((room, roomId) =>
      <MDL.ListItem key={roomId}>
        <span>
          <a href="#" onClick={() => this.props.onRoomClick(roomId)}>
            {room.name}
          </a>
          &nbsp;({room.users.size}/{room.settings.maxPlayers})
        </span>
      </MDL.ListItem>).valueSeq().toArray()}
    </MDL.List>;
  }
}

export default connect(
  (state) => {
    //console.log(state.toJS());
    return {
      username: state.getIn(['user', 'login'], '%USERNAME%')
      , online: state.getIn(['online'], [])
      , room: state.get('room')
      , roomsList: state.getIn(['rooms'], Map()).filter(room => !room.gameId)
    }
  }
  , (dispatch) => ({
    $createRequest: () => dispatch(roomCreateRequest())
    , $joinRequest: (roomId) => dispatch(roomJoinRequest(roomId))
    , $redirectTo: (roomId) => dispatch(redirectTo(`/room/${roomId}`))
  })
)(RoomsList);