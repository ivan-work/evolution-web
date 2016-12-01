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
  , linkSource: null
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

  static LinkBetweenCheck(traitType, animal1, animal2) {
    return (animal1.hasTrait(traitType)
      && animal2.hasTrait(traitType)
      && animal1.traits.some((trait) => trait.type === traitType && (trait.hostAnimalId === animal2.id || trait.linkAnimalId === animal2.id))
    );
  }

  static LinkBetween(traitType, animal1, animal2) {
    if (this.LinkBetweenCheck(traitType, animal1, animal2)) {
      throw new ActionCheckError(`TraitModelValidation`, `Animal#%s already has LinkedTrait(%s) on Animal#%s`, animal1.id, traitType, animal2.id);
    }
    const trait1 = TraitModel.new(traitType);
    const trait2 = TraitModel.new(traitType);
    return [
      trait1
        .set('ownerId', animal1.ownerId)
        .set('linkId', trait2.id)
        .set('linkSource', true)
        .set('hostAnimalId', animal1.id)
        .set('linkAnimalId', animal2.id)
      , trait2
        .set('ownerId', animal2.ownerId)
        .set('linkId', trait1.id)
        .set('linkSource', false)
        .set('hostAnimalId', animal2.id)
        .set('linkAnimalId', animal1.id)
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
    return `Trait#${this.id}#${this.type}`;
  }
}