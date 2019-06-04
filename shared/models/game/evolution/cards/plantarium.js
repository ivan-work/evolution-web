import makeCard from './makeCard';
import * as tt from '../traitTypes';
import * as ptt from '../plantarium/plantTraitTypes';

// корнеплод / жировой запас   4 // root vegetable
// медонос / большой           4 // honey plant
// микориза / водоплавающее    4 // mycorrhiza
// водное / норное             4 // aquatic

export const CardRootVegetableAndFatTissue = makeCard(ptt.PlantTraitRootVegetable, tt.TraitFatTissue);
export const CardHoneyAndMassive = makeCard(ptt.PlantTraitHoney, tt.TraitMassive);
export const CardMycorrhizaAndSwimming = makeCard(ptt.PlantTraitMycorrhiza, tt.TraitSwimming);
export const CardAquaticAndBurrowing = makeCard(ptt.PlantTraitAquatic, tt.TraitBurrowing);

// лекарственное / хищник      4 // officinalis
// питательное / водоплавающее 4 // protein rich
// дерево / хищник             4 // tree
// растение-паразит            4 // parasitic plant
// колючее / сотрудничество    4 // spiky

export const CardOfficinalisAndCarnivorous = makeCard(ptt.PlantTraitOfficinalis, tt.TraitCarnivorous);
export const CardProteinRichAndSwimming = makeCard(ptt.PlantTraitProteinRich, tt.TraitSwimming);
export const CardTreeAndCarnivorous = makeCard(ptt.PlantTraitTree, tt.TraitCarnivorous);
export const CardParasiticPlant = makeCard(ptt.PlantTraitParasiticPlant);
export const CardSpikyAndCommunication = makeCard(ptt.PlantTraitSpiky, tt.TraitCommunication);