import React from 'react';
import T from "i18n-react";
import {compose, withProps} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import PreviewTab from "./PreviewTab";
import ContinentPreview from "../continent/ContinentPreview";
import User from "../../utils/User";
import {FOCUS_TYPE} from "../GameUIv3";
import Typography from "@material-ui/core/Typography/Typography";

const styles = theme => ({
  previewPlayer: {
    display: 'flex'
    , flexDirection: 'column'
    , justifyContent: 'space-between'
  }
  , userInfo: {
    textAlign: 'center'
  }
});

const PreviewPlayer = ({classes, player, previewProps}) => (
  <PreviewTab className={classes.previewPlayer} {...previewProps}>
    <ContinentPreview playerId={player.id}/>
    <Typography className={classes.userInfo}>
      <User id={player.id}/>&nbsp;({player.hand.size})
    </Typography>
  </PreviewTab>
);
export default compose(
  withStyles(styles)
  , withProps(({focus, setHoverFocus, setClickFocus, player}) => {
    const focusData = {type: FOCUS_TYPE.PLAYER, data: player.id};
    const isHovered = focus.hover && focus.hover.data === player.id;
    const isSelected = focus.click && focus.click.data === player.id;
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
)(PreviewPlayer);