import React, {Fragment} from 'react';
import PropTypes from 'prop-types'
import cn from 'classnames';
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import {compose, lifecycle, withProps, withState, withStateHandlers, setPropTypes, withHandlers} from "recompose";
import {connect} from 'react-redux';

import Typography from "@material-ui/core/Typography/Typography";
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button/Button";
import withStyles from "@material-ui/core/styles/withStyles";

import {List} from 'immutable';
import TimeService from '../services/TimeService';

import {CHAT_MESSAGE_LENGTH, CHAT_TARGET_TYPE} from '../../shared/models/ChatModel';
import {chatMessageRequest} from '../../shared/actions/actions';
import GameStyles from "./uiv3/GameStyles";
import IgnoreUnignoreTooltip from "../components/IgnoreUnignoreTooltip";

const styles = theme => ({
  root: {
    display: 'flex'
    , flexDirection: 'column'
    , minHeight: '7em'
    , height: '100%'
  }
  , window: {
    overflowY: 'auto'
    , overflowX: 'hidden'
    , flex: '1 1 0'
    , textAlign: 'left'
  }
  , inputArea: {
    display: 'flex'
  }
  , input: {
    flex: '1 1 0'
  }
});

const messageStyles = theme => ({
  messageRoot: {
    fontSize: '0.85em'
    , display: 'block'
    , lineHeight: '1.2em'
    , '&.short': {
      ...GameStyles.ellipsis
    }
  }
  , messageLogin: {
    fontWeight: 500
    , '.short &': {
      ...GameStyles.ellipsis
      , display: 'inline-block'
      , verticalAlign: 'top'
      , maxWidth: '2em'
      , textOverflow: 'clip'
    }
  }
  , messageTime: {
    fontSize: '12px'
    , color: theme.palette.text.secondary
  }
  , messageText: {
    overflowWrap: 'break-word'
    , wordBreak: 'break-all'
  }
});

export const enhanceWithChat = compose(
  setPropTypes({
    chatTargetType: PropTypes.oneOf(Object.values(CHAT_TARGET_TYPE)).isRequired
    , roomId: PropTypes.string
    , length: PropTypes.number
  })
  , connect((state, {chatTargetType, roomId, length = 100}) => {
    const ignoreList = state.app.get('ignoreList');
    let path = null;
    switch (chatTargetType) {
      case CHAT_TARGET_TYPE.GLOBAL:
        path = ['chat', 'messages'];
        break;
      case CHAT_TARGET_TYPE.ROOM:
        path = ['rooms', roomId, 'chat', 'messages'];
        break;
    }
    return {
      messages: state
        .getIn(path, List())
        .filter(({from}) => !ignoreList.has(from))
        .takeLast(length)
    };
  })
);

export const ChatWindow = compose(
  enhanceWithChat
)(({messages}) => (
  <Fragment>
    {messages.map(message => <ChatMessage key={message.timestamp + message.from} message={message}/>)}
  </Fragment>
));

export const ChatMessage = withStyles(messageStyles)(({classes, message, short}) => {
  const {timestamp, from, fromLogin, to, toType} = message;
  const text = from !== 0 ? message.text : T.translate(message.text, message.context);
  return (
    <Typography className={cn({
      [classes.messageRoot]: true
      , short
    })}>
      <IgnoreUnignoreTooltip userId={from}>
        <span className={classes.messageLogin}>{fromLogin}</span>
      </IgnoreUnignoreTooltip>
      {!short && <span className={classes.messageTime}> [{TimeService.formatHHMM(timestamp)}]</span>}
      <span className={classes.messageText}>: </span>
      <span className={classes.messageText}>{text}</span>
    </Typography>
  );
});

const ChatInput = compose(
  connect(null, (dispatch, {roomId, chatTargetType}) => ({
    sendMessage: (message) => dispatch(chatMessageRequest(roomId, chatTargetType, message))
  }))
  , withStateHandlers({message: ''}, {
    onMessageChange: () => (e) => ({message: e.target.value})
    , onMessageSend: ({message}, {sendMessage}) => (e) => {
      if (e.keyCode === 13 && message.trim().length > 0) {
        sendMessage(message);
        return {message: ''};
      }
    }
  })
)(({className, message, onMessageChange, onMessageSend}) => (
  <TextField className={className}
             placeholder={T.translate('App.Chat.EnterMessage')}
             value={message}
             inputProps={{
               maxLength: CHAT_MESSAGE_LENGTH
             }}
             onChange={onMessageChange}
             autoComplete={'off'}
             onKeyUp={onMessageSend}/>
));

const chatWindowRef = React.createRef();

export const Chat = compose(
  setPropTypes({
    chatTargetType: PropTypes.oneOf([CHAT_TARGET_TYPE.GLOBAL, CHAT_TARGET_TYPE.ROOM]).isRequired
    , roomId: PropTypes.string
  })
  , withStyles(styles)
  , withState('atBottom', 'setAtBottom', true)
  , withProps(({atBottom, setAtBottom}) => {
    return {
      chatWindowRef
      , scrollToBottom: () => {
        const chatWindow = chatWindowRef.current;
        if (chatWindow) {
          chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.offsetHeight;
        }
      }
      , handleScroll: () => {
        const chatWindow = chatWindowRef.current;
        if (chatWindow) {
          const bottom = Math.abs(chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.offsetHeight) < 1;
          if (bottom !== atBottom) {
            setAtBottom(bottom);
          }
        }
      }
    }
  })
  , lifecycle({
    componentDidMount() {
      this.componentRendered(this.props);
    }
    , componentDidUpdate() {
      this.componentRendered(this.props)
    }
    , componentRendered: ({scrollToBottom, atBottom}) => atBottom && scrollToBottom()
  })
)(({classes, roomId, chatTargetType, atBottom, scrollToBottom, chatWindowRef, handleScroll}) => (
  <div className={classes.root}>
    <div className={classes.window} ref={chatWindowRef} onScroll={handleScroll}>
      <ChatWindow {...{roomId, chatTargetType}}/>
    </div>
    <div className={classes.inputArea}>
      <ChatInput className={classes.input} roomId={roomId} chatTargetType={chatTargetType}/>
      {!atBottom && <Button size="small" variant='text' onClick={scrollToBottom}>v</Button>}
    </div>
  </div>
));

export default Chat;