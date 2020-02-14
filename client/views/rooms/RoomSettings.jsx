import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {compose} from "recompose";
import {connect} from "react-redux";

import Grid from "@material-ui/core/Grid/Grid";
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from "@material-ui/core/styles/withStyles";
import IconCardsTooltip from '@material-ui/icons/HelpOutline';

import EvoCheckbox from "../../components/EvoCheckbox";
import EVOForm, {Textfield, Checkbox, Submit} from '../utils/Form.jsx';

import {RoomModel} from '../../../shared/models/RoomModel';
import {
  Deck_Base,
  Deck_TimeToFly,
  Deck_ContinentsShort,
  Deck_Bonus,
  Deck_Plantarium
} from '../../../shared/models/game/GameSettings';
import {SettingsRules, SETTINGS_MINUTES} from '../../../shared/models/game/GameSettings';
import * as cards from '../../../shared/models/game/evolution/cards';
import {roomEditSettingsRequest} from "../../../shared/actions/rooms";

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

const propsToForm = (room) => ({
  name: room.name
  , maxPlayers: room.settings.maxPlayers
  , timeTurn: room.settings.timeTurn / SETTINGS_MINUTES
  , timeTraitResponse: room.settings.timeTraitResponse / SETTINGS_MINUTES
  , randomPlayers: room.settings.randomPlayers
  , halfDeck: room.settings.halfDeck
  , addon_timeToFly: room.settings.addon_timeToFly
  , addon_continents: room.settings.addon_continents
  , addon_bonus: room.settings.addon_bonus
  , addon_plantarium: room.settings.addon_plantarium
});

const styles = theme => ({});

const RoomAddonRow = ({name, deck, disabled}) => (
  <Grid container alignItems='center' justify='space-between'>
    <Checkbox name={name} color='primary' disabled={disabled}/>
    <Tooltip title={deck} placement="left">
      <IconCardsTooltip/>
    </Tooltip>
  </Grid>
);

export class RoomSettings extends React.Component {
  static propTypes = {
    roomId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.Deck_Base_help = makeDeckHelp(Deck_Base);
    this.Deck_TimeToFly_help = makeDeckHelp(Deck_TimeToFly);
    this.Deck_ContinentsShort_help = makeDeckHelp(Deck_ContinentsShort);
    this.Deck_Bonus_help = makeDeckHelp(Deck_Bonus);
    this.Deck_Plantarium_help = makeDeckHelp(Deck_Plantarium);
  }

  isHost() {
    return this.props.room.users.get(0) === this.props.userId;
  }

  render() {
    return (
      <EVOForm
        i18nPath='App.Room.Settings'
        model={propsToForm(this.props.room)}
        rules={SettingsRules}
        disabled={!this.isHost()}
        onSubmit={this.props.roomEditSettingsRequest}>
        <Textfield name='name' fullWidth={true}/>
        <Textfield name='maxPlayers' fullWidth={true}/>
        <Textfield name='timeTurn' fullWidth={true}/>
        <Textfield name='timeTraitResponse' fullWidth={true}/>

        <Checkbox name='randomPlayers' color='primary'/>

        <Grid container alignItems='center' justify='space-between'>
          <EvoCheckbox checked={true}
                       disabled={true}
                       color='primary'
                       label={T.translate('App.Room.Settings.addon_base')}
          />
          <Tooltip title={this.Deck_Base_help} placement="left">
            <IconCardsTooltip/>
          </Tooltip>
        </Grid>

        <Checkbox name='halfDeck' color='primary'/>

        <RoomAddonRow name='addon_timeToFly' deck={this.Deck_TimeToFly_help}/>
        <RoomAddonRow name='addon_continents' deck={this.Deck_ContinentsShort_help}/>
        <RoomAddonRow name='addon_bonus' deck={this.Deck_Bonus_help}/>
        {this.props.showPlants && <RoomAddonRow name='addon_plantarium' deck={this.Deck_Plantarium_help}/>}

        <Submit id='RoomSettings$Submit' variant='contained' color='primary' size='large'>
          {T.translate('App.Room.$Edit')}
        </Submit>
      </EVOForm>
    );
  }
}

export default compose(
  connect(
    (state, {roomId}) => ({
      userId: state.getIn(['user', 'id'])
      , room: state.getIn(['rooms', roomId])
      , showPlants: state.getIn(['app', 'adminMode']) || state.getIn(['app', 'plantsMode'])
    })
    , {roomEditSettingsRequest}
  )
  , withStyles(styles)
)(RoomSettings);