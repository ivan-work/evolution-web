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

import {SettingsRules, SETTINGS_MINUTES, SETTINGS_SECONDS} from '../../../../shared/models/game/GameSettings';
import {roomEditSettingsRequest} from "../../../../shared/actions/rooms";
import {loadJSONValue, saveValue} from "../../../utils/localStorage";
import {RoomModel} from "../../../../shared/models/RoomModel";

const STORED_SETTINGS_KEY = 'storedRoomSettings';
const STORED_SETTINGS_VERSION = 1;

const propsToForm = (room) => ({
  name: room.name
  , maxPlayers: room.settings.maxPlayers
  , timeTurn: room.settings.timeTurn / SETTINGS_SECONDS
  , timeTraitResponse: room.settings.timeTraitResponse / SETTINGS_SECONDS
  , randomPlayers: room.settings.randomPlayers
  , halfDeck: room.settings.halfDeck
  , maxCards: room.settings.maxCards
  , maxCardsEnabled: room.settings.maxCards !== null
  , addon_base: true
  , addon_base2: room.settings.addon_base2
  , addon_timeToFly: room.settings.addon_timeToFly
  , addon_continents: room.settings.addon_continents
  , addon_bonus: room.settings.addon_bonus
  , addon_plantarium: room.settings.addon_plantarium
  , addon_customff: room.settings.addon_customff
  , addon_lifecycle: room.settings.addon_lifecycle
  , _savedSettingsVersion: STORED_SETTINGS_VERSION
});

const loadStoredRoomSettings = () => {
  const savedRoomSettings = loadJSONValue(STORED_SETTINGS_KEY, {});
  if (savedRoomSettings?._savedSettingsVersion !== STORED_SETTINGS_VERSION) {
    return {};
  }
  return savedRoomSettings;
}

export class RoomSettings extends React.Component {
  static propTypes = {
    roomId: PropTypes.string.isRequired,
    room: PropTypes.instanceOf(RoomModel).isRequired,
    roomEditSettingsRequest: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const storedRoomSettings = loadStoredRoomSettings();
    const currentSettings = propsToForm(props.room);
    const settings = Object.assign({}, currentSettings, storedRoomSettings);
    this.state = {
      settings
    };
  }

  onSubmit = (model) => {
    saveValue(STORED_SETTINGS_KEY, model)
    this.props.roomEditSettingsRequest(model);
  }

  componentDidMount() {
    if (this.props.isHost) {
      this.props.roomEditSettingsRequest(this.state.settings);
    }
  }

  render() {
    const {isHost, room} = this.props;
    const minCards = room.users.size * 6;
    const formModel = isHost ? this.state.settings : propsToForm(room)
    return (
      <EVOForm
        i18nPath='App.Room.Settings'
        model={formModel}
        rules={SettingsRules}
        disabled={!isHost}
        onSubmit={this.onSubmit}>
        <Textfield name='name' fullWidth={true}/>
        <Textfield name='maxPlayers' fullWidth={true}/>
        <Textfield name='timeTurn' fullWidth={true}/>
        <Textfield name='timeTraitResponse' fullWidth={true}/>

        <Checkbox name='randomPlayers' color='primary'/>

        <FormContext.Consumer>{({model}) => (
          <RoomCardCounter settings={model}/>
        )}</FormContext.Consumer>

        <Grid container alignItems='center' justifyContent='space-between'>
          <Checkbox name='halfDeck' color='primary'/>
          <Tooltip title={<Typography>{T.translate('App.Room.Settings.halfDeckHelp')}</Typography>} placement="left">
            <IconCardsTooltip/>
          </Tooltip>
        </Grid>

        <SetMaxCardCountSlider minCards={minCards}/>

        <hr/>

        <RoomAddonRow name='addon_base' disabled/>
        <RoomAddonRow name='addon_base2'/>
        <RoomAddonRow name='addon_timeToFly'/>
        <RoomAddonRow name='addon_continents'/>
        <RoomAddonRow name='addon_bonus'/>
        <RoomAddonRow name='addon_plantarium'/>
        <RoomAddonRow name='addon_customff'/>
        <RoomAddonRow name='addon_lifecycle'/>

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