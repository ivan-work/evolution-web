import logger from '~/shared/utils/logger';
import * as traitData from '../traitData';

const makeCard = (trait1, trait2) => {
  const name = `Card${trait1.type}${trait2 ? 'And' + trait2.type : ''}`.replace(/Trait/g, '');
  logger.debug(`${name}`);
  return {
    type: name
    , trait1type: trait1.type
    , trait2type: trait2 && trait2.type
  }
};

logger.debug(`Avaliable cards`);

export const CardUnknown = {
  type: 'CardUnknown'
  , image: 'http://evolive.ru/images/def.png'
};

export const CardCarnivorous = makeCard(traitData.TraitCarnivorous);

//export const
export const CardPiracy = makeCard(traitData.TraitPiracy);
export const CardCamouflage = makeCard(traitData.TraitCamouflage);
export const CardSharpVision = makeCard(traitData.TraitSharpVision);

// Standard game !
export const CardPoisonousAndCarnivorous = makeCard(traitData.TraitPoisonous, traitData.TraitCarnivorous);
export const CardGrazingAndFatTissue = makeCard(traitData.TraitGrazing, traitData.TraitFatTissue);
export const CardMimicry = makeCard(traitData.TraitMimicry);
export const CardScavenger = makeCard(traitData.TraitScavenger);
export const CardSwimming = makeCard(traitData.TraitSwimming);
export const CardParasiteAndCarnivorous = makeCard(traitData.TraitParasite, traitData.TraitCarnivorous);
export const CardCommunicationAndCarnivorous = makeCard(traitData.TraitCommunication, traitData.TraitCarnivorous);
