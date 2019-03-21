import React, {Fragment} from 'react';
import PropTypes from 'prop-types'
import cn from 'classnames';
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import {compose, lifecycle, withProps, withState, withStateHandlers, setPropTypes} from "recompose";
import {connect} from 'react-redux';

import Typography from "@material-ui/core/Typography/Typography";
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button/Button";
import withStyles from "@material-ui/core/styles/withStyles";

import {List} from 'immutable';
import TimeService from '../services/TimeService';

import {CHAT_TARGET_TYPE} from '../../shared/models/ChatModel';
import {chatMessageRequest} from '../../shared/actions/actions';
import GameStyles from "./uiv3/GameStyles";

const styles = theme => ({
  root: {
    display: 'flex'
    , flexDirection: 'column'
    , minHeight: '10em'
    , height: '100%'
  }
  , window: {
    overflowY: 'auto'
    , overflowX: 'none'
    , flex: '1 1 0'
    , textAlign: 'left'
  }
  , input: {
    width: '100%'
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
    wordBreak: 'break-all'
  }
});

export const enhanceWithChat = compose(
  setPropTypes({
    chatTargetType: PropTypes.oneOf(Object.values(CHAT_TARGET_TYPE)).isRequired
    , roomId: PropTypes.string
  })
  , connect((state, {chatTargetType, roomId}) => {
    let path = null;
    switch (chatTargetType) {
      case CHAT_TARGET_TYPE.GLOBAL:
        path = ['chat', 'messages'];
        break;
      case CHAT_TARGET_TYPE.ROOM:
        path = ['rooms', roomId, 'chat', 'messages'];
        break;
    }
    return {messages: state.getIn(path, List())}
  })
);

export const ChatWindow = compose(
  enhanceWithChat
  , withState('atBottom', 'setAtBottom', true)
  , withProps(({atBottom, setAtBottom}) => {
    const chatWindowRef = React.createRef();
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
)(({className, chatWindowRef, messages, atBottom, scrollToBottom, handleScroll}) => {
  return (<Fragment>
    {!atBottom && <Button size="small"
                          onClick={scrollToBottom}>v</Button>}
    <div className={className} ref={chatWindowRef} onScroll={handleScroll}>
      {messages.map(message => <ChatMessage key={message.timestamp + message.from} message={message}/>)}
    </div>
  </Fragment>)
});

export const ChatMessage = withStyles(messageStyles)(({classes, message, short}) => {
  const {timestamp, from, fromLogin, to, toType} = message;
  const text = from !== 0 ? message.text : T.translate(message.text);
  return (
    <Typography className={cn({
      [classes.messageRoot]: true
      , short
    })}>
      <span className={classes.messageLogin}>{fromLogin}</span>
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
             maxLength={255}
             onChange={onMessageChange}
             autoComplete={'off'}
             onKeyUp={onMessageSend}/>
));


export const Chat = ({classes, roomId, chatTargetType}) => (
  <div className={classes.root}>
    <ChatWindow className={classes.window} roomId={roomId} chatTargetType={chatTargetType}/>
    <ChatInput className={classes.input} roomId={roomId} chatTargetType={chatTargetType}/>
  </div>
);

Chat.propTypes = {
  chatTargetType: PropTypes.oneOf([CHAT_TARGET_TYPE.GLOBAL, CHAT_TARGET_TYPE.ROOM]).isRequired
  , roomId: PropTypes.string
};

export default compose(withStyles(styles))(Chat);