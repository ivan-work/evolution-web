import {List} from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Textfield} from 'react-mdl';

import TimeService from '../services/TimeService';

import {MessageModel, CHAT_TARGET_TYPE} from '../../shared/models/ChatModel';
import {chatMessageRequest} from '../../shared/actions/actions';

import './Chat.scss';

export class Chat extends React.Component {
  static propTypes = {
    chatTargetType: React.PropTypes.oneOf([CHAT_TARGET_TYPE.GLOBAL, CHAT_TARGET_TYPE.ROOM]).isRequired
    , roomId: React.PropTypes.string
    // @connect
    , messages: RIP.listOf(React.PropTypes.instanceOf(MessageModel)).isRequired
    , $chatMessage: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.onMessageChange = this.onMessageChange.bind(this);
    this.onMessageSend = this.onMessageSend.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.setupWindow = this.setupWindow.bind(this);
    this.state = {message: '', offset: 0, atBottom: true}
  }

  onMessageChange(message) {
    this.setState({message});
  }

  onMessageSend(e) {
    if (e.keyCode === 13 && this.state.message.trim().length > 0) {
      const {chatTargetType, roomId} = this.props;
      this.props.$chatMessage(roomId, chatTargetType, this.state.message);
      this.setState({message: ''})
    }
  }

  setupWindow(chatWindow) {
    this.chatWindow = chatWindow;
    if (chatWindow) {
      this.chatWindow.addEventListener('scroll', (e) => {
        const target = e.currentTarget;
        // console.log(target.scrollHeight, target.scrollTop, target.offsetHeight)
        this.setState({atBottom: Math.abs(target.scrollHeight - target.scrollTop - target.offsetHeight) < 5});
      });
    }
  }

  componentDidMount() {
    this.componentRendered()
  }

  componentDidUpdate() {
    this.componentRendered()
  }

  componentRendered() {
    if (this.state.atBottom && this.chatWindow) {
      this.chatWindow.scrollTop = this.chatWindow.scrollHeight - this.chatWindow.offsetHeight;
    }
  }

  render() {
    const {messages} = this.props;
    return (<div className='Chat'>
      <div className='ChatWindow' ref={this.setupWindow}>
        {messages.map(this.renderMessage)}
      </div>
      <div className='ChatInput'>
        <Textfield
          label={T.translate('App.Chat.EnterMessage')}
          placeholder={T.translate('App.Chat.EnterMessage')}
          value={this.state.message}
          maxLength={127}
          onChange={({target}) => this.onMessageChange(target.value)}
          onKeyUp={this.onMessageSend}/>
      </div>
    </div>);
  }

  renderMessage({timestamp, from, fromLogin, to, toType, text}) {
    return (<div key={timestamp + from}>
      <div className='ChatTime'>
        <span>[{TimeService.formatTimeOfDay(timestamp)}]</span>
      </div>
      <div className='ChatMessage'>
        <strong>{fromLogin}: </strong>
        <span>{text}</span>
      </div>
    </div>);
  }

  renderMessage({timestamp, from, fromLogin, to, toType, text}) {
    if (from === 0) text = T.translate(text);
    return (<div key={timestamp + from}>
      <div className='ChatTime'>
        <span>[{TimeService.formatTimeOfDay(timestamp)}]</span>
      </div>
      <div className='ChatMessage'>
        <strong>{fromLogin}: </strong>
        <span>{text}</span>
      </div>
    </div>);
  }
}

export default connect((state, props) => {
  let messages = List();
  switch (props.chatTargetType) {
    case CHAT_TARGET_TYPE.GLOBAL:
      messages = state.getIn(['chat', 'messages'], List())
      break;
    case CHAT_TARGET_TYPE.ROOM:
      messages = state.getIn(['rooms', props.roomId, 'chat', 'messages'], List())
      break;
  }
  return {
    messages
  }
}, (dispatch) => ({
  $chatMessage: (...args) => dispatch(chatMessageRequest(...args))
}))(Chat);