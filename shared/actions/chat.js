import {loggerChat} from '../utils/logger';
import {to$, server$toRoom, server$toUsers} from './generic';
import moment from 'moment';

import {ChatModel, MessageModel, CHAT_TARGET_TYPE, CHAT_MESSAGE_LENGTH} from '../models/ChatModel';
import ActionCheckError from '../models/ActionCheckError';
import * as ERR from "../errors/ERR";

export const SYSTEM_LOGIN = '0';

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

const chatMessageRequest = (to, toType, text) => ({
  type: 'chatMessageRequest'
  , data: {to, toType, text}
  , meta: {server: true}
});

export const client$chatMessageRequest = (to, toType, text) => (dispatch, getState) => {
  if (text === '/admin') {
    dispatch({type: 'setAdminMode', data: null});
  } else if (text === '/time') {
    const game = getState().game;
    if (game) {
      const time = moment.utc(Date.now() - game.timeCreated).format('HH:mm');

      dispatch(chatMessageRoom(MessageModel.fromJS({
        timestamp: Date.now()
        , to: game.roomId
        , toType: CHAT_TARGET_TYPE.ROOM
        , from: '0'
        , fromLogin: SYSTEM_LOGIN
        , text: 'App.Room.Messages.OutputTime'
        , context: {time}
      })));
    }
  } else {
    dispatch(chatMessageRequest(to, toType, text));
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

export const server$chatMessage = (to, toType, text, from, context) => (dispatch, getState) => {
  const validText = text
    .trim()
    // .replace(CHAT_WHITELIST_REGEX, '')
    .slice(0, CHAT_MESSAGE_LENGTH);

  if (validText.length === 0) {
    throw new ActionCheckError(ERR.APP_USER_CHAT);
  }

  if (validText === '/error') {
    throw new Error('chat error');
  }

  const fromLogin = from === '0' ? SYSTEM_LOGIN
    : getState().getIn(['users', from, 'login'], 'unknown');

  const message = MessageModel.fromJS({
    timestamp: Date.now()
    , to
    , toType
    , from
    , text: validText
    , fromLogin
    , context
  });

  switch (toType) {
    case CHAT_TARGET_TYPE.GLOBAL:
      loggerChat.info(`${message.fromLogin}: ${message.text}`, {});
      dispatch(server$toUsers(chatMessageGlobal(message)));
      break;
    case CHAT_TARGET_TYPE.ROOM:
      const room = getState().getIn(['rooms', to]);
      if (!room) throw new ActionCheckError(ERR.APP_USER_CHAT);
      loggerChat.info(`${message.fromLogin}: ${message.text}`, {room: room.name});
      dispatch(server$toRoom(room.id, chatMessageRoom(message)));
      break;
    case CHAT_TARGET_TYPE.USER:
      loggerChat.info(`${message.fromLogin}: ${message.text}`, {type: toType});
      const user = getState().getIn(['users', to]);
      if (!user) throw new ActionCheckError(ERR.APP_USER_CHAT);
      dispatch(to$({userId: user.id}, chatMessageUser(message)));
      break;
  }
};

/**
 * Client > Server
 * */

export const chatClientToServer = {
  chatMessageRequest: ({to, toType, text}, {userId}) => server$chatMessage(to, toType, text, userId)
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