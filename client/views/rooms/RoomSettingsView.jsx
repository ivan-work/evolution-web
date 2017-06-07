import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {Button, Radio, Checkbox, Tooltip, Icon} from 'react-mdl';
import {SettingsRecord, SettingsRules} from '../../../shared/models/game/GameSettings';


const propsToForm = (props) => ({
  maxPlayers: props.room.settings.maxPlayers
  , timeTurn: props.room.settings.timeTurn / SETTINGS_MINUTES
  , timeTraitResponse: props.room.settings.timeTraitResponse / SETTINGS_MINUTES
  , randomPlayers: props.room.settings.randomPlayers
  , halfDeck: props.room.settings.halfDeck
  , addon_timeToFly: props.room.settings.addon_timeToFly
  , addon_continents: props.room.settings.addon_continents
  , addon_bonus: props.room.settings.addon_bonus
  , addon_plantarium: props.room.settings.addon_plantarium
});

export default class RoomSettingsView extends React.Component {
  static propTypes = {
    settings: PropTypes.instanceOf(SettingsRecord)
  };

  render() {
    const {settings} = this.props;
    return (<div>
      {/*{settings*/}
        {/*.map((value, key) => {*/}
          {/*const type = !!SettingsRules[key] && SettingsRules[key].split('|')[0];*/}
          {/*if (type) {*/}
            {/*return <div key={key}>{this.renderSetting(key, value, type)}</div>*/}
          {/*} else {*/}
            {/*return null;*/}
          {/*}*/}
        {/*})*/}
        {/*.filter(x => !!x)*/}
        {/*.toArray()*/}
      {/*}*/}
    </div>);
  }

  renderSetting(key, value, type) {
    switch (type) {
      case 'integer':
        return <div key={key}>
          <span>{key}</span>
          <span>{T.translate(`App.Room.Settings.${key}`)}:</span>
          <span>{value}</span>
        </div>;
        break;
      case 'numeric':
        return <div key={key}>
          <span>{key}</span>
          <span>{T.translate(`App.Room.Settings.${key}`)}:</span>
          <span>{value}</span>
        </div>;
        break;
      default:
        return null;
    }
  }
}