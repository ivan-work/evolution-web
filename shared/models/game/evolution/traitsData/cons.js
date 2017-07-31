import logger from '~/shared/utils/logger';
import {List, fromJS, OrderedMap} from 'immutable';
import {AnimalModel} from '../AnimalModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , CARD_TARGET_TYPE
} from '../constants';

import {
  server$traitNotify_End
  , server$traitStartCooldown
  , server$traitAnimalAttachTrait
  , server$traitAnimalRemoveTrait
  , traitAddHuntingCallback
  , server$traitActivate
  , server$game
  , traitParalyze
  , server$tryNeoplasmDeath
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import * as tt from '../traitTypes';

export const TraitAedificator = {type: tt.TraitAedificator};

export const TraitNeoplasm = {
  type: tt.TraitNeoplasm
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , customFns: {
    canBeDisabled: (trait) => (!trait.getDataModel().hidden && !trait.isLinked())
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
    return dispatch(server$traitActivate(game, attackAnimal, attackTrait, defenceAnimal));
  }
  , customFns: {
    paralyze: (game, sourceAnimal, traitCnidocytes, targetAnimal) => dispatch => {
      const gameId = game.id;
      dispatch(server$traitStartCooldown(gameId, traitCnidocytes, sourceAnimal));
      dispatch(traitAddHuntingCallback(gameId, (game) => (dispatch, getState) => {
        dispatch(server$game(gameId, traitParalyze(game.id, targetAnimal.id)));
      }));
    }
  }
};

const recombinateTrait = (trait) => trait.set('value', false).set('disabled', false);
const recombinateAnimalTrait = (game, animal, traitRecombination, trait1, trait2) => (dispatch, getState) => {
  dispatch(server$traitAnimalRemoveTrait(game, animal, trait1));

  game = selectGame(getState, game.id);
  animal = game.locateAnimal(animal.id, animal.ownerId);
  if (!trait2.getDataModel().checkTraitPlacementFails(animal)) {
    dispatch(server$traitAnimalAttachTrait(game, animal, recombinateTrait(trait2)));
  }
  dispatch(server$traitStartCooldown(game.id, traitRecombination, animal));

  dispatch(server$tryNeoplasmDeath(game.id, animal));
};
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
  , $checkAction: (game, sourceAnimal, traitRecombination) => {
    const linkedAnimal = traitRecombination.findLinkedAnimal(game, sourceAnimal);
    return (TraitRecombination.getTargets(game, sourceAnimal).size > 0
    && TraitRecombination.getTargets(game, linkedAnimal).size > 0);
  }
  , checkTarget: (game, targetAnimal, targetTrait) => (!targetTrait.getDataModel().hidden && !(targetTrait.isLinked())) // Copypaste of TraitNeoplasm =/
  , getTargets: (game, targetAnimal, targetTrait) => targetAnimal.traits
    .filter(t => TraitRecombination.checkTarget(null, null, t)).toList()
};

export const TraitHerding = {type: tt.TraitHerding};
export const TraitMigration = {type: tt.TraitMigration};
export const TraitSuckerfish = {type: tt.TraitSuckerfish};