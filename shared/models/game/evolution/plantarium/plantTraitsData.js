import * as tt from "../traitTypes";
import * as ptt from "./plantTraitTypes";
import {CARD_TARGET_TYPE} from "../constants";
import ERRORS from '../../../../actions/errors';

export const PlantTraitAquatic = {
  type: ptt.PlantTraitAquatic
  , cardTargetType: CARD_TARGET_TYPE.PLANT
  , _getErrorOfFoodIntake: (game, plant, animal) => {
    if (!animal.hasTrait(tt.TraitSwimming)) return ERRORS.PLANT_FOOD_NO_ACCESS;
    return false;
  }
};
export const PlantTraitTree = {
  type: ptt.PlantTraitTree
  , cardTargetType: CARD_TARGET_TYPE.PLANT
  , coverSlots: 1
  , _getErrorOfFoodIntake: (game, plant, animal) => {
    if (
      !animal.hasTrait(tt.TraitMassive)
      && !animal.hasTrait(tt.TraitFlight)
    ) return ERRORS.PLANT_FOOD_NO_ACCESS;
    return false;
  }
};
export const PlantTraitRootVegetable = {
  type: ptt.PlantTraitRootVegetable
  , cardTargetType: CARD_TARGET_TYPE.PLANT
  , _getErrorOfFoodIntake: (game, plant, animal) => {
    if (!animal.hasTrait(tt.TraitBurrowing)) return ERRORS.PLANT_FOOD_NO_ACCESS;
    return false;
  }
};
export const PlantTraitHoney = {
  type: ptt.PlantTraitHoney
  , cardTargetType: CARD_TARGET_TYPE.PLANT
};
export const PlantTraitMycorrhiza = {
  type: ptt.PlantTraitMycorrhiza
  , cardTargetType: CARD_TARGET_TYPE.PLANT_LINK
};
export const PlantTraitOfficinalis = {
  type: ptt.PlantTraitOfficinalis
  , cardTargetType: CARD_TARGET_TYPE.PLANT
};
export const PlantTraitProteinRich = {
  type: ptt.PlantTraitProteinRich
  , cardTargetType: CARD_TARGET_TYPE.PLANT
};
export const PlantTraitParasiticPlant = {
  type: ptt.PlantTraitParasiticPlant
  , cardTargetType: CARD_TARGET_TYPE.PLANT_PARASITE
};
export const PlantTraitParasiticPlantLink = {
  type: ptt.PlantTraitParasiticPlantLink
  , cardTargetType: CARD_TARGET_TYPE.PLANT_LINK
};
export const PlantTraitSpiky = {
  type: ptt.PlantTraitSpiky
  , cardTargetType: CARD_TARGET_TYPE.PLANT
};