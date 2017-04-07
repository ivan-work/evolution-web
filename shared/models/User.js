import {Record} from 'immutable';

export class UserRecord extends Record({
  id: null,
  name: null
}) {
}

export function User(id, name) {
  return new UserRecord({
    id: id
    , name: name
  });
}