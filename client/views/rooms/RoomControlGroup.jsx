import React, {Component} from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {ControlGroup} from './../utils/ControlGroup.jsx';
import {Button} from 'react-mdl';
import {RoomModel} from '../../../shared/models/RoomModel';

import {redirectTo} from '../../../shared/utils';
import {roomExitRequest, gameCreateRequest} from '../../../shared/actions/actions';

/*
 * RoomControlGroup
 * */

export class RoomControlGroup extends Component {
  static propTypes = {
    room: React.PropTypes.instanceOf(RoomModel)
    , userId: React.PropTypes.string.isRequired
    , inRoom: React.PropTypes.bool
  };

  back() {
    const {room, userId, inRoom} = this.props;
    this.props.$redirectTo(inRoom ? '/' : '/room/' + room.id)
  }

  render() {
    const {room, userId, inRoom} = this.props;

    if (!room) return null;

    return <ControlGroup name={T.translate('App.Room.Room')}>
      <Button id="Room$Back" onClick={() => this.back()}>{T.translate('App.Room.$Back')}</Button>
      <Button id="Room$Exit" onClick={this.props.$exit}>{T.translate('App.Room.$Exit')}</Button>
      <Button id="Room$Start" onClick={this.props.$start(room.id)}
              disabled={!room.checkCanStart(userId)}>{T.translate('App.Room.$Start')}</Button>
    </ControlGroup>
  }
}

export const RoomControlGroupView = connect(
  (state) => {
    const roomId = state.get('room');
    return {
      room: state.getIn(['rooms', roomId])
      , userId: state.getIn(['user', 'id'])
      , lang: state.getIn(['app', 'lang'])
    }
  }
  , (dispatch) => ({
    $redirectTo: (location) => dispatch(redirectTo(location))
    , $exit: () => dispatch(roomExitRequest())
    , $start: roomId => () => dispatch(gameCreateRequest(roomId))
  })
)(RoomControlGroup);

export default RoomControlGroupView;