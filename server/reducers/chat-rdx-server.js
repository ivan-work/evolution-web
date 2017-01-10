import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';
import {ChatModel} from '../../shared/models/ChatModel';

export const chatMessageGlobal = (chat, {message}) => chat.receiveMessage(message);

export const reducer = createReducer(ChatModel.new(), {
  chatMessageGlobal
});