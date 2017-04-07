import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// Time to fly

//0
//полёт / хищник - 2,
//полёт / специализация А - 2,
//полёт / специализация В - 2,
//интеллект / жировой запас - 2,

export const CardFlightAndCarnivorous = makeCard(traits.TraitFlight, traits.TraitCarnivorous);
export const CardFlightAndTraitSpecA = makeCard(traits.TraitFlight, traits.TraitSpecA);
export const CardFlightAndTraitSpecB = makeCard(traits.TraitFlight, traits.TraitSpecB);
export const CardIntellectAndFatTissue = makeCard(traits.TraitIntellect, traits.TraitFatTissue);

//1
//интеллект / специализация А - 2,
//засада / специализация В - 2,
//засада / водоплавающее - 2,
//удильщик / хищник - 4,
export const CardIntellectAndSpecA = makeCard(traits.TraitIntellect, traits.TraitSpecA);
export const CardAmbushAndSpecB = makeCard(traits.TraitAmbush, traits.TraitSpecB);
export const CardAmbushAndSwimming = makeCard(traits.TraitAmbush, traits.TraitSwimming);
export const CardAnglerfishAndCarnivorous = makeCard(traits.TraitAnglerfish, traits.TraitCarnivorous);

//2
//чернильное облако - 4,
//раковина - 4,
//метаморфоза / хищник - 2,
//метаморфоза / специализация А - 2,
//живорождение / специализация В - 2,
export const CardInkCloud = makeCard(traits.TraitInkCloud);
export const CardShell = makeCard(traits.TraitShell);
export const CardMetamorphoseAndCarnivorous = makeCard(traits.TraitMetamorphose, traits.TraitCarnivorous);
export const CardMetamorphoseAndSpecA = makeCard(traits.TraitMetamorphose, traits.TraitSpecA);
export const CardViviparousAndSpecB = makeCard(traits.TraitViviparous, traits.TraitSpecB);

//3
//живорождение / водоплавающее - 2,
//трематода / сотрудничество - 4,
//трематода / взаимодействие - 2,
//трематода / жировой запас - 2.

export const CardViviparousAndSwimming = makeCard(traits.TraitViviparous, traits.TraitSwimming);
export const CardTrematodeAndCommunication = makeCard(traits.TraitTrematode, traits.TraitCommunication);
export const CardTrematodeAndCooperation = makeCard(traits.TraitTrematode, traits.TraitCooperation);
export const CardTrematodeAndFatTissue = makeCard(traits.TraitTrematode, traits.TraitFatTissue);