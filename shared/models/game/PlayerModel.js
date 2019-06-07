import {Record, List, OrderedMap} from 'immutable';
import {CardModel} from './CardModel';
import {AnimalModel} from './evolution/AnimalModel';

/**
 * @class PlayerModel
 * @property {string} id - an ID.
 */
export class PlayerModel extends Record({
  id: null
  , hand: List()
  , continent: OrderedMap()
  , index: -1
  , playing: true // Has he active in the game
  , ended: false // Has he ended a phase
  , acted: false // Has he acted in a phase
  , timedOut: false // Has he ended his turn via timeout
  , wantsPause: false // Does he want a pause
  , scoreDead: 0
}) {
  getWantsPause() {
    return this.wantsPause || this.timedOut;
  }

  toOthers() {
    return this
      .update('hand', hand => hand.map((card) => card.toOthers()))
      .update('continent', continent => continent.map(animal => animal.toOthers()));
  }

  toClient() {
    return this
      .update('hand', hand => hand.map((card) => card.toClient()))
      .update('continent', continent => continent.map(animal => animal.toClient()).entrySeq());
  }

  static fromServer(js) {
    return js == null
      ? null
      : new PlayerModel(js)
        .set('hand', List(js.hand).map(card => CardModel.fromServer(card)))
        .set('continent', OrderedMap(js.continent).map(AnimalModel.fromServer));
  }

  static new(userId, index) {
    return new PlayerModel({id: userId, index})
  }

  countScore() {
    return this.continent.reduce((score, animal) => {
      return score + animal.countScore()
    }, 0);
  }

  getCard(index) {
    return this.hand.get(index);
  }

  findCard(id) {
    return this.hand.find(card => card.id === id);
  }

  /**
   * This callback is displayed as a global member.
   * @callback PlayerModel.someAnimalCallback
   * @param {AnimalModel} animal
   * @param {Continent} continent
   * @param {PlayerModel} player
   */

  /**
   * @param {PlayerModel.someAnimalCallback} cb
   */
  someAnimal(cb) {
    return this.continent.some(animal => cb(animal, null, this));
  }

  debugAnimals() {
    return this.continent.map(a => a.toString()).toArray();
  }
}