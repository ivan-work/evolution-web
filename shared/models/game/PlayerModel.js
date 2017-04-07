import {Record, List, Map} from 'immutable';
import {UserModel} from '../UserModel';


export class PlayerModel extends Record({
  id: null
  , hand: List()
}) {
  static new(userId) {
    return new PlayerModel({id: userId})
  }
}