import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';
import {ChatModel, MessageModel, CHAT_TARGET_TYPE} from '../../shared/models/ChatModel';
import {SYSTEM_LOGIN} from "../../shared/actions/chat";

export const chatMessageGlobal = (chat, {message}) => chat.receiveMessage(message);

let globalChat = ChatModel.new()
  // Message "server started" to global chat
  .receiveMessage(new MessageModel({
    timestamp: Date.now()
    , to: null
    , toType: CHAT_TARGET_TYPE.GLOBAL
    , from: '0'
    , fromLogin: SYSTEM_LOGIN
    , text: 'App.Start'
  }));

export const reducer = createReducer(globalChat, {
  chatMessageGlobal
});