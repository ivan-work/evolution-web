import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// Споры - 4,
//полёт / специализация А - 4,
//полёт / специализация В - 4,
//интеллект / жировой запас - 4,

export const CardSpores = makeCard(traits.TraitSpores);
export const CardCystInitialAndCarnivorous = makeCard(traits.TraitCystInitial, traits.TraitCarnivorous);
export const CardStressfulAndSwimming = makeCard(traits.TraitStressful, traits.TraitSwimming);
export const CardMammalAndFatTissue = makeCard(traits.TraitMammal, traits.TraitFatTissue);
