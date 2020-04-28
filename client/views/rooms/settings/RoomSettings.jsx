import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {compose} from "recompose";
import {connect} from "react-redux";

import Grid from "@material-ui/core/Grid";
import Tooltip from '@material-ui/core/Tooltip';
import Typography from "@material-ui/core/Typography";

import EVOForm, {Textfield, Checkbox, Submit, FormContext} from '../../utils/Form';
import IconCardsTooltip from "./IconCardsTooltip";
import RoomAddonRow from "./RoomAddonRow";
import SetMaxCardCountSlider from "./SetMaxCardCountSlider";
import RoomCardCounter from "./RoomCardCounter";

import {SettingsRules, SETTINGS_MINUTES} from '../../../../shared/models/game/GameSettings';
import {roomEditSettingsRequest} from "../../../../shared/actions/rooms";

const propsToForm = (room) => ({
  name: room.name
  , maxPlayers: room.settings.maxPlayers
  , timeTurn: room.settings.timeTurn / SETTINGS_MINUTES
  , timeTraitResponse: room.settings.timeTraitResponse / SETTINGS_MINUTES
  , randomPlayers: room.settings.randomPlayers
  , halfDeck: room.settings.halfDeck
  , maxCards: room.settings.maxCards
  , maxCardsEnabled: room.settings.maxCards !== null
  , addon_base: true
  , addon_timeToFly: room.settings.addon_timeToFly
  , addon_continents: room.settings.addon_continents
  , addon_bonus: room.settings.addon_bonus
  , addon_plantarium: room.settings.addon_plantarium
});

export class RoomSettings extends React.Component {
  static propTypes = {
    roomId: PropTypes.string.isRequired
  };

  render() {
    const minCards = this.props.room.users.size * 6;
    return (
      <EVOForm
        i18nPath='App.Room.Settings'
        model={propsToForm(this.props.room)}
        rules={SettingsRules}
        disabled={!this.props.isHost}
        onSubmit={this.props.roomEditSettingsRequest}>
        <Textfield name='name' fullWidth={true} />
        <Textfield name='maxPlayers' fullWidth={true} />
        <Textfield name='timeTurn' fullWidth={true} />
        <Textfield name='timeTraitResponse' fullWidth={true} />

        <Checkbox name='randomPlayers' color='primary' />

        <FormContext.Consumer>{({model}) => (
          <RoomCardCounter settings={model} />
        )}</FormContext.Consumer>

        <Grid container alignItems='center' justify='space-between'>
          <Checkbox name='halfDeck' color='primary' />
          <Tooltip title={<Typography>{T.translate('App.Room.Settings.halfDeckHelp')}</Typography>} placement="left">
            <IconCardsTooltip />
          </Tooltip>
        </Grid>

        <SetMaxCardCountSlider minCards={minCards} />

        <hr />

        <RoomAddonRow name='addon_base' disabled />
        <RoomAddonRow name='addon_timeToFly' />
        <RoomAddonRow name='addon_continents' />
        <RoomAddonRow name='addon_bonus' />
        <RoomAddonRow name='addon_plantarium' />

        {/*<FormContext.Consumer>{({model}) => (<pre>{JSON.stringify(model, null, ' ')}</pre>)}</FormContext.Consumer>*/}

        <Submit id='RoomSettings$Submit' variant='contained' color='primary' size='large'>
          {T.translate('App.Room.$Edit')}
        </Submit>
      </EVOForm>
    );
  }
}

export default compose(
  connect(
    (state, {roomId}) => {
      const userId = state.getIn(['user', 'id']);
      const room = state.getIn(['rooms', roomId]);
      return {
        isHost: room.users.get(0) === userId
        , room
      };
    }
    , {roomEditSettingsRequest}
  )
  // , withStyles(styles)
)(RoomSettings);