import {Record} from 'immutable';

export const TARGET_TYPE = (i => ({
  DROP_AS_ANIMAL : 1 << i++
  , ANIMAL_SELF  : 1 << i++
  , ANIMAL_ENEMY : 1 << i++
  , LINK_SELF    : 1 << i++
  , LINK_ENEMY   : 1 << i++
}))(0);

const ExampleCard = {
  type: 'string'
  , name: 'string'
  , targeting: TARGET_TYPE.DROP_AS_ANIMAL | TARGET_TYPE.DROP_AS_ANIMAL
  , trait: {
    active: false // Can/Cannot use ability
  }
};

export const CardCamouflage = {
  type: 'CardCamouflage'
  , name: 'Camouflage'
  , target: TARGET_TYPE.ANIMAL_SELF
  , trait: {
  }
  //onHunterTargets(hunter) {
  //  return hunter.check
  //}
};

export const CardCarnivorous = {
  type: 'CardCarnivorous'
  , name: 'Carnivorous'
  , target: TARGET_TYPE.ANIMAL_SELF
  , trait: {
    active: true
  }
};

export const CardSharpVision = {
  type: 'CardSharpVision'
  , name: 'Sharp Vision'
  , target: TARGET_TYPE.ANIMAL_SELF
};