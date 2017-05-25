import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {Button, Radio, Checkbox, Tooltip, Icon} from 'react-mdl';

import MDLForm from '../utils/Form.jsx';
import {RoomModel} from '../../../shared/models/RoomModel';
import {Deck_Base, Deck_TimeToFly, Deck_ContinentsShort, Deck_Bonus} from '../../../shared/models/game/GameSettings';
import {SettingsRules, SETTINGS_MINUTES} from '../../../shared/models/game/GameSettings';
import * as cards from '../../../shared/models/game/evolution/cards';

const makeDeckHelp = (deck) => (
  <div>
    {deck.map(([count, cardType], index) => {
      const card = cards[cardType];
      let traits = '';
      if (card.trait1) traits += T.translate('Game.Trait.' + card.trait1);
      if (card.trait2) traits += '/' + T.translate('Game.Trait.' + card.trait2);
      return (<div key={index}>{count}x {traits}</div>)
      })}
  </div>);

const propsToForm = (props) => ({
  name: props.room.name
  , maxPlayers: props.room.settings.maxPlayers
  , timeTurn: props.room.settings.timeTurn / SETTINGS_MINUTES
  , timeTraitResponse: props.room.settings.timeTraitResponse / SETTINGS_MINUTES
  , halfDeck: props.room.settings.halfDeck
  , addon_timeToFly: props.room.settings.addon_timeToFly
  , addon_continents: props.room.settings.addon_continents
  , addon_bonus: props.room.settings.addon_bonus
  , addon_plantarium: props.room.settings.addon_plantarium
});

export default class RoomSettings extends React.Component {
  static propTypes = {
    room: PropTypes.instanceOf(RoomModel)
    , userId: PropTypes.string.isRequired
    , $roomEditSettings: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.formSubmit = this.formSubmit.bind(this);
    this.Deck_Base_help = makeDeckHelp(Deck_Base);
    this.Deck_TimeToFly_help = makeDeckHelp(Deck_TimeToFly);
    this.Deck_ContinentsShort_help = makeDeckHelp(Deck_ContinentsShort);
    this.Deck_Bonus_help = makeDeckHelp(Deck_Bonus);
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
      <div className='flex-row'>
        <Checkbox checked={true}
                      label={T.translate('App.Room.Settings.addon_base')}
                      disabled={true}/>
        <Tooltip label={this.Deck_Base_help} position="left">
          <Icon name="help_outline"/>
        </Tooltip>
      </div>
      <div>
        <MDLForm.Checkbox name='halfDeck'/>
      </div>
      <div className='flex-row'>
        <MDLForm.Checkbox name='addon_timeToFly'/>
        <Tooltip label={this.Deck_TimeToFly_help} position="left">
          <Icon name="help_outline"/>
        </Tooltip>
      </div>
      <div className='flex-row'>
        <MDLForm.Checkbox name='addon_continents'/>
        <Tooltip label={this.Deck_ContinentsShort_help} position="left">
          <Icon name="help_outline"/>
        </Tooltip>
      </div>
      <div className='flex-row'>
        <MDLForm.Checkbox name='addon_bonus'/>
        <Tooltip label={this.Deck_Bonus_help} position="left">
          <Icon name="help_outline"/>
        </Tooltip>
      </div>
      <div>
        <MDLForm.Submit id='RoomSettings$Submit'>
          {T.translate('App.Room.$Edit')}
        </MDLForm.Submit>
      </div>
    </MDLForm>);
  }
}