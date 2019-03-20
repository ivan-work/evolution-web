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

const PreviewFood = ({classes, game, previewProps}) => (
  <PreviewTab className={classes.previewFood} {...previewProps}>
    {Array.from({length: game.food}).map((u, index) => <IconFood key={index} className={classes.food}/>)}
  </PreviewTab>
);
export default compose(
  withStyles(styles)
  , withProps(({focus, setHoverFocus, setClickFocus}) => {
    const focusData = {type: FOCUS_TYPE.FOOD};
    const isHovered = focus.hover && focus.hover.type === FOCUS_TYPE.FOOD;
    const isSelected = focus.click && focus.click.type === FOCUS_TYPE.FOOD;
    return {
      previewProps: {
        setHoverFocus
        , setClickFocus
        , focusData
        , isHovered
        , isSelected
      }
    }
  })
)(PreviewFood);