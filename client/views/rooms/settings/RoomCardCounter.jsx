import React from 'react';
import Typography from "@material-ui/core/Typography";
import T from "i18n-react";
import {getMemoizedCardsTotal} from "./utils-deck";

const memoCardsTotal = getMemoizedCardsTotal();
let prevSettings;
export default ({settings}) => {
  const cardsTotal = memoCardsTotal(settings);
  return (
    <Typography>
      {T.translate('App.Room.Settings.cardCountResult')}:&nbsp;
      {Math.min(settings.maxCards || cardsTotal, cardsTotal)}
    </Typography>
  )
}