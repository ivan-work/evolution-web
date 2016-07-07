import {Record, List} from 'immutable';

export class RoomModel extends Record({
  id: null
  , name: null
  , maxSize: 4
  , users: List()
}) {
  create(data) {
    //const id =
    return new RoomModel()
  }

  join(user) {
    if (this.get('users').size == this.maxSize) throw new RoomModel.MaxSizeError();
    return this.update('users', (users) => users.push(user));
  }
}

RoomModel.MaxSizeError = class MaxSizeError extends Error {
  constructor() {
    super('max_size_reached');
  }
};