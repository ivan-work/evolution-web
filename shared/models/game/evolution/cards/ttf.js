import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// Time to fly

//0
//полёт / хищник - 2,
//полёт / специализация А - 2,
//полёт / специализация В - 2,
//интеллект / жировой запас - 2,

export const CardFlightAndCarnivorous = makeCard(traits.TraitFlight, traits.TraitCarnivorous);
export const CardFlightAndThermosynthesis = makeCard(traits.TraitFlight, traits.TraitThermosynthesis);
export const CardFlightAndPhotosynthesis = makeCard(traits.TraitFlight, traits.TraitPhotosynthesis);
export const CardIntellectAndFatTissue = makeCard(traits.TraitIntellect, traits.TraitFatTissue);

//1
//интеллект / специализация А - 2,
//засада / специализация В - 2,
//засада / водоплавающее - 2,
//удильщик - 4,
export const CardIntellectAndThermosynthesis = makeCard(traits.TraitIntellect, traits.TraitThermosynthesis);
export const CardAmbushAndPhotosynthesis = makeCard(traits.TraitAmbush, traits.TraitPhotosynthesis);
export const CardAmbushAndSwimming = makeCard(traits.TraitAmbush, traits.TraitSwimming);
export const CardAnglerfish = makeCard(traits.TraitAnglerfish);

//2
//чернильное облако - 4,
//раковина - 4,
//метаморфоза / хищник - 2,
//метаморфоза / специализация А - 2,
//живорождение / специализация В - 2,
export const CardInkCloud = makeCard(traits.TraitInkCloud);
export const CardShell = makeCard(traits.TraitShell);
export const CardMetamorphoseAndCarnivorous = makeCard(traits.TraitMetamorphose, traits.TraitCarnivorous);
export const CardMetamorphoseAndThermosynthesis = makeCard(traits.TraitMetamorphose, traits.TraitThermosynthesis);
export const CardViviparousAndPhotosynthesis = makeCard(traits.TraitViviparous, traits.TraitPhotosynthesis);

//3
//живорождение / водоплавающее - 2,
//трематода / сотрудничество - 4,
//трематода / взаимодействие - 2,
//трематода / жировой запас - 2.

export const CardViviparousAndSwimming = makeCard(traits.TraitViviparous, traits.TraitSwimming);
export const CardTrematodeAndCommunication = makeCard(traits.TraitTrematode, traits.TraitCommunication);
export const CardTrematodeAndCooperation = makeCard(traits.TraitTrematode, traits.TraitCooperation);
export const CardTrematodeAndFatTissue = makeCard(traits.TraitTrematode, traits.TraitFatTissue);