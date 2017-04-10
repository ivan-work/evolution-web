import React, {Component} from 'react';
import T from 'i18n-react';
import {Button, Radio, Checkbox} from 'react-mdl';

import MDLForm from '../utils/Form.jsx';
import {RoomModel} from '../../../shared/models/RoomModel';
import {SettingsRules, SETTINGS_TIME_MODIFIER} from '../../../shared/models/game/GameSettings';

const propsToForm = (props) => ({
  name: props.room.name
  , maxPlayers: props.room.settings.maxPlayers
  , timeTurn: props.room.settings.timeTurn / SETTINGS_TIME_MODIFIER
  , timeTraitResponse: props.room.settings.timeTraitResponse / SETTINGS_TIME_MODIFIER
  , halfDeck: props.room.settings.halfDeck
  , addon_timeToFly: props.room.settings.addon_timeToFly
  , addon_continents: props.room.settings.addon_continents
  , addon_bonus: props.room.settings.addon_bonus
  , addon_plantarium: props.room.settings.addon_plantarium
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
  }

  isHost() {
    return this.props.room.users.get(0) === this.props.userId;
  }

  formSubmit(model) {
    this.props.$roomEditSettings(model);
  }

  render() {
    return (<MDLForm
      i18nPath='App.Room.Settings'
      model={propsToForm(this.props)}
      rules={SettingsRules}
      disabled={!this.isHost()}
      onSubmit={this.formSubmit}>
      <div><MDLForm.Textfield name='name'/></div>
      <div><MDLForm.Textfield name='maxPlayers'/></div>
      <div><MDLForm.Textfield name='timeTurn'/></div>
      <div><MDLForm.Textfield name='timeTraitResponse'/></div>
      <div><MDLForm.Checkbox name='halfDeck'/></div>
      <div><MDLForm.Checkbox name='addon_timeToFly'/></div>
      <div>
        <MDLForm.Submit id='RoomSettings$Submit'>
          {T.translate('App.Room.$Edit')}
        </MDLForm.Submit>
      </div>
    </MDLForm>);
  }
}