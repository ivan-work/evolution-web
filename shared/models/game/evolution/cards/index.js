import {CARD_TARGET_TYPE} from '../../CardModel'
import * as traitData from '../traitData';

const ExampleCard = {
  type: 'string'
  , name: 'string'
  , target: CARD_TARGET_TYPE.DROP_AS_ANIMAL | CARD_TARGET_TYPE.DROP_AS_ANIMAL
};

export const CardCamouflage = {
  type: 'CardCamouflage'
  , name: 'Camouflage'
  , target: CARD_TARGET_TYPE.ANIMAL_SELF
  , trait1type: traitData.TraitCamouflage.type
};

export const CardCarnivorous = {
  type: 'CardCarnivorous'
  , name: 'Carnivorous'
  , target: CARD_TARGET_TYPE.ANIMAL_SELF
  , trait1type: traitData.TraitCarnivorous.type
};

export const CardSharpVision = {
  type: 'CardSharpVision'
  , name: 'Sharp Vision'
  , target: CARD_TARGET_TYPE.ANIMAL_SELF
  , trait1type: traitData.TraitSharpVision.type
};