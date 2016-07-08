import {Record, List} from 'immutable';
import uuid from 'node-uuid';

export class RoomModel extends Record({
  id: null
  , name: null
  , maxSize: 4
  , users: List()
}) {
  static fromJS(js) {
    return new RoomModel({
      ...js
      , users: List(js.users)
    });
  }

  static new(user) {
    const id = uuid.v4().slice(0, 6);
    return new RoomModel({
      id: id
      , name: "Room " + id
      , users: List()
    })
  }
}

RoomModel.MaxSizeError = class MaxSizeError extends Error {
  constructor() {
    super('max_size_reached');
  }
};