import {fromJS} from "immutable";

import {
  CARD_TARGET_TYPE,
  TRAIT_COOLDOWN_DURATION,
  TRAIT_COOLDOWN_LINK,
  TRAIT_COOLDOWN_PLACE,
  TRAIT_TARGET_TYPE
} from "../constants";
import ERRORS from '../../../../actions/errors';

import * as tt from "../traitTypes";
import * as ptt from "./plantTraitTypes";

import {TraitCarnivorous, TraitIntellect} from "../traitsData";
import {server$huntStart_Plant} from "../traitsData/hunt";
import {server$gamePlantUpdateFood} from "../../../../actions/game.plantarium";
import {getFeedingCooldownList, server$startCooldownList, server$traitStartCooldown} from "../../../../actions/trait";

export const PlantTraitHiddenCarnivorous = Object.assign({}, TraitCarnivorous, {
  type: ptt.PlantTraitHiddenCarnivorous
  , hidden: true
  , playerControllable: true
  , cooldowns: fromJS([
    [ptt.PlantTraitHiddenCarnivorous, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: () => false
  , action: (game, attackAnimal, attackTrait, targetAnimal, ...flags) => (dispatch, getState) => {
    dispatch(server$huntStart_Plant(game.id, null, attackAnimal, targetAnimal, ...flags));
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
  , cardTargetType: CARD_TARGET_TYPE.PLANT
  , linkTargetType: CARD_TARGET_TYPE.PLANT
};
export const PlantTraitOfficinalis = {
  type: ptt.PlantTraitOfficinalis
  , cardTargetType: CARD_TARGET_TYPE.PLANT
};
export const PlantTraitProteinRich = {
  type: ptt.PlantTraitProteinRich
  , cardTargetType: CARD_TARGET_TYPE.PLANT
  , fruit: true
};
export const PlantTraitParasiticPlant = {
  type: ptt.PlantTraitParasiticPlant
  , cardTargetType: CARD_TARGET_TYPE.PLANT_PARASITE
};
export const PlantTraitParasiticLink = {
  type: ptt.PlantTraitParasiticLink
  , playerControllable: true
  , cardTargetType: CARD_TARGET_TYPE.PLANT
  , linkTargetType: CARD_TARGET_TYPE.PLANT
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
    , [ptt.PlantTraitParasiticLink, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: (game, plant, trait) => {
    // if (game.cooldowns.checkFor())
    if (!trait.linkSource) return ERRORS.TRAIT_ACTION_ONLY_LINK_SOURCE;
    const linkedPlant = game.getPlant(trait.linkAnimalId);
    if (!linkedPlant) return ERRORS.TRAIT_ACTION_NO_TARGETS;
    if (linkedPlant.getFood() <= 1) return ERRORS.TRAIT_TARGETING_ANIMAL_NO_FOOD;
    return false;
  }
  , action: (game, playerId, sourcePlant, traitParasiteLink) => (dispatch, getState) => {
    dispatch(server$startCooldownList(game.id, getFeedingCooldownList(game.id, playerId)));
    dispatch(server$gamePlantUpdateFood(game.id, traitParasiteLink.hostAnimalId, 1));
    dispatch(server$gamePlantUpdateFood(game.id, traitParasiteLink.linkAnimalId, -1));
    return true;
  }
};
export const PlantTraitSpiky = {
  type: ptt.PlantTraitSpiky
  , cardTargetType: CARD_TARGET_TYPE.PLANT
  , coverSlots: 3
};