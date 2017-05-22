import logger from '~/shared/utils/logger';
import {List, fromJS, OrderedMap} from 'immutable';
import {AnimalModel} from '../AnimalModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , CTT_PARAMETER
  , CARD_SOURCE
  , TRAIT_ANIMAL_FLAG
} from '../constants';

import {
  server$traitNotify_End
  , server$traitStartCooldown
  , server$traitAnimalAttachTrait
  , server$traitAnimalRemoveTrait
  , server$traitSetAnimalFlag
  , server$game
  , traitParalyze
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import * as tt from '../traitTypes';

export const TraitAedificator = {type: tt.TraitAedificator};

export const TraitNeoplasm = {
  type: tt.TraitNeoplasm
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , customFns: {
    canBeDisabled: (trait) => (!trait.getDataModel().hidden
    && !(trait.getDataModel().cardTargetType & CTT_PARAMETER.LINK))
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
  , action: (game, sourceAnimal, trait, targetAnimal) => (dispatch) => {
    dispatch(server$game(game.id, traitParalyze(game.id, targetAnimal.id)));
    return true;
  }
};

export const TraitRecombination = {
  type: tt.TraitRecombination
  , targetType: TRAIT_TARGET_TYPE.TWO_TRAITS
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitRecombination, TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, sourceAnimal, traitRecombination, [trait1, trait2]) => (dispatch, getState) => {
    const animal1 = sourceAnimal;
    const animal2 = TraitRecombination.getLinkedAnimal(game, sourceAnimal, traitRecombination);
    dispatch(server$traitAnimalRemoveTrait(game, animal1, trait1));
    dispatch(server$traitAnimalRemoveTrait(game, animal2, trait2));
    if (!trait1.getDataModel().checkTraitPlacementFails(selectGame(getState, game.id).locateAnimal(animal2.id).animal))
      dispatch(server$traitAnimalAttachTrait(game, animal2, trait1));
    if (!trait2.getDataModel().checkTraitPlacementFails(selectGame(getState, game.id).locateAnimal(animal1.id).animal))
      dispatch(server$traitAnimalAttachTrait(game, animal1, trait2));
    dispatch(server$traitStartCooldown(game.id, traitRecombination, animal1));
    dispatch(server$traitStartCooldown(game.id, traitRecombination, animal2));
    return false;
  }
  , $checkAction: (game, sourceAnimal, traitRecombination) => {
    const linkedAnimal = game.locateAnimal(
      sourceAnimal.id === traitRecombination.hostAnimalId
        ? traitRecombination.linkAnimalId
        : traitRecombination.hostAnimalId
    ).animal;
    return (TraitRecombination.getTargets(game, sourceAnimal).size > 0
    && TraitRecombination.getTargets(game, linkedAnimal).size > 0);
  }
  , checkTarget: (game, targetAnimal, targetTrait) => (!targetTrait.getDataModel().hidden
  && !(targetTrait.getDataModel().cardTargetType & CTT_PARAMETER.LINK)) // Copypaste of TraitNeoplasm =/
  , getTargets: (game, targetAnimal, targetTrait) => targetAnimal.traits
    .filter(t => TraitRecombination.checkTarget(null, null, t)).toList()
  , getLinkedAnimal: (game, animal, trait) => (game.locateAnimal(
      animal.id === trait.hostAnimalId
        ? trait.linkAnimalId
        : trait.hostAnimalId
    ).animal
  )
};

export const TraitHerding = {type: tt.TraitHerding};
export const TraitMigration = {type: tt.TraitMigration};
export const TraitSuckerfish = {type: tt.TraitSuckerfish};