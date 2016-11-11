import logger from '~/shared/utils/logger';
import * as traitData from '../traitData';

const makeCard = (trait1, trait2) => {
  const name = `Card${trait1.type}${trait2 ? 'And' + trait2.type : ''}`.replace(/Trait/g, '');
  //logger.debug(`${name}`);
  return {
    type: name
    , trait1type: trait1.type
    , trait2type: trait2 && trait2.type
  }
};

//logger.debug(`Avaliable cards`);

export const CardUnknown = {
  type: 'CardUnknown'
  , image: 'http://evolive.ru/images/def.png'
};

export const CardCarnivorous = makeCard(traitData.TraitCarnivorous);

//export const
export const CardCamouflage = makeCard(traitData.TraitCamouflage);
export const CardSharpVision = makeCard(traitData.TraitSharpVision);

// Standard game !
// 0
export const CardPiracy = makeCard(traitData.TraitPiracy);
export const CardPoisonousAndCarnivorous = makeCard(traitData.TraitPoisonous, traitData.TraitCarnivorous);
export const CardGrazingAndFatTissue = makeCard(traitData.TraitGrazing, traitData.TraitFatTissue);
export const CardMimicry = makeCard(traitData.TraitMimicry);
// 1
export const CardScavenger = makeCard(traitData.TraitScavenger);
export const CardSwimming = makeCard(traitData.TraitSwimming);
// 2
// 3
export const CardParasiteAndCarnivorous = makeCard(traitData.TraitParasite, traitData.TraitCarnivorous);
export const CardParasiteAndFatTissue = makeCard(traitData.TraitParasite, traitData.TraitFatTissue);
// 4
//симбиоз - 4,
//взаимодействие / хищник - 4,
//сотрудничество / жировой запас - 4,
//сотрудничество / хищник - 4.
export const CardSymbiosis = makeCard(traitData.TraitSymbiosis);
export const CardCooperationAndCarnivorous = makeCard(traitData.TraitCooperation, traitData.TraitCarnivorous);
export const CardCommunicationAndFatTissue = makeCard(traitData.TraitCommunication, traitData.TraitFatTissue);
export const CardCommunicationAndCarnivorous = makeCard(traitData.TraitCommunication, traitData.TraitCarnivorous);
