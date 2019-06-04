import {fromJS} from "immutable";

import {CARD_TARGET_TYPE, TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_LINK, TRAIT_COOLDOWN_PLACE} from "../constants";
import ERRORS from '../../../../actions/errors';

import * as tt from "../traitTypes";
import * as ptt from "./plantTraitTypes";

import {TraitCarnivorous, TraitIntellect} from "../traitsData";
import {gameGetHunt, server$huntStart_Animal, server$huntStart_Plant} from "../traitsData/hunt";

export const PlantTraitHiddenCarnivorous = Object.assign({}, TraitCarnivorous, {
  type: ptt.PlantTraitHiddenCarnivorous
  , hidden: true
  , cooldowns: fromJS([
    [ptt.PlantTraitHiddenCarnivorous, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , _getErrorOfUse: () => false
  , action: (game, attackAnimal, attackTrait, targetAnimal, ...flags) => (dispatch, getState) => {
    dispatch(server$huntStart_Plant(game.id, attackAnimal, targetAnimal, ...flags));
    return false;
  }
});

export const PlantTraitHiddenIntellect = Object.assign({}, TraitIntellect, {
  type: ptt.PlantTraitHiddenIntellect
  , hidden: true
});

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