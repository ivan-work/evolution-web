import logger from '~/shared/utils/logger';
import {List, fromJS} from 'immutable';
import {AnimalModel} from '../AnimalModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
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

export const TraitNeoplasm = {
  type: tt.TraitNeoplasm
  , cardTargetType: CARD_TARGET_TYPE.ENEMY
};