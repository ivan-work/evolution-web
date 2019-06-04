import logger from '~/shared/utils/logger';
import {List, fromJS, OrderedMap} from 'immutable';

import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , CARD_TARGET_TYPE, HUNT_FLAG, ANIMAL_DEATH_REASON
} from '../constants';
import ERRORS from '../../../../actions/errors';

import * as tt from '../traitTypes';

import {
  server$traitNotify_End
  , server$traitStartCooldown
  , server$traitAnimalAttachTrait
  , server$traitAnimalRemoveTrait
  , server$tryNeoplasmDeath
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';
import {huntSetFlag, server$huntProcess} from "./hunt";
import {AnimalModel} from "../AnimalModel";

export const TraitAedificator = {type: tt.TraitAedificator};

export const TraitNeoplasm = {
  type: tt.TraitNeoplasm
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , customFns: {
    canBeDisabled: (trait) => (!trait.getDataModel().hidden && !trait.isLinked())
    , shouldKillAnimal: (animal) => {
      const animalTraitsArray = animal.traits.toArray();
      const neoplasmIndex = animalTraitsArray.findIndex(t => t.type === tt.TraitNeoplasm);
      return (
        ~neoplasmIndex
        && !animalTraitsArray
          .slice(neoplasmIndex + 1)
          .some((trait, index) => TraitNeoplasm.customFns.canBeDisabled(trait))
      );
    }
    , actionMoveInAnimal: (animal) => {
      let animalTraitArray = animal.traits.toArray();
      const currentIndex = animalTraitArray.findIndex((t) => t.type === tt.TraitNeoplasm);
      if (!~currentIndex) return animal;
      const nextIndex = animalTraitArray.findIndex((t, i) => {
        return i > currentIndex && TraitNeoplasm.customFns.canBeDisabled(t);
      });
      if (!~nextIndex) return null; // KILL
      const futureIndex = animalTraitArray.findIndex((t, i) => {
        return i > nextIndex && TraitNeoplasm.customFns.canBeDisabled(t);
      });
      if (!~futureIndex) return null; // KILL
      const traitNeoplasm = animalTraitArray[currentIndex];
      animalTraitArray.splice(currentIndex, 1);
      animalTraitArray.splice(nextIndex, 0, traitNeoplasm);
      animalTraitArray = animalTraitArray.map(t => [t.id, t]);
      return animal.set('traits', OrderedMap(animalTraitArray));
    }
    , actionProcess: (animal) => {
      const traitNeoplasm = animal.hasTrait(tt.TraitNeoplasm);
      if (!traitNeoplasm) return animal.recalculateFood();
      let belowNeoplasm = true;
      return animal.update('traits', traits => traits.map(trait => {
        if (trait.type === tt.TraitNeoplasm) {
          belowNeoplasm = false;
        } else if (!!traitNeoplasm && belowNeoplasm && TraitNeoplasm.customFns.canBeDisabled(trait)) {
          return trait.set('disabled', true).set('value', false)
        }
        return trait;
      }))
        .recalculateFood();
    }
  }
};

export const TraitRegeneration = {
  type: tt.TraitRegeneration
  , checkTraitPlacement: (animal) => (animal.traits.filter(t => !t.hidden).size < 2
    && animal.traits.every(t => t.getDataModel().food === 0)
  )
};

export const TraitCnidocytes = {
  type: tt.TraitCnidocytes
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitCnidocytes, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , action: (game, defenceAnimal, traitCnidocytes, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(TraitCnidocytes.customFns.paralyze(game, defenceAnimal, traitCnidocytes, attackAnimal));
    dispatch(server$huntProcess(game.id));
  }
  , getErrorOfUseOnTarget: (game, sourceAnimal, targetTrait, targetAnimal) => {
    if (!(targetAnimal instanceof AnimalModel)) return ERRORS.TRAIT_TARGETING_TYPE_ANIMAL;
    return false
  }
  , customFns: {
    paralyze: (game, sourceAnimal, traitCnidocytes, targetAnimal) => dispatch => {
      const gameId = game.id;
      dispatch(server$traitStartCooldown(gameId, traitCnidocytes, sourceAnimal));
      logger.debug(`traitAddHuntingCallback: TraitCnidocytes`);
      dispatch(huntSetFlag(gameId, HUNT_FLAG.PARALYZE));
    }
  }
};

const recombinateTrait = (trait) => trait.set('value', false).set('disabled', false);

export const TraitRecombination = {
  type: tt.TraitRecombination
  , targetType: TRAIT_TARGET_TYPE.TWO_TRAITS
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitRecombination, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, sourceAnimal, traitRecombination1, [trait1, trait2]) => (dispatch, getState) => {
    const animal1 = sourceAnimal;
    const animal2 = traitRecombination1.findLinkedAnimal(game, sourceAnimal);
    const traitRecombination2 = traitRecombination1.findLinkedTrait(game);
    dispatch(server$traitAnimalRemoveTrait(game, animal1, trait1));
    dispatch(server$traitAnimalRemoveTrait(game, animal2, trait2));

    game = selectGame(getState, game.id);
    if (!trait2.getDataModel().checkTraitPlacementFails(game.locateAnimal(animal1.id, animal1.ownerId)))
      dispatch(server$traitAnimalAttachTrait(game, animal1, recombinateTrait(trait2)));
    if (!trait1.getDataModel().checkTraitPlacementFails(game.locateAnimal(animal2.id, animal2.ownerId)))
      dispatch(server$traitAnimalAttachTrait(game, animal2, recombinateTrait(trait1)));

    dispatch(server$traitStartCooldown(game.id, traitRecombination1, animal1));
    dispatch(server$traitStartCooldown(game.id, traitRecombination2, animal2));

    dispatch(server$tryNeoplasmDeath(game.id, animal1));
    dispatch(server$tryNeoplasmDeath(game.id, animal2));
    return true;
  }
  , _getErrorOfUse: (game, sourceAnimal, traitRecombination) => {
    const linkedAnimal = traitRecombination.findLinkedAnimal(game, sourceAnimal);
    if (
      TraitRecombination.getTargets(game, sourceAnimal).size === 0
      || TraitRecombination.getTargets(game, linkedAnimal).size === 0
    ) return ERRORS.TRAIT_ACTION_NO_TARGETS;
  }
  , getErrorOfUseOnTarget: (game, targetAnimal, targetTrait) => {
    if (targetTrait.getDataModel().hidden) return ERRORS.TRAIT_TARGETING_HIDDEN;
    if (targetTrait.isLinked()) return ERRORS.TRAIT_TARGETING_LINKED;
  }
  , getTargets: (game, targetAnimal, targetTrait) => targetAnimal.traits
    .filter(t => !TraitRecombination.getErrorOfUseOnTarget(game, targetAnimal, t))
    .toList()
};

export const TraitHerding = {type: tt.TraitHerding};
export const TraitMigration = {type: tt.TraitMigration};
export const TraitSuckerfish = {type: tt.TraitSuckerfish};