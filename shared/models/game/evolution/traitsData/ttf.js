import logger from '~/shared/utils/logger';
import {fromJS} from 'immutable';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , TRAIT_ANIMAL_FLAG
} from '../constants';

import {
  server$startFeeding
  , server$traitActivate
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitGrazeFood
  , server$traitSetAnimalFlag
  , server$traitNotify_End
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import {endHunt} from './TraitCarnivorous';

export const TraitMetamorphose = {
  type: 'TraitMetamorphose'
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitMetamorphose', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitMetamorphose, targetTrait) => (dispatch, getState) => {
    dispatch(server$traitAnimalRemoveTrait(game, sourceAnimal, targetTrait));
    dispatch(server$traitStartCooldown(game.id, traitMetamorphose, sourceAnimal));

    const {animal} = selectGame(getState, game.id).locateAnimal(sourceAnimal.id, sourceAnimal.ownerId);
    dispatch(server$startFeeding(game.id, animal, 1, 'TraitMetamorphose'));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => sourceAnimal.canEat(game)
  , checkTarget: (game, sourceAnimal, targetTrait) => targetTrait.getDataModel().food === 0
  , getTargets: (game, sourceAnimal, traitMetamorphose) => sourceAnimal.traits.filter(trait => trait.getDataModel().food === 0)
};

export const TraitShell = {
  type: 'TraitShell'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    ['TraitShell', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, defenceAnimal, defenceTrait, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, defenceTrait, defenceAnimal));
    dispatch(server$traitSetAnimalFlag(game, defenceAnimal, TRAIT_ANIMAL_FLAG.SHELL, true));
    dispatch(endHunt(game, attackAnimal, attackTrait, defenceAnimal));
    return true;
  }
  , onRemove: (game, animal) => {
    dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.SHELL, false));
  }
};

export const TraitTrematode = {
  type: 'TraitTrematode'
  , cardTargetType: CARD_TARGET_TYPE.LINK_ENEMY
  , food: 1
};
export const TraitInkCloud = {
  type: 'TraitInkCloud'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    ['TraitInkCloud', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, defenceAnimal, defenceTrait, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, defenceTrait, defenceAnimal));
    dispatch(server$traitNotify_End(game.id, attackAnimal.id, attackTrait, defenceAnimal.id));
    return true;
  }
};

export const TraitSpecA = {
  type: 'TraitSpecA'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitSpecA', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, animal, trait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    dispatch(server$startFeeding(game.id, animal, 1, 'TraitSpecA'));
    return true;
  }
  , $checkAction: (game, animal, traitSpec) => (animal.canEat(game)
  && !game.players.some(player =>
    player.continent.some(animal =>
      animal.traits.some(trait => trait.id !== traitSpec.id && trait.type === traitSpec.type))))
};

export const TraitSpecB = {
  type: 'TraitSpecB'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitSpecB', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, animal, trait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    dispatch(server$startFeeding(game.id, animal, 1, 'TraitSpecA'));
    return true;
  }
  , $checkAction: (game, animal, traitSpec) => (animal.canEat(game)
  && !game.players.some(player =>
    player.continent.some(animal =>
      animal.traits.some(trait => trait.id !== traitSpec.id && trait.type === traitSpec.type))))
};

export const TraitFlight = {type: 'TraitFlight'};

export const TraitViviparous = {type: 'TraitViviparous'};
export const TraitAmbush = {type: 'TraitAmbush'};
export const TraitIntellect = {type: 'TraitIntellect'};
export const TraitAnglerfish = {type: 'TraitAnglerfish'};
