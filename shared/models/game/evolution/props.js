import * as types from './constants' ;

export class PropSwimming extends Record({
  type: types.PROP_SWIMMING
}) {
  onPreAttack(hunter) {
    return hunter.hasProp(types.PROP_SWIMMING);
  }
}

export class PropRunning extends Record({
  type: types.PROP_RUNNING
}) {
  onAttack() {
    return (Math.floor(Math.random() * 6) > 2
      ? 2
      : -1);
  }
}

export class PropMimicry extends Record({
  type: types.PROP_MIMICRY
}) {
  onAttack(hunter, hook) {
    hook.eventMimicry();
  }
}

export class PropScavenger extends Record({
  type: types.PROP_SCAVENGER
}) {
  onScavengerRound() {
    return (this.animal.full());
  }
}

export class PropCarnivorous extends Record({
  type: types.PROP_CARNIVOROUS
}) {
}

export class PropCamouflage extends Record({
  type: types.PROP_CAMOUFLAGE
}) {
  onPreAttack(hunter) {
    return hunter.hasProp(types.PROP_SHARP_VISION);
  }
}

export class PropSharpVision extends Record({
  type: types.PROP_SHARP_VISION
}) {
}