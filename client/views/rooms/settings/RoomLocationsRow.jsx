import React from "react";
import T from "i18n-react";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import {Checkbox, FormContext} from "../../utils/Form";
import IconCardsTooltip from "./IconCardsTooltip";

import {decksHelper} from "./utils-deck";

// Locations of the "Continents": available with the continents and without the plants and the fan addons
export const isLocationsAvailable = (model) => !!model.addon_continents
  && !model.addon_plantarium
  && !model.addon_customff
  && !model.addon_lifecycle;

export default () => (
  <FormContext.Consumer>{({model}) => {
    const available = isLocationsAvailable(model);
    return (
      <Grid container alignItems='center' justifyContent='space-between' wrap='nowrap' style={{paddingLeft: 24}}>
        <Tooltip title={<Typography>{T.translate('App.Room.Settings.continentsLocationsHelp')}</Typography>}
                 placement='left'>
          <span>
            <Checkbox name='continentsLocations' color='primary' disabled={!available}
                      checked={available && !!model.continentsLocations} />
          </span>
        </Tooltip>
        <Tooltip title={decksHelper.continentsLocations.help} placement="left-end">
          <IconCardsTooltip />
        </Tooltip>
      </Grid>
    );
  }}</FormContext.Consumer>
);
