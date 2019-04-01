import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// Plantarium

// гриб - 4
// fungus
//
// злак - 4
// grass
//
// многолетник - 4
// perennial
//
// бобовое
// legume
//
// лиана
// liana
//
// плодовое
// fruits
//
// succulent
//
// plantCarnivorous
// однолетник
// ephemeral
// 36

// корнеплод / жировой запас   4 // root vegetable
// медонос / большой           4 // honey plant
// микориза / водоплавающее    4 // mycorrhiza
// водное / норное             4 // aquatic

export const CardRootVegetableAndFatTissue = makeCard(traits.PlantTraitRootVegetable, traits.TraitFatTissue);
export const CardHoneyAndMassive = makeCard(traits.PlantTraitHoney, traits.TraitMassive);
export const CardMycorrhizaAndSwimming = makeCard(traits.PlantTraitMycorrhiza, traits.TraitSwimming);
export const CardAquaticAndBurrowing = makeCard(traits.PlantTraitAquatic, traits.TraitBurrowing);

// лекарственное / хищник      4 // officinalis
// питательное / водоплавающее 4 // protein rich
// дерево / хищник             4 // tree
// растение-паразит            4 // parasitic plant
// колючее / сотрудничество    4 // spiky

export const CardOfficinalisAndCarnivorous = makeCard(traits.PlantTraitOfficinalis, traits.TraitCarnivorous);
export const CardProteinRichAndSwimming = makeCard(traits.PlantTraitProteinRich, traits.TraitSwimming);
export const CardTreeAndCarnivorous = makeCard(traits.PlantTraitTree, traits.TraitCarnivorous);
export const CardParasiticPlant = makeCard(traits.PlantTraitParasiticPlant);
export const CardParasiticAndCommunication = makeCard(traits.PlantTraitSpiky, traits.TraitCommunication);