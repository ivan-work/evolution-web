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

import {getRandom} from '../../../../utils/randomGenerator';
import {checkAction} from '../TraitDataModel';

//

import {TraitCarnivorous, endHunt} from './TraitCarnivorous';

export {TraitCarnivorous};
export * from './tft';

export const TraitParasite = {
  type: 'TraitParasite'
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , food: 2
};

export const TraitFatTissue = {
  type: 'TraitFatTissue'
  , multiple: true
};

//

export const TraitSwimming = {
  type: 'TraitSwimming'
};

export const TraitRunning = {
  type: 'TraitRunning'
  , action: (game, runningAnimal, trait, attackAnimal) => (dispatch) => getRandom(0, 1) > 0
};

export const TraitMimicry = {
  type: 'TraitMimicry'
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldowns: fromJS([
    ['TraitMimicry', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , action: (game, mimicryAnimal, trait, newTargetAnimal, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, TraitMimicry, mimicryAnimal));
    return dispatch(server$traitActivate(game, attackAnimal, attackTrait, newTargetAnimal));
  }
  , getTargets: (game, attackAnimal, attackTraitData, mimicryAnimal) => {
    return game.getPlayer(mimicryAnimal.ownerId).continent.filter((animal) =>
      mimicryAnimal.id !== animal.id
      && attackAnimal.id !== animal.id
      //&& !animal.hasTrait('TraitMimicry')
      && (!animal.hasTrait('TraitMimicry') || animal.hasTrait('TraitMimicry') && checkAction(game, TraitMimicry, animal))
      && attackTraitData.checkTarget(game, attackAnimal, animal)
    );
  }
};

export const TraitScavenger = {
  type: 'TraitScavenger'
  , checkTraitPlacement: (animal) => !animal.hasTrait('TraitCarnivorous')
};

//

export const TraitSymbiosis = {
  type: 'TraitSymbiosis'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF_ONEWAY
};

export const TraitPiracy = {
  type: 'TraitPiracy'
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitPiracy', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, sourceAnimal, trait, targetAnimal) => dispatch => {
    dispatch(server$traitStartCooldown(game.id, TraitPiracy, sourceAnimal));
    dispatch(server$startFeeding(game.id, sourceAnimal, 1, 'TraitPiracy', targetAnimal.id));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => sourceAnimal.canEat(game)
  , checkTarget: (game, sourceAnimal, targetAnimal) => targetAnimal.food > 0
  && !(targetAnimal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) || targetAnimal.food >= targetAnimal.sizeOfNormalFood())
};

export const TraitTailLoss = {
  type: 'TraitTailLoss'
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , cooldowns: fromJS([
    ['TraitTailLoss', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , action: (game, targetAnimal, trait, targetTrait, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitAnimalRemoveTrait(game.id, targetAnimal, targetTrait.id));

    dispatch(server$startFeeding(game.id, attackAnimal, 1, 'TraitTailLoss', targetAnimal.id));

    dispatch(endHunt(game, attackAnimal, attackTrait, targetAnimal));
    return true;
  }
};

export const TraitCommunication = {
  type: 'TraitCommunication'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , cooldowns: fromJS([
    ['TraitCommunication', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: () => true
};

//

export const TraitGrazing = {
  type: 'TraitGrazing'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    ['TraitGrazing', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , playerControllable: true
  , action: (game, sourceAnimal) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, TraitGrazing, sourceAnimal));
    dispatch(server$traitGrazeFood(game.id, 1, sourceAnimal));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => game.food > 0
};

export const TraitMassive = {
  type: 'TraitMassive'
  , food: 1
};

export const TraitHibernation = {
  type: 'TraitHibernation'
  , cooldowns: fromJS([
    ['TraitHibernation', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TWO_TURNS]
  ])
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , action: (game, sourceAnimal) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, TraitHibernation, sourceAnimal));
    dispatch(server$traitSetAnimalFlag(game, sourceAnimal, TRAIT_ANIMAL_FLAG.HIBERNATED));
    return false;
  }
  , $checkAction: (game, sourceAnimal) => sourceAnimal.canEat(game) && game.deck.size > 0
};

export const TraitPoisonous = {
  type: 'TraitPoisonous'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , action: (game, sourceAnimal, trait, targetAnimal) => (dispatch) => {
    dispatch(server$traitSetAnimalFlag(game, targetAnimal, TRAIT_ANIMAL_FLAG.POISONED))
    return true;
  }
};

//

export const TraitCooperation = {
  type: 'TraitCooperation'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , cooldowns: fromJS([
    ['TraitCooperation', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: () => true
};

export const TraitBurrowing = {
  type: 'TraitBurrowing'
};

export const TraitCamouflage = {
  type: 'TraitCamouflage'
};

export const TraitSharpVision = {
  type: 'TraitSharpVision'
};