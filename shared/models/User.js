import {Record} from 'immutable';

export class UserRecord extends Record({
  id: null
  , login: null
  , connectionId: null
}) {
}

export function User(id, login, connectionId) {
  return new UserRecord({
    id: id
    , login: login
    , connectionId: connectionId
  });
}