import ReactDOM from 'react-dom';
import Velocity from 'velocity-animate'

import * as localTraits from './traits';

export default {
  traitNotify_Start: [
    (manager, actionData) => {
      const {sourceAid, traitId, traitType, targetId} = actionData;
      if (localTraits[traitType + '_Start']) {
        return localTraits[traitType + '_Start'](manager, actionData);
      } else {
        return localTraits.pingTrait(manager, traitId);
      }
    }
  ]
  , traitNotify_End: [
    (manager, actionData) => {
      const {sourceAid, traitId, traitType, targetId} = actionData;
      if (localTraits[traitType + '_End']) {
        return localTraits[traitType + '_End'](manager, actionData);
      }
    }
  ]
  , gameFoodTake_Start: [
    localTraits.gameFoodTake_Start
  ]
  , gameFoodTake_End: [
    localTraits.gameFoodTake_End
  ]
};