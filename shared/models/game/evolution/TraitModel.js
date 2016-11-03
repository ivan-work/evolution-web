import {Record} from 'immutable';
import {TraitDataModel} from './TraitDataModel';
import * as traitData from './traitData'
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {CTT_PARAMETER} from './constants';

export class TraitModel extends Record({
  type: null
  , ownerId: null
  , hostAnimalId: null
  , linkAnimalId: null
  , symbioticAid: null
  , dataModel: null
  , value: null
}) {
  static new(type) {
    return TraitModel.fromServer({type});
  }

  static fromServer(js) {
    return js == null
      ? null
      : new TraitModel(js)
      .set('dataModel', TraitDataModel.new(js.type));
  }

  static parse(type) {
    const traitKey = Object.keys(traitData)
      .find(traitKey => ~traitData[traitKey].type
        .toLowerCase().indexOf(type.toLowerCase()));
    return TraitModel.new(traitKey);
  }

  attachTo(animal) {
    if (!this.dataModel.multiple && animal.hasTrait(this.type)) {
      throw new ActionCheckError(`TraitModelValidation`, `Animal#%s already has Trait(%s)`, animal.id, this.type);
    }
    return this
      .set('ownerId', animal.ownerId)
      .set('hostAnimalId', animal.id);
  }

  linkBetween(animal1, animal2) {
    if (animal1.hasTrait(this.type)
      && animal2.hasTrait(this.type)
      && animal1.traits.some((trait) => trait.type === this.type && (trait.hostAnimalId === animal2.id || trait.linkAnimalId === animal2.id))
    ) {
      throw new ActionCheckError(`TraitModelValidation`, `Animal#%s already has LinkedTrait(%s) on Animal#%s`, animal1.id, this.type, animal2.id);
    }
    return this
      .set('ownerId', animal1.ownerId)
      .set('hostAnimalId', animal1.id)
      .set('linkAnimalId', animal2.id);
  }

  linkOneway(animal1, animal2, from1to2) {
    return this.linkBetween(animal1, animal2)
      .set('symbioticAid', from1to2 ? animal1.id : animal2.id);
  }

  isLinked() {
    return this.dataModel && this.dataModel.cardTargetType & CTT_PARAMETER.LINK
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