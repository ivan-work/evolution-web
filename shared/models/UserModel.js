import {Record} from 'immutable';

import jwt from 'jsonwebtoken';
import uuid from 'uuid';

import {ChatModel} from './ChatModel';

export const RuleGuestUserName = 'required|string|between:4,12|regex:/^[a-zA-Zа-яА-Я\\d \-_]+$/';
export const RuleRegisteredUserName = 'required|string|between:4,20|regex:/^[0-9a-zA-Zа-яА-Я\\d \-_]+$/';

export const RulesLoginPassword = {
  login: RuleGuestUserName
};

export class UserModel extends Record({
  id: null
  , login: null
  , connectionId: null
  , token: null
  , authType: null
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