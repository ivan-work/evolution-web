import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

export * from './base';

export const CardUnknown = {
  type: 'CardUnknown'
  , image: 'http://evolive.ru/images/def.png'
};

export const CardCarnivorous = makeCard(traits.TraitCarnivorous);

//export const
export const CardCamouflage = makeCard(traits.TraitCamouflage);
export const CardSharpVision = makeCard(traits.TraitSharpVision);