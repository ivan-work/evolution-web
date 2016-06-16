import {Record, List} from 'immutable';

export class LobbyRecord extends Record({
  id: null
  , name: null
  , maxSize: 4
  , users: List()
}) {
  join(user) {
    if (this.get('users').size == this.maxSize) throw new LobbyRecord.MaxSizeError();
    return this.update('users', (users) => users.push(user));
  }
}

export function Lobby(id, name, maxSize = 4) {
  return new LobbyRecord({
    id: id
    , name: name
    , maxSize: maxSize
  });
}

LobbyRecord.MaxSizeError = class MaxSizeError extends Error {
  constructor() {
    super('max_size_reached');
  }
};