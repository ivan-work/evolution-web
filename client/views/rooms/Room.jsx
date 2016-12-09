import React, {Component} from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';

import {Content, Button, Textfield, Card, CardTitle, CardText} from 'react-mdl';
import {UsersList} from './../UsersList.jsx';
import {Portal} from './../utils/Portal.jsx';
import RoomControlGroup from './RoomControlGroup.jsx';
import {RoomModel} from '../../../shared/models/RoomModel';

import Validator from 'validatorjs';
import {SettingsRules} from '../../../shared/models/game/GameSettings';

import {roomEditSettingsRequest} from '../../../shared/actions/actions';

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
    this.state.form.timeTurn = props.room.settings.timeTurn / 6000;
    this.state.form.timeTraitResponse = props.room.settings.timeTraitResponse / 6000;
    this.state.validation = new Validator(this.state.form, SettingsRules);
  }

  isHost() {
    return this.props.room.users.get(0) === this.props.userId;
  }

  formOnChange(key, target) {
    if (this.isHost()) {
      const form = this.state.form;
      form[key] = target.value;
      const validation = new Validator(form, SettingsRules);
      validation.passes();
      this.setState({form, validation});
    }
  }

  render() {
    const {room, userId} = this.props;
    const {form, validation} = this.state;

    if (!room) return null;

    return (<div className='Room'>
      <Portal target='header'>
        <RoomControlGroup inRoom={true}/>
      </Portal>
      <h1>{T.translate('App.Room.Room')} «{room.name}»</h1>
      <div className='flex-row'>
        <Card className='RoomSettings'>
          <CardText>
            <div>
              <Textfield floatingLabel
                         label={T.translate('App.Room.Settings.name')}
                         value={form.name}
                         error={validation.errors.errors.name}
                         onChange={({target}) => this.formOnChange('name', target)}/>
            </div>
            <div>
              <Textfield floatingLabel
                         label={T.translate('App.Room.Settings.maxPlayers')}
                         value={form.maxPlayers}
                         error={validation.errors.errors.maxPlayers}
                         onChange={({target}) => this.formOnChange('maxPlayers', target)}/>
            </div>
            <div>
              <Textfield floatingLabel
                         label={T.translate('App.Room.Settings.timeTurn')}
                         value={form.timeTurn}
                         error={validation.errors.errors.timeTurn}
                         onChange={({target}) => this.formOnChange('timeTurn', target)}/>
            </div>
            <div>
              <Textfield floatingLabel
                         label={T.translate('App.Room.Settings.timeTraitResponse')}
                         value={form.timeTraitResponse}
                         error={validation.errors.errors.timeTraitResponse}
                         onChange={({target}) => this.formOnChange('timeTraitResponse', target)}/>
            </div>
            <div>
              <Button id='Room$Edit'
                      primary raised
                      disabled={!(this.isHost() && validation.passes())}
                      onClick={() => this.props.$roomEditSettings(this.state.form)}>
                {T.translate('App.Room.$Edit')}
              </Button>
            </div>
          </CardText>
        </Card>
        <Card>
          <CardTitle>{T.translate('App.Room.in_this_room')} ({room.users.size}/{room.settings.maxPlayers}):</CardTitle>
          <CardText>
            <UsersList list={room.users.map(userId => this.props.online.get(userId))}/>
          </CardText>
        </Card>
      </div>
    </div>);
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
  , (dispatch) => ({
    $roomEditSettings: (settings) => dispatch(roomEditSettingsRequest(settings))
  })
)((props) => !props.room ? null : <Room {...props}/>);

export default RoomView;