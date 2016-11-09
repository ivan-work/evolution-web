import {Record} from 'immutable';
import uuid from 'node-uuid';
import {TraitDataModel} from './TraitDataModel';
import * as traitData from './traitData'
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import {CTT_PARAMETER} from './constants';

export class TraitModel extends Record({
  type: null
  , id: null
  , linkId: null
  , ownerId: null
  , hostAnimalId: null
  , linkAnimalId: null
  , symbioticAid: null
  , dataModel: null
  , value: null // for fat
}) {
  static new(type) {
    return TraitModel.fromServer({
      id: uuid.v4().slice(0, 2)
      , type
    });
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

  static LinkBetween(traitType, animal1, animal2, oneWay) {
    if (animal1.hasTrait(traitType)
      && animal2.hasTrait(traitType)
      && animal1.traits.some((trait) => trait.type === traitType && (trait.hostAnimalId === animal2.id || trait.linkAnimalId === animal2.id))
    ) {
      throw new ActionCheckError(`TraitModelValidation`, `Animal#%s already has LinkedTrait(%s) on Animal#%s`, animal1.id, traitType, animal2.id);
    }
    const trait1 = TraitModel.new(traitType);
    const trait2 = TraitModel.new(traitType);

    return [
      trait1
        .set('ownerId', animal1.ownerId)
        .set('hostAnimalId', animal1.id)
        .set('linkAnimalId', animal2.id)
        .set('linkId', trait2.id)
        .set('symbioticAid', oneWay ? animal1.id : null)
      , trait2
        .set('linkId', trait1.id)
        .set('ownerId', animal2.ownerId)
        .set('hostAnimalId', animal2.id)
        .set('linkAnimalId', animal1.id)
        .set('symbioticAid', oneWay ? animal1.id : null)
    ];
  }

  isLinked() {
    return this.linkId !== null; // && this.dataModel.cardTargetType & CTT_PARAMETER.LINK
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