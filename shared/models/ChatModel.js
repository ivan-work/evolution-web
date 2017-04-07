import {Record, List} from 'immutable';

const CHAT_SIZE = 40;

export const CHAT_TARGET_TYPE = {
  'GLOBAL': 'GLOBAL'
  , 'ROOM': 'ROOM'
  , 'USER': 'USER'
};

export class MessageModel extends Record({
  timestamp: null
  , to: null
  , toType: null
  , from: null
  , fromLogin: null
  , text: null
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new MessageModel(js);
  }
}

export class ChatModel extends Record({
  messages: List()
}) {
  static fromJS(js) {
    return !js
      ? null
      : new ChatModel({
      messages: List(js.messages).map(m => MessageModel.fromJS(m))
    })
  }

  static new() {
    return new ChatModel();
  }

  receiveMessage(message) {
    return this.set('messages', this.messages.takeLast(CHAT_SIZE).push(message));
  }
}