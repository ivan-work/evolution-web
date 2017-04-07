import {ObjectID} from 'mongodb';
import {Record, List} from 'immutable';

export class LobbyRecord extends Record({
  id: null
  , name: null
  , maxSize: 4
  , users: List()
}) {
  join(user) {
    if (this.get('users').size == this.maxSize) throw new Lobby.MaxSizeError();
    return this.update('users', (users) => users.push(user));
  }
}

export function Lobby(name, maxSize = 4) {
  return new LobbyRecord({
    id: new ObjectID()
    , name: name
    , maxSize: maxSize
  });
}

Lobby.MaxSizeError = class MaxSizeError extends Error {
  constructor() {
    super('max_size_reached');
  }
};