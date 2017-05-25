import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// Bonus

// 0
// r-Strategy 6
// Homeothermy/Swimming 3
// Homeothermy/Fat 3
// Shy/Swimming 3
// Shy/Carnivorous 3

export const CardRstrategy = makeCard(traits.TraitRstrategy);
export const CardHomeothermyAndSwimming = makeCard(traits.TraitHomeothermy, traits.TraitSwimming);
export const CardHomeothermyAndFatTissue = makeCard(traits.TraitHomeothermy, traits.TraitFatTissue);
export const CardShyAndSwimming = makeCard(traits.TraitShy, traits.TraitSwimming);
export const CardShyAndCarnivorous = makeCard(traits.TraitShy, traits.TraitCarnivorous);
