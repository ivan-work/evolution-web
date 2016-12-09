import {Record} from 'immutable';

import jwt from 'jsonwebtoken';
import uuid from 'uuid';

export const RulesLoginPassword = {
  login: 'required|string|between:4,12|regex:/^[a-zA-Zа-яА-Я\\d]*$/'
};

export class UserModel extends Record({
  id: null
  , login: null
  , connectionId: null
  , token: null
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new UserModel(js);
  }

  static new(login, connectionId) {
    return new UserModel({
      id: uuid.v4().slice(0, 4)
      , login, connectionId
    }).sign()
  }

  sign() {
    return this.set('token', jwt.sign(this, process.env.JWT_SECRET))
  };

  toOthers() {
    return new UserModel({
      id: this.id
      , login: this.login
      , connectionId: this.connectionId
    });
  }

  toClient() {
    return this;
  }
}