import {ObjectID} from 'mongodb';
import {Record} from 'immutable';

export class UserRecord extends Record({
  id: null,
  name: null
}) {

}

export function User(name) {
  return new UserRecord({
    id: new ObjectID()
    , name: name
  });
}