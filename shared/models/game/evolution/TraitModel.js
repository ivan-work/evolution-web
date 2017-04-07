import {Record, List} from 'immutable';
import uuid from 'node-uuid';
import * as traits from './traits';

export class TraitModel extends Record({
  type: null
  , name: null
  , active: false
}) {
  static new(traitType) {
    return new TraitModel({
      ...traits[traitType]
    });
  }

  static fromServer(js) {
    return js == null
      ? null
      : new TraitModel(js);
  }

  toString() {
    return `Trait#${this.type}`;
  }
}