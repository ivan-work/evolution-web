import {Record} from 'immutable';
import crypto from 'crypto';

const hash = (str) => crypto.createHash('md5').update(str).digest('hex');

class UserRecord extends Record({
  id: null,
  name: null
}) {

}

export function User(name) {
  return new UserRecord({
    id: hash(name)
    , name: name
  });
}