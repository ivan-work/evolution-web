import {Record} from 'immutable';
import {TraitDataModel} from './TraitDataModel';

export class TraitModel extends Record({
  type: null
  , targetId: null
  , dataModel: null
}) {
  static new(type, targetId = null) {
    return TraitModel.fromServer({
      type
      , targetId
    });
  }

  static fromServer(js) {
    return js == null
      ? null
      : new TraitModel(js)
        .set('dataModel', TraitDataModel.new(js.type));
  }

  toClient() {
    return this
      .set('dataModel', null);
  }

  toString() {
    return `Trait#${this.type}`;
  }

  equals(other) {
    return this.type === other.type && this.targetId === other.targetId;
  }
}