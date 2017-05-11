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
  server$startFeeding
  , server$traitActivate
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitGrazeFood
  , server$traitSetAnimalFlag
  , server$traitSetValue
  , server$traitNotify_End
  , server$game
  , startCooldown
  , gameDeployAnimalFromDeck
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import {endHunt, endHuntNoCd, getStaticDefenses, getActiveDefenses, getAffectiveDefenses} from './TraitCarnivorous';
import * as tt from '../traitTypes';

const traitForNeoplasm = (t) => !t.disabled && !t.getDataModel().hidden && !(t.getDataModel().cardTargetType & CTT_PARAMETER.LINK);

export const TraitNeoplasm = {
  type: tt.TraitNeoplasm
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , action: (game, animal) => {
    const animalTraitArray = animal.traits.toArray();
    const index = animalTraitArray.findIndex((t) => t.type === tt.TraitNeoplasm);
    if (!~index) return animal;
    const nextIndex = animalTraitArray.findIndex((t, i) => {
      return i > index && traitForNeoplasm(t);
    });
    if (!~nextIndex) return null; // KILL
    const traitNeoplasm = animalTraitArray[index];
    console.log('processing neoplasm')
    // console.log(animal, animal.traits.toArray())
    animalTraitArray.splice(index, 1);
    animalTraitArray.splice(nextIndex, 0, traitNeoplasm);
    // console.log(animalTraitArray);
    animal = animal
      .set('traits', animalTraitArray.reduce((r, t, i) => {
        if (i < nextIndex && traitForNeoplasm(t)) {
          t = t.set('disabled', true).set('value', false);
        }
        return r.set(t.id, t);
      }, OrderedMap()))
      .recalculateFood();
    console.log(animal, animal.traits.toArray())
    console.log('end neoplasm')
    return animal;
  }
};