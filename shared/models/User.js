import {Record} from 'immutable';

export class UserRecord extends Record({
  id: null
  , login: null
  , connectionId: null
}) {
  toSecure() {
    return {
      id: this.id
      , login: this.login
      , connectionId: this.connectionId
    }
  }
}

export function User(id, login, connectionId) {
  return new UserRecord({
    id: id
    , login: login
    , connectionId: connectionId
  });
}