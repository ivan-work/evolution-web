import React, {Component} from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import * as MDL from 'react-mdl';
import {UsersList} from './../UsersList.jsx';
import {Portal} from './../utils/Portal.jsx';
import {ControlGroup} from './../utils/ControlGroup.jsx';

import {redirectTo} from '../../shared/utils';
import {roomExitRequest, gameCreateRequest} from '../../../shared/actions/actions';
import {RoomModel} from '../../../shared/models/RoomModel';

export class Room extends Component {
  static propTypes = {
    room: React.PropTypes.instanceOf(RoomModel)
    , userId: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.state.form = {};
    this.state.form.name = props.room.name;
    this.state.form.maxPlayers = props.room.settings.maxPlayers;
    this.state.form.timeTurn = props.room.settings.timeTurn;
    this.state.form.timeTraitResponse = props.room.settings.timeTraitResponse;
  }

  formOnChange(key, target) {
    const form = this.state.form;
    form[key] = target.value;
    this.setState({form});
  }

  render() {
    const {room} = this.props;
    const {form} = this.state;

    if (!room) return null;

    return <div className="Room">
      <Portal target='header'>
        <RoomControlGroupView inRoom={true}/>
      </Portal>
      <h1>{T.translate('App.Room.Room')} «{room.name}»</h1>
      <div className="Room-online">
        {T.translate('App.Room.in_this_room')}
        <UsersList list={room.users.map(userId => this.props.online.get(userId))}/>
        <div>
          <MDL.Textfield floatingLabel
                         label={T.translate('App.Room.Settings.name')}
                         value={form.name}
                         onChange={({target}) => this.formOnChange('name', target)}/>
        </div>
        <div>
          <MDL.Textfield floatingLabel
                         label={T.translate('App.Room.Settings.maxPlayers')}
                         value={form.maxPlayers}
                         onChange={({target}) => this.formOnChange('maxPlayers', target)}/>
        </div>
        <div>
          <MDL.Textfield floatingLabel
                         label={T.translate('App.Room.Settings.timeTurn')}
                         value={form.timeTurn}
                         onChange={({target}) => this.formOnChange('timeTurn', target)}/>
        </div>
        <div>
          <MDL.Textfield floatingLabel
                         label={T.translate('App.Room.Settings.timeTraitResponse')}
                         value={form.timeTraitResponse}
                         onChange={({target}) => this.formOnChange('timeTraitResponse', target)}/>
        </div>
        <div>
          <MDL.Button id="Room$Edit"
                      primary raised
                      onClick={() => 0}>
            {T.translate('App.Room.$Edit')}
          </MDL.Button>
        </div>
      </div>
    </div>
      ;
  }
}

export const RoomView = connect(
  (state) => {
    const roomId = state.get('room');
    return {
      room: state.getIn(['rooms', roomId])
      , userId: state.getIn(['user', 'id'])
      , online: state.get('online')
    }
  }
  , (dispatch) => ({})
)(Room);

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
      <MDL.Button id="Room$back" onClick={() => this.back()}>{T.translate('App.Room.$Back')}</MDL.Button>
      <MDL.Button id="Room$exit" onClick={this.props.$exit}>{T.translate('App.Room.$Exit')}</MDL.Button>
      <MDL.Button id="Room$start" onClick={this.props.$start(room.id)}
                  disabled={!room.checkCanStart(userId)}>{T.translate('App.Room.$Start')}</MDL.Button>
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