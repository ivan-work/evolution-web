export const TraitCarnivorous = {
  type: 'TraitCarnivorous'
  , name: 'Carnivorous'
  , food: 1
  , action: (target) => (getState, dispatch) => {
    // TODO target is animal
    if (this.canTarget(target)) {
      // dispatch(traitHuntAnimal)
      // dispatch(traitMimicryAsk)
      // dispatch(traitMimicryRequest)
      // dispatch(traitScavenger)
    }
  }
  , checkAction: () => this.getAnimal().canEat()
  , checkTarget: (targetAnimal) => (
    (this.getAnimal().hasTrait('TraitSharpVision') || !targetAnimal.hasTrait('TraitCamouflage'))
    && (this.getAnimal().hasTrait('TraitMassive') || !targetAnimal.hasTrait('TraitMassive'))
    && (!targetAnimal.canSurvive() || targetAnimal.hasTrait('TraitBurrowing'))
    && (
      (this.getAnimal().hasTrait('TraitSwimming') && targetAnimal.hasTrait('TraitSwimming'))
      || (!this.getAnimal().hasTrait('TraitSwimming') && !targetAnimal.hasTrait('TraitSwimming'))
    )
  )
  // , checkSuccess: (targetAnimal) => (
  //     (!targetAnimal.hasTrait('TraitFast'))
  // )
};

export const TraitSwimming = {
  type: 'TraitSwimming'
  , name: 'Swimming'
};

export const TraitRunning = {
  type: 'TraitRunning'
  , name: 'Running'
};

export const TraitMimicry = {
  type: 'TraitMimicry'
  , name: 'Mimicry'
};

export const TraitScavenger = {
  type: 'TraitScavenger'
  , name: 'Scavenger'
};

export const TraitSymbiosys = {
  type: 'TraitSymbiosys'
  , name: 'Symbiosys'
};

export const TraitPiracy = {
  type: 'TraitPiracy'
  , name: 'Piracy'
  , action: (target) => (getState, dispatch) => {
    // TODO target is animal
    if (this.canTarget(target)) {
      // dispatch(traitStealFood)
    }
  }
  , checkAction: () => this.getAnimal().canEat()
  , checkTarget: (target) => target.canEat()
};

export const TraitTailLoss = {
  type: 'TraitTailLoss'
  , name: 'Tail Loss'
};

export const TraitCommunication = {
  type: 'TraitCommunication'
  , name: 'Communication'
};




export const TraitGrazing = {
  type: 'TraitGrazing'
  , name: 'Grazing'
  , action: (target) => (getState, dispatch) => {
    // dispatch(traitDestroyFood())
  }
};

export const TraitCamouflage = {
  type: 'TraitCamouflage'
  , name: 'Camouflage'
};

export const TraitSharpVision = {
  type: 'TraitSharpVision'
  , name: 'Sharp Vision'
};

export const TraitMassive = {
  type: 'TraitMassive'
  , name: 'Massive'
  , food: 1
};