import React from 'react';
import T from "i18n-react";
import {compose, setPropTypes, withProps} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import PreviewTab from "./PreviewTab";
import IconFood from "@material-ui/icons/Spa";
import {FOCUS_TYPE} from "../GameUIv3";
import Typography from "@material-ui/core/Typography/Typography";
import {enhanceWithChat, ChatMessage} from "../../Chat";
import PropTypes from "prop-types";
import {CHAT_TARGET_TYPE} from "../../../../shared/models/ChatModel";
import {List} from "immutable/dist/immutable";

const styles = theme => ({
  PreviewChat: {
    display: 'flex'
    , alignItems: 'flex-end'
  }
  , PreviewMessageWindow: {
    flex: '1 1 0'
    , minWidth: 0
  }
});

export const PreviewMessageWindow = compose(
  enhanceWithChat
)(({className, messages}) => (
    <div className={className}>
      {messages.map(message => <ChatMessage key={message.timestamp + message.from} message={message} short/>)}
    </div>
  )
);

const PreviewChat = ({classes, game, focusId, focusControls}) => (
  <PreviewTab className={classes.PreviewChat} focusId={focusId} {...focusControls}>
    <PreviewMessageWindow className={classes.PreviewMessageWindow}
                          chatTargetType='ROOM'
                          roomId={game.roomId}
    />
  </PreviewTab>
);
export default compose(
  withStyles(styles)
)(PreviewChat);