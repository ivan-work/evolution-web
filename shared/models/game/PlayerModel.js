import {Record, List, Map} from 'immutable';
import {UserModel, STATUS} from '../UserModel';
import {CardModel} from './CardModel';
import {AnimalModel} from './evolution/AnimalModel';

export class PlayerModel extends Record({
  id: null
  , hand: List()
  , continent: List()
  , status: STATUS.LOADING
  , index: -1
  , ended: false
}) {
  toOthers() {
    return this
      .set('hand', CardModel.generate(this.hand.size))
      .set('continent', this.continent.map(animalModel => animalModel.toOthers()));
  }

  static fromServer(js) {
    return js == null
      ? null
      : new PlayerModel(js)
        .set('hand', List(js.hand).map(card => CardModel.fromServer(card)))
        .set('continent', List(js.continent).map(animalModel => AnimalModel.fromServer(animalModel)));
  }

  static new(userId, index) {
    return new PlayerModel({id: userId, index})
  }
}