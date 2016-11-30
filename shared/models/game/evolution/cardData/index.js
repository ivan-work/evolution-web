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
//пиратство - 4 шт.,
//ядовитое / хищник - 4,
//топотун / жировой запас - 4,
//мимикрия - 4,

export const CardPiracy = makeCard(traitData.TraitPiracy);
export const CardPoisonousAndCarnivorous = makeCard(traitData.TraitPoisonous, traitData.TraitCarnivorous);
export const CardGrazingAndFatTissue = makeCard(traitData.TraitGrazing, traitData.TraitFatTissue);
export const CardMimicry = makeCard(traitData.TraitMimicry);

// 1
//падальщик - 4,
//водоплавающее - 8,
//спячка / хищник - 4,
//быстрое - 4,
export const CardScavenger = makeCard(traitData.TraitScavenger);
export const CardSwimming = makeCard(traitData.TraitSwimming);
export const CardHibernationAndCarnivorous = makeCard(traitData.TraitHibernation, traitData.TraitCarnivorous);
export const CardRunning = makeCard(traitData.TraitRunning);

// 2
//отбрасывание хвоста - 4,
//камуфляж / жировой запас - 4,
//большой / хищник - 4,
//большой / жировой запас - 4,
export const CardTailLoss = makeCard(traitData.TraitTailLoss);
export const CardCamouflageAndFatTissue = makeCard(traitData.TraitCamouflage, traitData.TraitFatTissue);
export const CardHighBodyWeightAndCarnivorous = makeCard(traitData.TraitHighBodyWeight, traitData.TraitCarnivorous);
export const CardHighBodyWeightAndFatTissue = makeCard(traitData.TraitHighBodyWeight, traitData.TraitFatTissue);

// 3
//паразит / хищник - 4,
//паразит / жировой запас - 4,
//норное / жировой запас - 4,
//острое зрение / жировой запас - 4,
export const CardParasiteAndCarnivorous = makeCard(traitData.TraitParasite, traitData.TraitCarnivorous);
export const CardParasiteAndFatTissue = makeCard(traitData.TraitParasite, traitData.TraitFatTissue);
export const CardBurrowingAndFatTissue = makeCard(traitData.TraitBurrowing, traitData.TraitFatTissue);
export const CardSharpVisionAndFatTissue = makeCard(traitData.TraitSharpVision, traitData.TraitFatTissue);

// 4
//симбиоз - 4,
//взаимодействие / хищник - 4,
//сотрудничество / жировой запас - 4,
//сотрудничество / хищник - 4.
export const CardSymbiosis = makeCard(traitData.TraitSymbiosis);
export const CardCooperationAndCarnivorous = makeCard(traitData.TraitCooperation, traitData.TraitCarnivorous);
export const CardCommunicationAndFatTissue = makeCard(traitData.TraitCommunication, traitData.TraitFatTissue);
export const CardCommunicationAndCarnivorous = makeCard(traitData.TraitCommunication, traitData.TraitCarnivorous);
