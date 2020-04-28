import React from "react";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";

import {Checkbox} from "../../utils/Form";
import IconCardsTooltip from "./IconCardsTooltip";

import {decksHelper} from "./utils-deck";

export default ({name, disabled}) => (
  <Grid container alignItems='center' justify='space-between'>
    <Checkbox name={name} color='primary' disabled={disabled} />
    <Tooltip title={decksHelper[name].help} placement="left">
      <IconCardsTooltip />
    </Tooltip>
  </Grid>
);