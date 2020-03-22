import * as ptt from './plantTraitTypes';
import * as pt from './plantTypes';
import {TraitModel} from "../TraitModel";

// однолетник
export const PlantEphemeral = {
  type: pt.PlantEphemeral
  , fruit: false
  , surviveNoFood: true
  , coverSlots: 0
  , startingFood: 2
  , maxFood: 3
  , produceFood: (game, plant) => {
    const food = plant.getFood();
    if (food === 0) return 1;
    else if (food === 1) return 2;
    else if (food > 1) return PlantEphemeral.maxFood;
  }
};
// многолетник
export const PlantPerennial = {
  type: pt.PlantPerennial
  , fruit: false
  , coverSlots: 0
  , startingFood: 3
  , maxFood: 5
  , produceFood: (game, plant) => {
    const food = plant.getFood();
    if (food === 1) return 2;
    else if (food === 2) return 3;
    else if (food > 2) return PlantPerennial.maxFood;
  }
};
// бобовое
export const PlantLegume = {
  type: pt.PlantLegume
  , fruit: false
  , coverSlots: 0
  , startingFood: 2
  , maxFood: 5
  , produceFood: (game, plant) => {
    const food = plant.getFood();
    if (food === 1) return 3;
    else if (food === 2) return 4;
    else if (food > 2) return PlantLegume.maxFood;
  }
};
export const PlantGrass = {
  type: pt.PlantGrass
  , fruit: false
  , coverSlots: 0
  , startingFood: 2
  , maxFood: 5
  , produceFood: (game, plant) => {
    const food = plant.getFood();
    if (food === 1) return 2;
    else if (food === 2) return 3;
    else if (food > 2) return PlantGrass.maxFood;
  }
};

export const PlantFruits = {
  type: pt.PlantFruits
  , fruit: true
  , coverSlots: 0
  , startingFood: 2
  , maxFood: 5
  , produceFood: (game, plant) => {
    const food = plant.getFood();
    if (food === 1) return PlantFruits.maxFood;
    else if (food === 2) return 4;
    else if (food > 2) return 3;
  }
};
export const PlantSucculent = {
  type: pt.PlantSucculent
  , fruit: true
  , coverSlots: 1
  , startingFood: 3
  , maxFood: 4
  , produceFood: (game, plant) => {
    const food = plant.getFood();
    if (food === 1) return 2;
    else if (food === 2) return 3;
    else if (food > 2) return PlantSucculent.maxFood;
  }
};

export const PlantLiana = {
  type: pt.PlantLiana
  , fruit: true
  , coverSlots: 0
  , startingFood: 1
  , maxFood: 6
  , produceFood: (game, sourcePlant) => Math.min(
    PlantLiana.maxFood
    , sourcePlant.getFood() + game.plants.filter(plant => plant.type !== pt.PlantLiana).size
  )
};
export const PlantFungus = {
  type: pt.PlantFungus
  , fruit: true
  , coverSlots: 0
  , startingFood: 1
  , maxFood: 4
};

export const PlantCarnivorous = {
  type: pt.PlantCarnivorous
  , fruit: true
  , coverSlots: 0
  , startingFood: 2
  , maxFood: 6
  , onNewPlant: (plant) => plant
    .traitAttach(TraitModel.new(ptt.PlantTraitHiddenCarnivorous))
    .traitAttach(TraitModel.new(ptt.PlantTraitHiddenIntellect))
};
export const PlantParasite = {
  type: pt.PlantParasite
  , surviveNoFood: true
  , fruit: false
  , coverSlots: 0
  , startingFood: 0
  , maxFood: 6
};