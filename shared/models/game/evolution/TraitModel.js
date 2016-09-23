import {Record} from 'immutable';

export class TraitModel extends Record({
  type: null
  , name: null
  , action: null
  , canTarget: null
  , food: 0 // additinal food
}) {
  static new(traitModel) {
    return new TraitModel({
      ...traitModel
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