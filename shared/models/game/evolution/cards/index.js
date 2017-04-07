import {TARGET_TYPE} from '../../CardModel'
import * as traits from '../traits';

const ExampleCard = {
  type: 'string'
  , name: 'string'
  , target: TARGET_TYPE.DROP_AS_ANIMAL | TARGET_TYPE.DROP_AS_ANIMAL
};

export const CardCamouflage = {
  type: 'CardCamouflage'
  , name: 'Camouflage'
  , target: TARGET_TYPE.ANIMAL_SELF
  , trait1type: traits.TraitCamouflage.type
};

export const CardCarnivorous = {
  type: 'CardCarnivorous'
  , name: 'Carnivorous'
  , target: TARGET_TYPE.ANIMAL_SELF
  , trait1type: traits.TraitCarnivorous.type
};

export const CardSharpVision = {
  type: 'CardSharpVision'
  , name: 'Sharp Vision'
  , target: TARGET_TYPE.ANIMAL_SELF
  , trait1type: traits.TraitSharpVision.type
};