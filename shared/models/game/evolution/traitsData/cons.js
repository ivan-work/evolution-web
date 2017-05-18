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
  , server$game
  , traitParalyze
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import {endHunt, endHuntNoCd, getStaticDefenses, getActiveDefenses, getAffectiveDefenses} from './TraitCarnivorous';

import * as tt from '../traitTypes';

export const TraitAedificator = {type: tt.TraitAedificator};

export const TraitNeoplasm = {
  type: tt.TraitNeoplasm
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , actionMoveInAnimal: (animal) => {
    let animalTraitArray = animal.traits.toArray();
    const index = animalTraitArray.findIndex((t) => t.type === tt.TraitNeoplasm);
    if (!~index) return animal;
    const nextIndex = animalTraitArray.findIndex((t, i) => {
      return i > index && !t.disabled && t.getDataModel().canBeDisabled();
    });
    if (!~nextIndex) return null; // KILL
    const traitNeoplasm = animalTraitArray[index];
    animalTraitArray.splice(index, 1);
    animalTraitArray.splice(nextIndex, 0, traitNeoplasm);
    animalTraitArray = animalTraitArray.map(t => [t.id, t]);
    return animal.set('traits', OrderedMap(animalTraitArray));
  }
  , actionDisableTraitsInAnimal: (animal) => {
    let foundNeoplasm = false;
    if (!animal.hasTrait(tt.TraitNeoplasm)) return animal;
    return animal
      .update('traits', traits => traits
        .map((t) => {
          if (t.type === tt.TraitNeoplasm) {
            foundNeoplasm = true;
          } else if (!foundNeoplasm && !t.disabled && t.getDataModel().canBeDisabled()) {
            t = t.setDisabled(true);
          }
          return t;
        }))
      .recalculateFood();
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

export const TraitRecombination = {type: tt.TraitRecombination};

export const TraitHerding = {type: tt.TraitHerding};
export const TraitMigration = {type: tt.TraitMigration};
export const TraitSuckerfish = {type: tt.TraitSuckerfish};