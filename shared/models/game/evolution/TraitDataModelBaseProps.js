import {CARD_TARGET_TYPE, CTT_PARAMETER} from './constants';

const TraitDataModelBaseProps = {
  type: null // 'TraitFatTissuue', etc
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF // from CARD_TARGET_TYPE
  , targetType: null // from TRAIT_TARGET_TYPE
  , playerControllable: false // if player can click/drag trait
  , cooldowns: null // array of cooldown data arrays (checks before use, adds after use)
  , multiple: false // is allowed multiple traits with same type? (only for FatTissue)
  , transient: false // true - don't notify others about the trait activation and allow to activate it any time
  , hidden: false
  , action: null // action function
  , getTargets: null // get list of available target for an active trait (game, sourceAnimal) => list of targets
  , customFns: {} // Object of custom trait functions
};

export default TraitDataModelBaseProps;