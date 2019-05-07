import Velocity from 'velocity-animate';
import * as localTraits from "./animationsTraits";

export const AT_LONG = 10000;
export const AT_MEDIUM = 500;
export const AT_SHORT = 250;
export const AT_DEATH = 500;

export default {
  gameFoodTake_Start: [
    (manager, {animalId}) => {
      const animalHTML = manager.getAnimal(animalId);
      const foodHTML = manager.getFoodContainer();
      if (animalHTML && foodHTML) {
        const animalbbx = animalHTML.getBoundingClientRect();
        const foodbbx = foodHTML.getBoundingClientRect();
        animalHTML.classList.add('animation-stoppable');
        return Velocity(animalHTML, {
          translateX: foodbbx.x + foodbbx.width / 2 - animalbbx.x - animalbbx.width / 2
          , translateY: foodbbx.y + foodbbx.height - animalbbx.y
        }, 500)
          .then(() => {
            const animalHTML = manager.getAnimal(animalId);
            if (animalHTML) animalHTML.classList.remove('animation-stoppable');
          });
      }
    }
  ]
  , gameFoodTake_End: [
    (manager, {animalId}) => {
      const animalHTML = manager.getAnimal(animalId);
      if (animalHTML) {
        return Velocity(animalHTML, {
          translateX: 0
          , translateY: 0
        }, 250)
      }
    }
  ]
  , traitNotify_Start: [
    (manager, actionData) => {
      const {traitId, traitType} = actionData;
      if (localTraits[traitType + '_Start']) {
        return localTraits[traitType + '_Start'](manager, actionData);
      } else {
        return localTraits.pingTrait(manager, actionData);
      }
    }
  ]
  , traitNotify_End: [
    (manager, actionData) => {
      const {traitType} = actionData;
      if (localTraits[traitType + '_End']) {
        return localTraits[traitType + '_End'](manager, actionData);
      }
    }
  ]
};