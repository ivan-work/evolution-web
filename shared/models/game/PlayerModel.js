import {Record, List, Map} from 'immutable';
import {UserModel} from '../UserModel';

export const STATE_LOADING = 0;
export const STATE_READY = 1;

export class PlayerModel extends Record({
  id: null
  , hand: List()
  , status: STATE_LOADING
}) {
  toClient() {
    return this
      .set('hand', this.hand.size);
  }

  static fromServer(js) {
    return js == null
      ? null
      : new PlayerModel(js);
  }

  static new(userId) {
    return new PlayerModel({id: userId})
  }
}