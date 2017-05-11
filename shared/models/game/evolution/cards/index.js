import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

export * from './base';
export * from './ttf';
export * from './cons';

export const CardUnknown = {
  type: 'CardUnknown'
};

export const CardCarnivorous = makeCard(traits.TraitCarnivorous);

//export const
export const CardCamouflage = makeCard(traits.TraitCamouflage);
export const CardSharpVision = makeCard(traits.TraitSharpVision);