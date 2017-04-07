import React, {Component} from 'react';
import T from 'i18n-react';
import {Button, Textfield, Checkbox} from 'react-mdl';

import {RoomModel} from '../../../shared/models/RoomModel';
import Validator from 'validatorjs';
import {SettingsRules, SETTINGS_TIME_MODIFIER} from '../../../shared/models/game/GameSettings';

const INITIAL_STATE = (props) => ({
  form: {
    name: props.room.name
    , maxPlayers: props.room.settings.maxPlayers
    , timeTurn: props.room.settings.timeTurn / SETTINGS_TIME_MODIFIER
    , timeTraitResponse: props.room.settings.timeTraitResponse / SETTINGS_TIME_MODIFIER
  }
});

export default class RoomSettings extends Component {
  static propTypes = {
    room: React.PropTypes.instanceOf(RoomModel)
    , userId: React.PropTypes.string.isRequired
    , $roomEditSettings: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.formSubmit = this.formSubmit.bind(this);
    this.state = INITIAL_STATE(props);
    this.state.validation = new Validator(this.state.form, SettingsRules);
  }

  componentWillReceiveProps(props) {
    this.setState(INITIAL_STATE(props));
  }

  isHost() {
    return this.props.room.users.get(0) === this.props.userId;
  }

  formOnChange(key, target) {
    if (this.isHost()) {
      const form = this.state.form;
      form.dirty = true;
      form[key] = target.value;
      const validation = new Validator(form, SettingsRules);
      validation.passes();
      this.setState({form, validation});
    }
  }

  formSubmit() {
    const {$roomEditSettings} = this.props;
    const form = this.state.form;
    delete form.dirty;
    this.setState({form});
    $roomEditSettings(form);
  }

  render() {
    const {form, validation} = this.state;
    return (<div>
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
                disabled={!(this.isHost() && validation.passes() && form.dirty)}
                onClick={this.formSubmit}>
          {T.translate('App.Room.$Edit')}
        </Button>
      </div>
    </div>);
  }
}