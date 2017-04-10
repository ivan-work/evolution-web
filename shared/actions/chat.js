import {loggerChat} from '~/shared/utils/logger';
import {to$} from './generic';

import {ChatModel, MessageModel, CHAT_TARGET_TYPE} from '../models/ChatModel';
import {ActionCheckError} from '../models/ActionCheckError';

const CHAT_WHITELIST_REGEX = /[^\wа-яА-ЯёЁ\d\s\?!\.,\(\):]/gmi;
/**
 * Init
 * */

export const chatInit = (globalChat) => ({
  type: 'chatInit'
  , data: {globalChat}
});

/**
 * Message
 * */

export const chatMessageRequest = (to, toType, text) => (dispatch) => {
  if (text === '/admin') {
    dispatch({type: 'appShowAdminPanel', data: null});
  } else {
    dispatch({
      type: 'chatMessageRequest'
      , data: {to, toType, text}
      , meta: {server: true}
    });
  }
};

const chatMessageGlobal = (message) => ({
  type: 'chatMessageGlobal'
  , data: {message}
});

const chatMessageRoom = (message) => ({
  type: 'chatMessageRoom'
  , data: {message}
});

const chatMessageUser = (message) => ({
  type: 'chatMessageUser'
  , data: {message}
});

/**
 * Client > Server
 * */

export const chatClientToServer = {
  chatMessageRequest: ({to, toType, text}, {userId}) => (dispatch, getState) => {
    const validText = text
      .trim()
      // .replace(CHAT_WHITELIST_REGEX, '')
      .slice(0, 127);
    if (validText.length === 0) {
      throw new ActionCheckError('chatMessageRequest not valid');
    }
    const message = MessageModel.fromJS({
      timestamp: Date.now(), to, toType, from: userId, text: validText
      , fromLogin: getState().getIn(['users', userId, 'login'], 'unknown')
    });
    switch (toType) {
      case CHAT_TARGET_TYPE.GLOBAL:
        loggerChat.info(`${message.fromLogin}: ${message.text}`, {});
        dispatch(to$({users: true}, chatMessageGlobal(message)));
        break;
      case CHAT_TARGET_TYPE.ROOM:
        const room = getState().getIn(['rooms', to]);
        if (!room) throw new ActionCheckError('chatMessageRequest', 'Invalid parameters');
        loggerChat.info(`${message.fromLogin}: ${message.text}`, {room: room.name});
        dispatch(to$({users: room.users.concat(room.spectators).toArray()}, chatMessageRoom(message)));
        break;
      case CHAT_TARGET_TYPE.USER:
        loggerChat.info(`${message.fromLogin}: ${message.text}`, {type: toType});
        const user = getState().getIn(['users', to]);
        if (!user) throw new ActionCheckError('chatMessageRequest', 'User offline');
        dispatch(to$({userId: user.id}, chatMessageUser(message)));
        break;
    }
  }
};

/**
 * Server > Client
 * */

export const chatServerToClient = {
  chatInit: ({globalChat}) => chatInit(ChatModel.fromJS(globalChat))
  , chatMessageGlobal: ({message}) => chatMessageGlobal(MessageModel.fromJS(message))
  , chatMessageRoom: ({message}) => chatMessageRoom(MessageModel.fromJS(message))
  , chatMessageUser: ({message}) => chatMessageUser(MessageModel.fromJS(message))
};