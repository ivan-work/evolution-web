import React from 'react';
import T from "i18n-react";

import {connect} from "react-redux";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListSubheader from "@material-ui/core/ListSubheader";
import Tooltip from "@material-ui/core/Tooltip";
import IconMigration from '@material-ui/icons/SwapHoriz';

import {LocationIcon} from "./LocationsStyles";

import {PHASE} from "../../../../shared/models/game/GameModel";
import {getMigration} from "../../../../shared/models/game/evolution/locations";
import {getMigrationTargets} from "../../../../shared/actions/locations.checks";
import {traitMigrationRequest} from "../../../../shared/actions/game.locations";

const stopEvent = e => e.stopPropagation();

// TraitMigration (or TraitFlight): moves the animal to another location instead of food and traits in the round
export const MigrationButton = ({targets, onMigrate}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  if (targets.length === 0) return null;
  const open = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);
  const migrate = (location) => (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    onMigrate(location);
  };
  return (
    <span onClick={stopEvent}>
      <Tooltip title={T.translate('Game.UI.Locations.Migrate')}>
        <IconButton size='small' color='primary' className='MigrationButton' onClick={open}>
          <IconMigration fontSize='small' />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted={false} open={!!anchorEl} onClose={close}>
        <ListSubheader disableSticky>{T.translate('Game.UI.Locations.MigrateTo')}</ListSubheader>
        {targets.map(location => (
          <MenuItem key={location} onClick={migrate(location)}>
            <ListItemIcon><LocationIcon location={location} /></ListItemIcon>
            {T.translate('Game.Location.' + location)}
          </MenuItem>
        ))}
      </Menu>
    </span>
  );
};

export default connect(({game}, {animal}) => {
  const canMigrate = (
    game.userId === animal.ownerId
    && game.status.phase === PHASE.FEEDING
    && game.isPlayerTurn()
    && !game.question
    && !getMigration(game)
  );
  return {
    targets: canMigrate ? getMigrationTargets(game, animal) : []
  }
}, (dispatch, {animal}) => ({
  onMigrate: (location) => dispatch(traitMigrationRequest(animal.id, location))
}))(MigrationButton);
