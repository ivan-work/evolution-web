import {CARD_TARGET_TYPE} from '../constants'
import * as traitData from '../traitData';

export const CardUnknown = {
  type: 'CardUnknown'
  , name: ''
  , image: 'http://evolive.ru/images/def.png'
};

export const CardPiracy = {
  type: 'CardPiracy'
  , name: 'Piracy'
  , target: CARD_TARGET_TYPE.ANIMAL_SELF
  , trait1type: traitData.TraitPiracy.type
};

export const CardPoisonousCarnivore = {
  type: 'CardPoisonousCarnivore'
  , name: 'Poisonous'
  , name2: 'Carnivorous'
  , target: CARD_TARGET_TYPE.ANIMAL_SELF
  , trait1type: traitData.TraitPoisonous.type
  , trait2type: traitData.TraitCarnivorous.type
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