import React from 'react';
import T from "i18n-react";
import {compose, withProps} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import PreviewTab from "./PreviewTab";
import IconFood from "@material-ui/icons/Spa";
import {FOCUS_TYPE} from "../GameUIv3";

const styles = theme => ({
  previewFood: {
    display: 'flex'
    , flexDirection: 'row'
    , flexWrap: 'wrap'
  }
  , food: {}
});

const PreviewFood = ({classes, game, focusId, focusControls}) => (
  <PreviewTab className={classes.previewFood} focusId={focusId} {...focusControls}>
    {Array.from({length: game.getFood()}).map((u, index) => <IconFood key={index} className={classes.food}/>)}
  </PreviewTab>
);
export default compose(
  withStyles(styles)
)(PreviewFood);