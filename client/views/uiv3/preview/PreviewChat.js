import React from 'react';
import T from "i18n-react";
import {compose, withProps} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import PreviewTab from "./PreviewTab";
import IconFood from "@material-ui/icons/Spa";
import {FOCUS_TYPE} from "../GameUIv3";
import Typography from "@material-ui/core/Typography/Typography";
import Chat from "../../Chat";

const styles = theme => ({
  PreviewChat: {
    display: 'flex'
    , flexDirection: 'row'
    , flexWrap: 'wrap'
  }
  , food: {}
});

const PreviewChat = ({classes, game, previewProps}) => (
  <PreviewTab className={classes.PreviewChat} {...previewProps}>
    <Typography>CHAT</Typography>
    {/*<Chat chatTargetType='ROOM' roomId={game.roomId}/>*/}
  </PreviewTab>
);
export default compose(
  withStyles(styles)
  , withProps(({focus, setHoverFocus, setClickFocus}) => {
    const focusData = {type: FOCUS_TYPE.CHAT};
    const isHovered = focus.hover && focus.hover.type === FOCUS_TYPE.CHAT;
    const isSelected = focus.click && focus.click.type === FOCUS_TYPE.CHAT;
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
)(PreviewChat);