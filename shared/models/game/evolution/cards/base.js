import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// Base game
// 0
//пиратство - 4 шт.,
//ядовитое / хищник - 4,
//топотун / жировой запас - 4,
//мимикрия - 4,

export const CardPiracy = makeCard(traits.TraitPiracy);
export const CardPoisonousAndCarnivorous = makeCard(traits.TraitPoisonous, traits.TraitCarnivorous);
export const CardGrazingAndFatTissue = makeCard(traits.TraitGrazing, traits.TraitFatTissue);
export const CardMimicry = makeCard(traits.TraitMimicry);

// 1
//падальщик - 4,
//водоплавающее - 8,
//спячка / хищник - 4,
//быстрое - 4,
export const CardScavenger = makeCard(traits.TraitScavenger);
export const CardSwimming = makeCard(traits.TraitSwimming);
export const CardHibernationAndCarnivorous = makeCard(traits.TraitHibernation, traits.TraitCarnivorous);
export const CardRunning = makeCard(traits.TraitRunning);

// 2
//отбрасывание хвоста - 4,
//камуфляж / жировой запас - 4,
//большой / хищник - 4,
//большой / жировой запас - 4,
export const CardTailLoss = makeCard(traits.TraitTailLoss);
export const CardCamouflageAndFatTissue = makeCard(traits.TraitCamouflage, traits.TraitFatTissue);
export const CardHighBodyWeightAndCarnivorous = makeCard(traits.TraitHighBodyWeight, traits.TraitCarnivorous);
export const CardHighBodyWeightAndFatTissue = makeCard(traits.TraitHighBodyWeight, traits.TraitFatTissue);

// 3
//паразит / хищник - 4,
//паразит / жировой запас - 4,
//норное / жировой запас - 4,
//острое зрение / жировой запас - 4,
export const CardParasiteAndCarnivorous = makeCard(traits.TraitParasite, traits.TraitCarnivorous);
export const CardParasiteAndFatTissue = makeCard(traits.TraitParasite, traits.TraitFatTissue);
export const CardBurrowingAndFatTissue = makeCard(traits.TraitBurrowing, traits.TraitFatTissue);
export const CardSharpVisionAndFatTissue = makeCard(traits.TraitSharpVision, traits.TraitFatTissue);

// 4
//симбиоз - 4,
//взаимодействие / хищник - 4,
//сотрудничество / жировой запас - 4,
//сотрудничество / хищник - 4.
export const CardSymbiosis = makeCard(traits.TraitSymbiosis);
export const CardCooperationAndCarnivorous = makeCard(traits.TraitCooperation, traits.TraitCarnivorous);
export const CardCommunicationAndFatTissue = makeCard(traits.TraitCommunication, traits.TraitFatTissue);
export const CardCommunicationAndCarnivorous = makeCard(traits.TraitCommunication, traits.TraitCarnivorous);
