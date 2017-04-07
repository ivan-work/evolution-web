import {Record} from 'immutable';
import {TraitDataModel} from './TraitDataModel';
import * as traitData from './traitData'

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

  static parse(string) {
    const traitKey = Object.keys(traitData)
      .find(traitKey => ~traitData[traitKey].type
        .toLowerCase().indexOf(string.toLowerCase()));
    return TraitModel.new(traitKey);
  }

  toClient() {
    return this
      .set('dataModel', null);
  }

  toOthers() {
    return this;
  }

  toString() {
    return `Trait#${this.type}`;
  }

  equals(other) {
    return this.type === other.type && this.targetId === other.targetId;
  }
}