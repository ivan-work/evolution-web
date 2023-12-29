import * as tt from "../traitTypes";
import {
  CARD_TARGET_TYPE,
  TRAIT_COOLDOWN_DURATION,
  TRAIT_COOLDOWN_LINK,
  TRAIT_COOLDOWN_PLACE,
  TRAIT_TARGET_TYPE
} from '../constants';
import {
  animalUpdateFood,
  gameUpdateFood,
  server$traitAnimalAttachTrait,
  server$traitAnimalReplaceTrait, server$traitSetValue,
  server$traitStartCooldown, traitMoveFood
} from "../../../../actions/trait";
import {server$huntEnd} from "./hunt";
import ERRORS from "../../../../actions/errors";
import {fromJS} from "immutable";
import {server$game} from "../../../../actions/generic";
import {TraitModel} from "../TraitModel";
import {AnimalModel} from "../AnimalModel";
import {getErrorOfAnimalEatingFromPlantNoCD} from "../../../../actions/trait.checks";
import {server$gamePlantUpdateFood} from "../../../../actions/game.plantarium";

// Зараженное: Хищник съевший это $A получает свойство $TraitFlea
export const TraitInfected = {
  type: tt.TraitInfected
  , getErrorOfUseOnTarget: (game, sourceAnimal, targetTrait, targetAnimal) => {
    if (!(targetAnimal instanceof AnimalModel)) return ERRORS.TRAIT_TARGETING_TYPE_ANIMAL;
    return false
  }
  , customFns: {
    onKill: (game, sourceAnimal, traitCnidocytes, targetAnimal) => dispatch => {
      dispatch(server$traitAnimalAttachTrait(game, targetAnimal, TraitModel.new(tt.TraitFlea)));
    }
  }
};

// Прозрачное : Если на $A нет $F, оно не может быть атаковано хищником
export const TraitPerspicuus = {type: tt.TraitPerspicuus};

// Плюющееся : Когда $A атаковали, можно сбросить $F для защиты.
export const TraitVomitus = {
  type: tt.TraitVomitus
  , defense: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitVomitus, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , _getErrorOfUse: (game, defenseAnimal, defenseTrait, attackAnimal, attackTrait) => {
    if (defenseAnimal.getFood() === 0) return ERRORS.ANIMAL_HAS_NO_FOOD;
    return false;
  }
  , action: (game, defenseAnimal, defenseTrait, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$game(game.id, animalUpdateFood(game.id, defenseAnimal.id, -1)));
    dispatch(server$traitStartCooldown(game.id, defenseTrait, defenseAnimal));
    dispatch(server$huntEnd(game.id));
  }
};

// Тощее : Хищник, съевший это $A получает на $F меньше.
export const TraitSkinny = {type: tt.TraitSkinny};

// Амфибия : $EAT. $CDTurn. Можно активировать чтобы вылезти из воды/залезть в воду при наличии у $A свойства $TraitSwimming.
export const TraitAmphibious = {
  type: tt.TraitAmphibious
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitAmphibious, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , _getErrorOfUse: (game, sourceAnimal, trait) => {
    if (!sourceAnimal.hasTrait(tt.TraitSwimming) && !sourceAnimal.hasTrait(tt.TraitHumus)) return ERRORS.TRAIT_ACTION_NO_TRAIT;
    return false;
  }
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    const traitSwimming = sourceAnimal.hasTrait(tt.TraitSwimming);
    const traitHumus = sourceAnimal.hasTrait(tt.TraitHumus)
    if (traitSwimming) {
      const newTrait = TraitModel.new(tt.TraitHumus);
      dispatch(server$traitAnimalReplaceTrait(game, sourceAnimal, traitSwimming.id, newTrait));
    } else if (traitHumus) {
      const newTrait = TraitModel.new(tt.TraitSwimming);
      dispatch(server$traitAnimalReplaceTrait(game, sourceAnimal, traitHumus.id, newTrait));
    }
    dispatch(server$traitStartCooldown(game.id, trait, sourceAnimal));
    return true;
  }
};

export const TraitHumus = {
  type: tt.TraitHumus
  , _getErrorOfTraitPlacement: (animal) => {
    if (animal.hasTrait(tt.TraitSwimming, true)) return tt.TraitSwimming;
    return false;
  }
}

// Агрессия: Хищник с этим свойством может атаковать дважды в ход. Несовместимо со свойством $TraitIntelltect
export const TraitAggression = {
  type: tt.TraitAggression
  , food: 1
  , cooldowns: fromJS([
    [tt.TraitAggression, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , _getErrorOfTraitPlacement: (animal) => {
    if (animal.hasTrait(tt.TraitIntellect, true)) return tt.TraitIntellect;
    return false;
  }
};

// Мутирующее : В конце фазы развития $A получает из колоды первую карту. Если это не парное свойство, то $A получает его.
export const TraitMutation = {type: tt.TraitMutation};

// Приспособленное : На $A больше нельзя выкладывать свойства, не меняющие потребность в еде. $A потребляет на $F меньше, минимум - одна $F.
export const TraitAdaptation = {type: tt.TraitAdaptation, food: -1};

// Прожорливое : Можно брать еду сверх нормы.
export const TraitVoracious = {type: tt.TraitVoracious, food: 1};

// Яйцекладущее : $EAT. $CDTurn. Добавляет $F в базу или на растение.
export const TraitOviparous = {
  type: tt.TraitOviparous
  , replaceOnPlantarium: tt.TraitPlantOviparous
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitOviparous, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    const food = game.getFood();
    dispatch(server$game(game.id, gameUpdateFood(game.id, food + 1)))
    dispatch(server$traitStartCooldown(game.id, trait, sourceAnimal));
    return true;
  }
};

export const TraitPlantOviparous = {
  type: tt.TraitPlantOviparous
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.PLANT
  , cooldowns: fromJS([
    [tt.TraitPlantOviparous, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , getErrorOfUseOnTarget: (game, animal, plant) => {
    if (plant.getFood() === plant.getMaxFood()) return ERRORS.PLANT_FOOD;
    return false;
  }
  , action: (game, animal, trait, plant) => (dispatch) => {
    dispatch(server$gamePlantUpdateFood(game.id, plant.id, 1))
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    return true;
  }
};

// Каннибализм : При поедании своего $A хищник получает на $F больше.
export const TraitCannibalism = {type: tt.TraitCannibalism};

// Паралич : Паразит. $EAT. $CDTurn. Запрещает использование активных свойств до деактивации.
export const TraitParalysis = {
  type: tt.TraitParalysis
  , playerControllable: true
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , targetType: TRAIT_TARGET_TYPE.NONE
  , dropValue: true
  , cooldowns: fromJS([
    [tt.TraitParalysis, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, trait, sourceAnimal));
    dispatch(server$traitSetValue(game, sourceAnimal, trait, true));
    return true;
  }
};

// Вредитель : Можно класть на всех. Убирает $F в начале фазы питания.
export const TraitPest = {
  type: tt.TraitPest
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF & CARD_TARGET_TYPE.ANIMAL_ENEMY
};

// Блохи : Увеличивает потребность в $F на +1. Может быть несколько на одном $A.
export const TraitFlea = {type: tt.TraitFlea, food: 1, multiple: true, cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY};
