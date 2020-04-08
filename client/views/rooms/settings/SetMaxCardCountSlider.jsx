import React from 'react';
import T from 'i18n-react';

import Grid from "@material-ui/core/Grid/Grid";
import Tooltip from '@material-ui/core/Tooltip';

import EvoCheckbox from "../../../components/EvoCheckbox";
import Slider from '@material-ui/core/Slider'

import {FormContext} from "../../utils/Form";
import Typography from "@material-ui/core/Typography";
import IconCardsTooltip from "./IconCardsTooltip";
import {getMemoizedCardsTotal} from "./utils-deck";

const memoCardsTotal = getMemoizedCardsTotal();

export default ({minCards}) => (
  <FormContext.Consumer>{({model, onChange, disabled}) => {
    const cardsTotal = memoCardsTotal(model);
    return (
      <>
        <Grid container alignItems='center' justify='space-between'>
          <EvoCheckbox
            label={T.translate('App.Room.Settings.maxCardsEnabled')}
            color='primary'
            disabled={disabled}
            onChange={({target}) => {
              const checked = target.checked;
              onChange('maxCardsEnabled', checked);
              const maxCards = checked ? cardsTotal : null;
              onChange('maxCards', maxCards);
            }} />
          <Tooltip title={<Typography>{T.translate('App.Room.Settings.maxCardsEnabledHelp')}</Typography>}
                   placement="left">
            <IconCardsTooltip />
          </Tooltip>
        </Grid>
        {model.maxCardsEnabled && (
          <div className='layout-padding-h-2'>
            <Slider
              min={minCards}
              max={cardsTotal}
              value={model.maxCards}
              onChange={(e, value) => onChange('maxCards', value)}
              disabled={disabled}
            />
          </div>
        )}
      </>
    )
  }}
  </FormContext.Consumer>
);
