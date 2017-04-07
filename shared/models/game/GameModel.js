import {Record, List, Map} from 'immutable';

import {UserModel} from './UserModel';

import uuid from 'node-uuid';

export class GameModel extends Record({
  id: null
  , roomId: null
  , deck: null
  , players: List()
  , field: Map()
}) {
  static selectNew(store, roomId) {
    const room = store.getState().getIn('rooms', roomId);
    const users = room.users.map(userId => store.get('users').get(userId));
    return GameModel.new(room, users);
  }

  static new(room, users) {
    return new GameModel({
      id: uuid.v4()
      , roomId: room.id
      , deck: DeckModel.new()
      , players: users.map(user => new UserModel(user))
    })
  }
}