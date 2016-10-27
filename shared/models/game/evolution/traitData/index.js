import {TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE} from '../constants';

import {
  server$startFeeding
} from '../../../../actions/actions';

export {TraitCarnivorous} from './TraitCarnivorous';


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
};

export const TraitMimicry = {
  type: 'TraitMimicry'
  , action: ({game, sourcePlayerId, sourceAnimal, targetPlayerId, targetAnimal}) => (dispatch, getState) => {
    //dispatch(askPlayer)
  }
};

export const TraitScavenger = {
  type: 'TraitScavenger'
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.ROUND
  , cooldownLink: 'TraitScavenger'
};

//

export const TraitSymbiosys = {
  type: 'TraitSymbiosys'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF_ONEWAY
};

export const TraitPiracy = {
  type: 'TraitPiracy'
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.TURN
  , cooldownLink: 'TraitPiracy'
  , action: (target) => (getState, dispatch) => {
    // TODO target is animal
    if (this.checkTarget(target)) {
      // dispatch(traitStealFood)
    }
  }
  , checkAction: (game, sourceAnimal) => sourceAnimal.needsFood() > 0
  , checkTarget: (game, sourceAnimal, targetAnimal) => targetAnimal.needOfNormalFood() > 0
};

export const TraitTailLoss = {
  type: 'TraitTailLoss'
};

export const TraitCommunication = {
  type: 'TraitCommunication'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , cooldownLink: 'TraitCommunication'
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.ACTIVATION
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  //, action: ({gameId, sourcePlayerId, sourceAnimal, targetPlayerId, targetAnimal}) => (dispatch, getState) => {
  //  animal.traits.filter(trait => trait.type === 'TraitCommunication')
  //    .forEach(trait => {
  //      dispatch(server$startFeeding(gameId, trait.linkAnimalId, 1, FOOD_SOURCE_TYPE.ANIMAL_COPY, animal.id));
  //    })
  //}
};

//

export const TraitGrazing = {
  type: 'TraitGrazing'
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.ROUND
  , cooldownLink: 'TraitGrazing'
  , action: (target) => (getState, dispatch) => {
    // TODO target is animal
    if (this.checkTarget(target)) {
      // dispatch(traitStealFood)
    }
  }
  , checkAction: (game, sourceAnimal) => game.food > 0
};

export const TraitHighBodyWeight = {
  type: 'TraitHighBodyWeight'
  , food: 1
};

export const TraitHibernation = {
  type: 'TraitHibernation'
  , disableLastRound: true
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.TWO_TURNS
  , cooldownLink: 'TraitHibernation'
};

export const TraitPoisonous = {
  type: 'TraitPoisonous'
};

//

export const TraitCooperation = {
  type: 'TraitCooperation'
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.ACTIVATION
  , cooldownLink: 'TraitCooperation'
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