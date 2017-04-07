import {Record} from 'immutable';

export class UserRecord extends Record({
  id: null
  , login: null
  , connectionId: null
}) {
  toSecure() {
    return new UserRecord({
      id: this.id
      , login: this.login
      , connectionId: this.connectionId
    });
  }
}