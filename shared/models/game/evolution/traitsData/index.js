import {fromJS} from 'immutable';
import {PHASE} from '../../GameModel';
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
  , server$traitConvertFat
  , server$tryViviparous
} from '../../../../actions/actions';

import {getRandom} from '../../../../utils/randomGenerator';

import * as tt from '../traitTypes';

import {TraitCarnivorous, endHunt} from './TraitCarnivorous';

export {TraitCarnivorous};
export * from './ttf';
export * from './cons';
export * from './bonus';

export const TraitWaiter = {
  type: tt.TraitWaiter
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([[tt.TraitWaiter, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]])
  , action: () => (dispatch) => true
};

export const TraitParasite = {
  type: tt.TraitParasite
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , food: 2
};

export const TraitFatTissue = {
  type: tt.TraitFatTissue
  , multiple: true
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitFatTissue, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitFatTissue) => (dispatch) => {
    dispatch(server$traitConvertFat(game.id, sourceAnimal, traitFatTissue));
    dispatch(server$traitStartCooldown(game.id, traitFatTissue, sourceAnimal));
    return true;
  }
  , $checkAction: (game, sourceAnimal, trait) => trait.value && !sourceAnimal.isSaturated()
};

//

export const TraitSwimming = {
  type: tt.TraitSwimming
};

export const TraitRunning = {
  type: tt.TraitRunning
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitRunning, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , action: (game, defenceAnimal, traitRunning, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitRunning, defenceAnimal));
    if (getRandom(0, 1) > 0) {
      dispatch(endHunt(game, attackAnimal, attackTrait, defenceAnimal));
      return true;
    } else {
      return dispatch(server$traitActivate(game, attackAnimal, attackTrait, defenceAnimal));
    }
  }
};

export const TraitMimicry = {
  type: tt.TraitMimicry
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldowns: fromJS([
    [tt.TraitMimicry, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , action: (game, mimicryAnimal, traitMimicry, newTargetAnimal, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, traitMimicry, mimicryAnimal));
    return dispatch(server$traitActivate(game, attackAnimal, attackTrait, newTargetAnimal));
  }
  , getTargets: (game, attackAnimal, attackTraitData, mimicryAnimal) => {
    return game.getPlayer(mimicryAnimal.ownerId).continent.filter((animal) =>
      mimicryAnimal.id !== animal.id
      && attackAnimal.id !== animal.id
      //&& !animal.hasTrait(tt.TraitMimicry)
      //&& (!animal.hasTrait(tt.TraitMimicry) || animal.hasTrait(tt.TraitMimicry) && animal.hasTrait(tt.TraitMimicry).checkAction(game, animal))
      && attackTraitData.checkTarget(game, attackAnimal, animal)
    ).toList();
  }
};

export const TraitScavenger = {
  type: tt.TraitScavenger
  , checkTraitPlacement: (animal) => !animal.hasTrait(tt.TraitCarnivorous, true)
};

//

export const TraitSymbiosis = {
  type: tt.TraitSymbiosis
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF_ONEWAY
};

export const TraitPiracy = {
  type: tt.TraitPiracy
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitPiracy, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, sourceAnimal, traitPiracy, targetAnimal) => dispatch => {
    dispatch(server$traitStartCooldown(game.id, traitPiracy, sourceAnimal));
    dispatch(server$startFeeding(game.id, sourceAnimal.id, 1, tt.TraitPiracy, targetAnimal.id));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => sourceAnimal.canEat(game) && sourceAnimal.getNeededFood() > 0
  , checkTarget: (game, sourceAnimal, targetAnimal) => targetAnimal.food > 0 && !targetAnimal.isSaturated()
};

export const TraitTailLoss = {
  type: tt.TraitTailLoss
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , cooldowns: fromJS([
    [tt.TraitTailLoss, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , getTargets: (game, attackAnimal, attackTraitData, defenseAnimal) => defenseAnimal.getTraits()
    .toList()
    .filter(t => t.type !== tt.TraitTrematode)
  , action: (game, targetAnimal, trait, targetTrait, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitAnimalRemoveTrait(game, targetAnimal, targetTrait));

    dispatch(server$startFeeding(game.id, attackAnimal.id, 1, tt.TraitTailLoss, targetAnimal.id));

    dispatch(endHunt(game, attackAnimal, attackTrait, targetAnimal));
    return true;
  }
};

export const TraitCommunication = {
  type: tt.TraitCommunication
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , cooldowns: fromJS([
    [tt.TraitCommunication, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: () => true
};

//

export const TraitGrazing = {
  type: tt.TraitGrazing
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    [tt.TraitGrazing, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitGrazing) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitGrazing, sourceAnimal));
    dispatch(server$traitGrazeFood(game.id, 1, sourceAnimal));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => game.food > 0
};

export const TraitMassive = {
  type: tt.TraitMassive
  , food: 1
};

export const TraitHibernation = {
  type: tt.TraitHibernation
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , cooldowns: fromJS([
    [tt.TraitHibernation, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TWO_TURNS]
  ])
  , action: (game, sourceAnimal, traitHibernation) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitHibernation, sourceAnimal));
    dispatch(server$traitSetAnimalFlag(game, sourceAnimal, TRAIT_ANIMAL_FLAG.HIBERNATED));
    dispatch(server$tryViviparous(game.id, sourceAnimal.id));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => !sourceAnimal.isFull() && game.deck.size > 0
  , customFns: {
    onRemove: (game, animal) => (dispatch) => {
      dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.HIBERNATED, false))
    }
  }
};

export const TraitPoisonous = {
  type: tt.TraitPoisonous
  , targetType: TRAIT_TARGET_TYPE.NONE
  , action: (game, sourceAnimal, trait, targetAnimal) => (dispatch) => {
    dispatch(server$traitSetAnimalFlag(game, targetAnimal, TRAIT_ANIMAL_FLAG.POISONED));
    return true;
  }
};

//

export const TraitCooperation = {
  type: tt.TraitCooperation
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , cooldowns: fromJS([
    [tt.TraitCooperation, TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: () => true
  , $checkAction: (game) => game.food > 0
};

export const TraitBurrowing = {
  type: tt.TraitBurrowing
};

export const TraitCamouflage = {
  type: tt.TraitCamouflage
};

export const TraitSharpVision = {
  type: tt.TraitSharpVision
};