import {Record, List} from 'immutable';
import uuid from 'node-uuid';

export class RoomModel extends Record({
  id: null
  , name: null
  , maxSize: 4
  , users: List()
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new RoomModel({
      ...js
      , users: List(js.users)
    });
  }

  static new(userId) {
    const id = uuid.v4().slice(0, 6);
    return new RoomModel({
      id: id
      , name: "Room " + id
      , users: userId ? List.of(userId) : List()
    })
  }
}

RoomModel.MaxSizeError = class MaxSizeError extends Error {
  constructor() {
    super('max_size_reached');
  }
};