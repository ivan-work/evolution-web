import makeCard from './makeCard';
import * as tt from '../traitTypes/index';
import * as ptt from '../plantarium/plantTraitTypes';

export * from './base';
export * from './ttf';
export * from './cons';
export * from './bonus';
export * from './plantarium';
export * from './customff';

export const CardUnknown = {
  type: 'CardUnknown'
};

export const CardCarnivorous = makeCard(tt.TraitCarnivorous);
export const CardParasite = makeCard(tt.TraitParasite);
export const CardCommunication = makeCard(tt.TraitCommunication);
export const CardAquatic = makeCard(ptt.PlantTraitAquatic);

//export const
export const CardCamouflage = makeCard(tt.TraitCamouflage);
export const CardSharpVision = makeCard(tt.TraitSharpVision);