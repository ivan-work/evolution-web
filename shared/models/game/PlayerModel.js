import {Record, List, Map} from 'immutable';
import {UserModel} from '../UserModel';

export const STATE_LOADING = 0;
export const STATE_READY = 1;

export class PlayerModel extends Record({
  id: null
  , hand: List()
  , status: STATE_LOADING
}) {
  static fromJS(js) {
    return js == null
      ? null
      : new PlayerModel({
      ...js
      , hand: List(js.hand)
    });
  }
  static new(userId) {
    return new PlayerModel({id: userId})
  }
}