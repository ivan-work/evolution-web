import {Record} from 'immutable';

export const TARGETING_TYPE = (i => ({
  TO_ANIMAL    : 1 << i++
  , SELF       : 1 << i++
  , ENEMY      : 1 << i++
  , LINK_SELF  : 1 << i++
  , LINK_ENEMY : 1 << i++
}))(0);

export const CardCamouflage = {
  type: 'CardCamouflage'
  , name: 'Camouflage'
  , targeting: TARGETING_TYPE.SELF
  , trait: {
  }
  //onHunterTargets(hunter) {
  //  return hunter.check
  //}
};

export const CardCarnivorous = {
  type: 'CardCarnivorous'
  , name: 'Carnivorous'
  , targeting: TARGETING_TYPE.SELF
  , trait: {
    active: true
  }
};

export const CardSharpVision = {
  type: 'CardSharpVision'
  , name: 'Sharp Vision'
  , targeting: TARGETING_TYPE.SELF
};