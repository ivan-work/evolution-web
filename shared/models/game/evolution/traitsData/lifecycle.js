import * as tt from "../traitTypes";
import {TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_TARGET_TYPE} from '../constants';
import {
  server$startFeeding,
  server$traitAnimalAttachTrait,
  server$traitStartCooldown,
} from "../../../../actions/trait";
import ERRORS from "../../../../actions/errors";
import {fromJS} from "immutable";
import {TraitModel} from "../TraitModel";
import {AnimalModel} from "../AnimalModel";
import {server$huntProcess} from "./hunt";


// Тревожное: Когда $A атаковано хищником, оно получает $F.
export const TraitStressful = {
  type: tt.TraitStressful
  , defense: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitStressful, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , _getErrorOfUse: (game, sourceAnimal) => {
    if (!sourceAnimal.canEat(game)) return ERRORS.ANIMAL_DONT_WANT_FOOD;
    return false;
  }
  , action: (game, sourceAnimal, trait) => dispatch => {
    dispatch(server$traitStartCooldown(game.id, trait, sourceAnimal));
    dispatch(server$startFeeding(game.id, sourceAnimal.id, 1, tt.TraitStressful, null, true));
    dispatch(server$huntProcess(game.id));
    return true;
  }
};

// Циста: Можно сыграть только как $A.
// Когда хищник съедает такое $A, он получает свойство $TraitCyst.
// Когда хищник съедает $A с $TraitCyst, он переместите свойство на хищника.
// Когда $A с цистой вымирает, положите свойство как новое $A.
export const TraitCyst = {
  type: tt.TraitCyst
  , food: 1
  , multiple: true
  , getErrorOfUseOnTarget: (game, sourceAnimal, targetTrait, targetAnimal) => {
    if (!(targetAnimal instanceof AnimalModel)) return ERRORS.TRAIT_TARGETING_TYPE_ANIMAL;
    return false
  }
  , customFns: {
    onKill: (game, sourceAnimal, trait, attackAnimal) => dispatch => {
      dispatch(server$traitAnimalAttachTrait(game, attackAnimal, TraitModel.new(tt.TraitCyst)));
    }
  }
};

export const TraitCystInitial = {
  ...TraitCyst
  , food: 0
  , type: tt.TraitCystInitial
  , hidden: true
  , autoAttach: true
  , customFns: {
    onKill: TraitCyst.customFns.onKill
  }
};

// Млекопитающее: Когда $A получает $F, поместите $F на любое свое $A без свойств.
export const TraitMammal = {
  type: tt.TraitMammal
  , getTargets: (game, sourceAnimal, traitMammal) => {
    const animals = game.getPlayer(sourceAnimal.ownerId).continent.filter(animal =>
      animal.getTraits(true).size === 0
      && animal.getNeededFood() > 0
    ).toIndexedSeq()
    const randomAnimalIndex = Math.floor(Math.random() * animals.size)
    return animals.get(randomAnimalIndex)
  }
};

// Споры: Если в фазу вымирания $A осталось ненакормленным, выложите все его свойства как новых накормленных $A.
export const TraitSpores = {
  type: tt.TraitSpores
};
