import Velocity from 'velocity-animate';
import * as localTraits from "./animationsTraits";
import {FEEDING_SOURCE_TYPE} from "../../../shared/models/game/GameModel";

export const AT_LONG = 10000;
export const AT_MEDIUM = 500;
export const AT_SHORT = 250;
export const AT_DEATH = 500;

function moveAnimalToTargetHTML(animalHTML, targetHTML) {
  const animalbbx = animalHTML.getBoundingClientRect();
  const targetbbx = targetHTML.getBoundingClientRect();
  animalHTML.classList.add('onTop');
  animalHTML.classList.add('animation-stoppable');
  return Velocity(animalHTML, {
    translateX: targetbbx.x + targetbbx.width / 2 - animalbbx.x - animalbbx.width / 2
    , translateY: targetbbx.y + targetbbx.height - animalbbx.y
  }, 500);
}

export default {
  gameFoodTake_Start: [
    (manager, {feedingRecord: {targetAid, sourceType}}) => {
      if (sourceType === FEEDING_SOURCE_TYPE.GAME) {
        const animalHTML = manager.getAnimal(targetAid);
        const targetHTML = manager.getFoodContainer();
        if (animalHTML && targetHTML) {
          return moveAnimalToTargetHTML(
            animalHTML
            , targetHTML
          ).then(() => {
            const animalHTML = manager.getAnimal(targetAid);
            if (animalHTML) animalHTML.classList.remove('animation-stoppable');
          });
        }
      }
    }
    , (manager, {feedingRecord: {targetAid, sourceType, sourceId}}) => {
      if (sourceType === FEEDING_SOURCE_TYPE.PLANT) {
        const animalHTML = manager.getAnimal(targetAid);
        const targetHTML = manager.getPlant(sourceId);
        if (animalHTML && targetHTML) {
          return moveAnimalToTargetHTML(
            animalHTML
            , targetHTML
          ).then(() => {
            const animalHTML = manager.getAnimal(targetAid);
            if (animalHTML) animalHTML.classList.remove('animation-stoppable');
          });
        }
      }
    }
  ]
  , gameFoodTake_End: [
    (manager, {animalId}) => {
      const animalHTML = manager.getAnimal(animalId);
      if (animalHTML) {
        animalHTML.classList.remove('onTop');
        return Velocity(animalHTML, {
          translateX: 0
          , translateY: 0
        }, 250)
      }
    }
  ]
  , traitTakeCover: [
    (manager, {animalId, plantId}) => {
      const animalHTML = manager.getAnimal(animalId);
      const targetHTML = manager.getPlant(plantId);
      if (animalHTML && targetHTML) {
        return moveAnimalToTargetHTML(
          animalHTML
          , targetHTML
        ).then(() => {
          const animalHTML = manager.getAnimal(animalId);
          if (animalHTML) {
            animalHTML.classList.remove('animation-stoppable');
            animalHTML.classList.remove('onTop');
            return Velocity(animalHTML, {
              translateX: 0
              , translateY: 0
            }, 250)
          }
        });
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