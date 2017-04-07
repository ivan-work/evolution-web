import {Record} from 'immutable';

import jwt from 'jsonwebtoken';
import uuid from 'uuid';

import {ChatModel} from './ChatModel';

export const RulesLoginPassword = {
  login: 'required|string|between:4,12|regex:/^[a-zA-Zа-яА-Я\\d]*$/'
};

export class UserModel extends Record({
  id: null
  , login: null
  , connectionId: null
  , token: null
  , chat: ChatModel.new()
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new UserModel(js)
        .set('chat', ChatModel.fromJS(js.chat));
  }

  static new(login, connectionId) {
    return new UserModel({
      id: uuid.v4()
      , login, connectionId
    }).sign()
  }

  sign() {
    const token = jwt.sign({id: this.id, login: this.login}, process.env.JWT_SECRET);
    return this.set('token', token);
  };

  toOthers() {
    return new UserModel({
      id: this.id
      , login: this.login
    });
  }

  toClient() {
    return this;
  }
}