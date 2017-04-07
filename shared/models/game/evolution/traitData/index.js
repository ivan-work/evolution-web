import {TRAIT_TARGET_TYPE, TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from '../constants';

export {TraitCarnivorous} from './TraitCarnivorous';

export const TraitParasite = {
  type: 'TraitParasite'
  , food: 2
};

export const TraitFatTissue = {
  type: 'TraitFatTissue'
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
};

export const TraitPiracy = {
  type: 'TraitPiracy'
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.PHASE
  , cooldownLink: 'TraitPiracy'
  , action: (target) => (getState, dispatch) => {
    // TODO target is animal
    if (this.checkTarget(target)) {
      // dispatch(traitStealFood)
    }
  }
  , checkAction: (game, sourceAnimal) => sourceAnimal.canEat()
  , checkTarget: (target) => target.canEat()
};

export const TraitTailLoss = {
  type: 'TraitTailLoss'
};

export const TraitCommunication = {
  type: 'TraitCommunication'
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
  , checkTarget: (target) => target.canEat()
};

export const TraitHighBodyWeight = {
  type: 'TraitHighBodyWeight'
  , food: 1
};

export const TraitHibernation = {
  type: 'TraitHibernation'
  , disableLastRound: true
  , cooldownPlace: TRAIT_COOLDOWN_PLACE.ANIMAL
  , cooldownDuration: TRAIT_COOLDOWN_DURATION.TWO_ROUNDS
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