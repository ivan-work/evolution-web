import {Record} from 'immutable';

import jwt from 'jsonwebtoken';
//console.log('process.env.APP_ENV' + process.env.APP_ENV);
//if (process.env.APP_ENV == 'browser') {
//} else {
//  const jwt = require('jsonwebtoken');
//}

export class UserModel extends Record({
  id: null
  , login: null
  , connectionId: null
  , token: null
}) {
  new(login, data) {
    (process.env.TEST ? uuid.v4().substr(0, 4) : uuid.v4())
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
}