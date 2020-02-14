import logger from '~/shared/utils/logger';
import uuid from 'uuid';
import {ActionCheckError} from '../models/ActionCheckError';
import {getTraitDataModel, TraitModel} from '../models/game/evolution/TraitModel';
import {TraitNeoplasm} from '../models/game/evolution/traitsData';

import {SETTINGS_TIMED_OUT_TURN_TIME} from '../models/game/GameSettings';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , TRAIT_ANIMAL_FLAG
  , ANIMAL_DEATH_REASON, HUNT_FLAG
} from '../models/game/evolution/constants';

import {server$game, to$} from './generic';
import {doesPlayerHasOptions} from './ai';
import {
  server$gameEndTurn
  , server$addTurnTimeout
  , server$gameCancelTurnTimeout
  , animalDeath
  , server$gameStartPhase
  , server$playerActed
} from './actions';
import ERRORS from './errors'

import {selectRoom, selectGame, selectUsersInGame} from '../selectors';

import {GameModel, PHASE, QuestionRecord, AmbushRecord, FeedingRecord, AREA} from '../models/game/GameModel';
import * as tt from '../models/game/evolution/traitTypes';

import {
  checkGameDefined
  , checkGameHasUser
  , checkGamePhase
  , checkPlayerHasAnimal
  , checkPlayerCanAct
  , throwError
  , passesChecks, checkGameHasPlant
} from './checks';

import {
  getErrorOfAnimalEatingFromGame
  , checkTraitActivation
  , checkAnimalCanTakeShellFails
  , checkIfTraitDisabledByIntellect
  , getErrorOfAnimalEatingFromPlant
  , getErrorOfPlantCounterAttack
  , checkTraitActivation_Target
  , getErrorOfAnimalTakingCover
  , getErrorOfAnimalEatingFromPlantNoCD
} from './trait.checks';

import {addTimeout, cancelTimeout} from '../utils/reduxTimeout';
import {findDefaultActiveDefence} from "../models/game/evolution/traitsData/TraitCarnivorous";
import {
  huntSetFlag
  , server$huntProcess
  , server$huntStart_Plant
} from "../models/game/evolution/traitsData/hunt";
import * as ptt from "../models/game/evolution/plantarium/plantTraitTypes";
import {logTarget} from "./log.util";
import {server$takeCardFromRandomPlayer} from "./game.plantarium";
import {CooldownList} from "../models/game/CooldownList";

/**
 * Activation
 */

export const traitTakeFoodRequest = (animalId, plantId) => (dispatch, getState) => dispatch({
  type: 'traitTakeFoodRequest'
  , data: {gameId: getState().get('game').id, animalId, plantId}
  , meta: {server: true}
});

export const traitActivateRequest = (sourceAid, traitId, ...targets) => (dispatch, getState) => dispatch({
  type: 'traitActivateRequest'
  , data: {gameId: getState().get('game').id, sourceAid, traitId, targets}
  , meta: {server: true}
});

export const server$traitActivate = (gameId, sourceAid, trait, ...targets) => (dispatch, getState) => {
  const logTargets = (targets || []).reduce(logTarget, []);
  const game = selectGame(getState, gameId);
  const sourceEntity = game.locateAnimal(sourceAid) || game.getPlant(sourceAid);
  if (!trait.getDataModel().transient) {
    dispatch(server$traitNotify_Start(game, sourceEntity, trait, ...logTargets));
  }
  logger.verbose('server$traitActivate:', sourceEntity.id, trait.type, ...logTargets);
  const traitData = trait.getDataModel();
  const result = dispatch(traitData.action(game, sourceEntity, trait, ...targets));
  logger.debug(`server$traitActivate [RESULT]: ${trait.type} (${!!result})`);
  return result;
};

export const traitTakeShellRequest = (animalId, traitId) => (dispatch, getState) => dispatch({
  type: 'traitTakeShellRequest'
  , data: {gameId: getState().get('game').id, animalId, traitId}
  , meta: {server: true}
});

export const traitTakeCoverRequest = (animalId, plantId) => (dispatch, getState) => dispatch({
  type: 'traitTakeCoverRequest'
  , data: {gameId: getState().get('game').id, animalId, plantId}
  , meta: {server: true}
});

export const traitTakeCover = (gameId, animalId, plantId) => ({
  type: 'traitTakeCover'
  , data: {gameId, animalId, plantId}
});

// region Cooldowns
// Transport action
export const startCooldown = (gameId, link, duration, place, placeId) => ({
  type: 'startCooldown'
  , data: {gameId, link, duration, place, placeId}
});

export const startCooldownList = (list) => ({
  type: 'startCooldownList'
  , data: {list}
});

export const clearCooldown = (gameId, link, place, placeId) => ({
  type: 'clearCooldown'
  , data: {gameId, link, place, placeId}
});

const traitMakeCooldownActions = (gameId, trait, sourceAnimal) => {
  const traitData = trait.getDataModel();
  if (!traitData.cooldowns) return []; //Protection against symbiosis
  return traitData.cooldowns.map(([link, place, duration]) => {
    const placeId = (place === TRAIT_COOLDOWN_PLACE.PLAYER ? sourceAnimal.ownerId
      : place === TRAIT_COOLDOWN_PLACE.TRAIT ? trait.id
        : sourceAnimal.id);
    return startCooldown(gameId, link, duration, place, placeId);
  }).toArray();
};

export const server$traitStartCooldown = (gameId, trait, sourceAnimal) => {
  logger.debug('server$traitStartCooldown:', sourceAnimal.id, trait.type);
  return server$startCooldownList(gameId, traitMakeCooldownActions(gameId, trait, sourceAnimal));
};

export const server$startCooldownList = (gameId, list) => (dispatch) => {
  dispatch(shared$startCooldownList(list));
  dispatch(server$game(gameId, startCooldownList(list)));
};

const shared$startCooldownList = (list) => (dispatch) => list.forEach(cooldownAction => dispatch(cooldownAction));

export const getFeedingCooldownList = (gameId, playerId) => [
  startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, playerId)
  , startCooldown(gameId, tt.TraitCarnivorous, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, playerId)
];
// endregion

/**
 * Local Traits
 */

const traitConvertFat = (gameId, sourceAid, traitId) => ({
  type: 'traitConvertFat'
  , data: {gameId, sourceAid, traitId}
});

export const server$traitConvertFat = (gameId, sourceAnimal, trait) => (dispatch) => {
  dispatch(server$game(gameId, traitConvertFat(gameId, sourceAnimal.id, trait.id)));
  dispatch(server$activateViviparous(gameId, sourceAnimal.id));
};

const traitMoveFood = (gameId, animalId, amount, sourceType, sourceId) => ({
  type: 'traitMoveFood'
  , data: {gameId, animalId, amount, sourceType, sourceId}
});

const traitGrazeFood = (gameId, food, sourceAid) => ({
  type: 'traitGrazeFood'
  , data: {gameId, food, sourceAid}
});

export const server$traitGrazeFood = (gameId, food, sourceAnimal) =>
  server$game(gameId, traitGrazeFood(gameId, food, sourceAnimal.id));

const traitSetAnimalFlag = (gameId, sourceAid, flag, on) => ({
  type: 'traitSetAnimalFlag'
  , data: {gameId, sourceAid, flag, on}
});

export const server$traitSetAnimalFlag = (game, sourceAnimal, flag, on = true) =>
  server$game(game.id, traitSetAnimalFlag(game.id, sourceAnimal.id, flag, on));

const traitSetValue = (gameId, sourceAid, traitId, value) => ({
  type: 'traitSetValue'
  , data: {gameId, sourceAid, traitId, value}
});

// TODO Remove and rewrite calls to traitSetValue with IDs. Because this one is bad fn =\
export const server$traitSetValue = (game, sourceAnimal, trait, value) => (dispatch) => {
  const action = traitSetValue(game.id, sourceAnimal.id, trait.id, value);
  if (trait.getDataModel().transient) {
    dispatch(to$({userId: sourceAnimal.ownerId}, action));
  } else {
    dispatch(server$game(game.id, action));
  }
};

export const server$traitKillAnimal = (gameId, sourceAnimal, targetAnimal) => (dispatch, getState) => {
  if (targetAnimal.hasTrait(tt.TraitRegeneration)) {
    dispatch(server$game(gameId, traitSetAnimalFlag(gameId, targetAnimal.id, TRAIT_ANIMAL_FLAG.REGENERATION, true)));
    dispatch(server$game(gameId, traitParalyze(gameId, targetAnimal.id)));
  } else {
    dispatch(server$game(gameId, animalDeath(gameId, ANIMAL_DEATH_REASON.KILL, targetAnimal.id)));
  }
};

// region traitAnimalAttachTrait
const traitAnimalAttachTrait = (gameId, sourcePid, sourceAid, trait) => ({
  type: 'traitAnimalAttachTrait'
  , data: {gameId, sourcePid, sourceAid, trait}
});

export const server$traitAnimalAttachTrait = (game, animal, trait) =>
  server$game(game.id, traitAnimalAttachTrait(game.id, animal.ownerId, animal.id, trait));

export const traitAnimalRemoveTrait = (gameId, sourcePid, sourceAid, traitId) => ({
  type: 'traitAnimalRemoveTrait'
  , data: {gameId, sourcePid, sourceAid, traitId}
});

export const server$traitAnimalRemoveTrait = (game, animal, trait) => (dispatch) => {
  logger.debug('server$traitAnimalRemoveTrait');
  const dataModel = trait.getDataModel();
  if (!!dataModel && !!dataModel.customFns && dataModel.customFns.onRemove) {
    dispatch(dataModel.customFns.onRemove(game, animal, trait));
  }
  dispatch(server$game(game.id, traitAnimalRemoveTrait(game.id, animal.ownerId, animal.id, trait.id)));
};
// endregion

const traitAnimalRecombinateTraits = (gameId, player1id, player2id, animal1id, animal2id, trait1id, trait2id) => ({
  type: 'traitAnimalRecombinateTraits'
  , data: {gameId, player1id, player2id, animal1id, animal2id, trait1id, trait2id}
});
export const server$traitAnimalRecombinateTraits = (gameId, animal1, animal2, trait1, trait2) =>
  server$game(gameId, traitAnimalRecombinateTraits(
    gameId
    , animal1.ownerId
    , animal2.ownerId
    , animal1.id
    , animal2.id
    , trait1.id
    , trait2.id));

// region traitAttachToPlant
const traitAttachToPlant = (gameId, plantId, trait) => ({
  type: 'traitAttachToPlant'
  , data: {gameId, plantId, trait}
});

export const server$traitAttachToPlant = (gameId, plantId, trait) =>
  server$game(gameId, traitAttachToPlant(gameId, plantId, trait));

const traitDetachFromPlant = (gameId, plantId, traitId) => ({
  type: 'traitDetachFromPlant'
  , data: {gameId, plantId, traitId}
});

export const server$traitDetachFromPlant = (gameId, plantId, traitId) => (dispatch) => {
  logger.debug('server$traitDetachFromPlant');
  const game = selectGame(getState, gameId);
  const plant = game.getPlant(plantId);
  const trait = game.locateTrait(traitId, plantId);
  const dataModel = trait.getDataModel();
  if (!!dataModel && !!dataModel.customFns && dataModel.customFns.onRemove) {
    dispatch(dataModel.customFns.onRemove(game, animal, trait));
  }
  dispatch(server$game(game.id, traitDetachFromPlant(game.id, animal.ownerId, animal.id, trait.id)));
};
// endregion

const traitTakeShell = (gameId, continentId, animalId, trait) => ({
  type: 'traitTakeShell'
  , data: {gameId, continentId, animalId, trait}
});

// remove after 1.0.23
// export const server$tryViviparous = (gameId, animalId) => (dispatch, getState) => {
//   return passesChecks(() => {
//     const game = selectGame(getState, gameId);
//     const animal = game.locateAnimal(animalId);
//     const trait = checkTraitActivation(game, animal, tt.TraitViviparous);
//     return dispatch(server$traitActivate(gameId, animalId, trait));
//   })
// };

export const server$activateViviparous = (gameId, animalId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const animal = game.locateAnimal(animalId);
  if (!animal) return;
  const trait = animal.hasTrait(tt.TraitViviparous);
  if (!trait) return;
  const error = trait.getErrorOfUse(game, animal);
  if (error) return;
  dispatch(server$traitActivate(gameId, animalId, trait));
};

export const server$tryNeoplasmDeath = (gameId, sourceAnimal) => (dispatch, getState) => {
  logger.debug('server$tryNeoplasmDeath');
  const game = selectGame(getState, gameId);
  const animal = game.locateAnimal(sourceAnimal.id, sourceAnimal.ownerId);
  if (animal) {
    if (TraitNeoplasm.customFns.shouldKillAnimal(animal)) {
      dispatch(server$game(gameId, animalDeath(gameId, ANIMAL_DEATH_REASON.NEOPLASM, animal.id)));
    }
  }
};

export const traitParalyze = (gameId, animalId) => ({
  type: 'traitParalyze'
  , data: {gameId, animalId}
});

export const server$autoFoodSharing = (gameId, userId) => (dispatch, getState) => {
  // logger.debug(`server$autoFoodSharing`);
  let game = selectGame(getState, gameId);
  let sharedFood = 0;
  let autoFeedingResult = true;
  game.getPlayer(userId).someAnimal(animal => animal.getTraits()
    .some(trait => {
      game = selectGame(getState, gameId);
      // console.log('checking for autoshare', animal.id, trait.value)
      if ((trait.type === tt.TraitCooperation || trait.type === tt.TraitCommunication)
        && !trait.getErrorOfUse(game, animal)) {
        // console.log(`AUTO FOOD FOR ${animal.id}`)
        const result = dispatch(server$traitActivate(gameId, animal.id, trait));
        // console.log(`AUTO FOOD FOR ${animal.id} RESULT: ${result}`)
        if (result) {
          sharedFood++;
        } else {
          autoFeedingResult = false;
          return true;
        }
      }
    }));
  logger.debug(`server$autoFoodSharing: shared ${sharedFood} food`);
  if (sharedFood > 0) {
    return dispatch(server$autoFoodSharing(gameId, userId));
  } else {
    return autoFeedingResult;
  }
};

/**
 * AMBUSH
 * gameAmbushPrepareStart > gameAmbushPrepareEnd > gameAmbushAttackStart > gameAmbushAttackEnd
 * */

const makeAmbushPhaseTimeoutId = (gameId) => `Phase#Ambush#${gameId}`;

export const traitAmbushActivateRequest = (animalId, on = true) => (dispatch, getState) => dispatch({
  type: 'traitAmbushActivateRequest'
  , data: {gameId: getState().getIn(['game', 'id']), animalId, on}
  , meta: {server: true}
});

export const traitAmbushContinueRequest = () => (dispatch, getState) => dispatch({
  type: 'traitAmbushContinueRequest'
  , data: {gameId: getState().getIn(['game', 'id'])}
  , meta: {server: true}
});

export const traitAmbushActivate = (gameId, animalId, on) => ({
  type: 'traitAmbushActivate'
  , data: {gameId, animalId, on}
});

const server$traitAmbushActivate = (gameId, animalId, on) => (dispatch, getState) => {
  dispatch(server$game(gameId, traitAmbushActivate(gameId, animalId, on)));
  if (selectGame(getState, gameId).ambush.ambushers.every((ambush) => ambush !== null)) {
    dispatch(server$gameAmbushPrepareEnd(gameId));
  }
};

const gameAmbushPushTarget = (gameId, feedingRecord) => ({
  type: 'gameAmbushPushTarget'
  , data: {gameId, feedingRecord}
});

const gameAmbushShiftTarget = (gameId) => ({
  type: 'gameAmbushShiftTarget'
  , data: {gameId}
});

const gameAmbushSetAmbushers = (gameId, ambushers) => ({
  type: 'gameAmbushSetAmbushers'
  , data: {gameId, ambushers}
});

const gameAmbushPrepareStart = (gameId, turnRemainingTime) => ({
  type: 'gameAmbushPrepareStart'
  , data: {gameId, turnRemainingTime}
});

const gameAmbushPrepareEnd = (gameId) => ({
  type: 'gameAmbushPrepareEnd'
  , data: {gameId}
});

const getAmbushersList = (game, targetAnimal) => {
  logger.debug(`ambush/getAmbushersList/ Checking ${targetAnimal.id} for ambushers`);
  let ambushers = [];

  game.sortPlayersFromIndex(game.players, game.getPlayer(targetAnimal.ownerId).index)
    .some(p => p.someAnimal((attackAnimal) => {
      if (!p.playing) return;
      if (attackAnimal.ownerId === targetAnimal.ownerId) return; // Can't ambush self

      const traitAmbush = attackAnimal.hasTrait(tt.TraitAmbush);
      const traitCarnivorous = attackAnimal.hasTrait(tt.TraitCarnivorous);
      if (!traitAmbush || !traitCarnivorous) return;

      if (game.cooldowns.checkFor(tt.TraitCarnivorous, null, attackAnimal.id, traitCarnivorous.id)) return;

      if (!!traitCarnivorous.getErrorOfUse(game, attackAnimal)) return;

      if (!!traitCarnivorous.getDataModel().getErrorOfUseOnTarget(game, attackAnimal, targetAnimal)) return;

      ambushers.push(attackAnimal.id);
    }));

  return ambushers;
};

export const server$gameAmbushPrepareStart = (gameId, ambushers, feedingRecord) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const targetAnimal = game.locateAnimal(feedingRecord.targetAid, feedingRecord.targetPid);

  logger.verbose(`ambush/server$gameAmbushPrepareStart/ ${targetAnimal.id} is possibly ambushed by ${ambushers}`);

  if (game.status.phase !== PHASE.AMBUSH) {
    const turnRemainingTime = dispatch(server$gameCancelTurnTimeout(gameId));
    dispatch(server$gameStartPhase(gameId, PHASE.AMBUSH));
    dispatch(server$game(gameId, gameAmbushPrepareStart(gameId, turnRemainingTime)));
    dispatch(gameAmbushPushTarget(gameId, feedingRecord));
  }

  dispatch(server$game(gameId, gameAmbushSetAmbushers(gameId, ambushers)));

  dispatch(addTimeout(game.settings.timeAmbush
    , makeAmbushPhaseTimeoutId(gameId)
    , (dispatch) => dispatch(server$gameAmbushPrepareEnd(gameId))));
};

export const server$gameAmbushPrepareEnd = (gameId) => (dispatch, getState) => {
  logger.debug(`server$gameAmbushPrepareEnd`);
  dispatch(cancelTimeout(makeAmbushPhaseTimeoutId(gameId)));
  dispatch(server$game(gameId, gameAmbushPrepareEnd(gameId)));
  dispatch(server$gameAmbushAttackStart(gameId));
};

const gameAmbushAttackStart = (gameId) => ({
  type: 'gameAmbushAttackStart'
  , data: {gameId}
});

const gameAmbushAttackEnd = (gameId) => ({
  type: 'gameAmbushAttackEnd'
  , data: {gameId}
});

export const server$gameAmbushAttackStart = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  logger.debug(`server$gameAmbushAttackStart: ${game.ambush.targets.toArray().map(({targetAid}) => `${targetAid}`)}`);
  dispatch(server$game(gameId, gameAmbushAttackStart(gameId)));

  const nextAmbusherId = game.ambush.ambushers.keyOf(true);
  logger.debug(`server$gameAmbushAttackStart/nextAmbusherId: ${nextAmbusherId}`);
  if (nextAmbusherId) {
    dispatch(server$traitAmbushPerform(gameId, nextAmbusherId))
  } else {
    dispatch(server$gameAmbushAttackEnd(gameId));
  }
};

export const server$traitAmbushPerform = (gameId, attackAnimalId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const ambushTarget = game.ambush.targets.first();
  const targetAnimal = game.locateAnimal(ambushTarget.targetAid, ambushTarget.targetPid);
  const attackAnimal = game.locateAnimal(attackAnimalId);
  logger.debug(`server$traitAmbushPerform: ${attackAnimalId} > ${ambushTarget.targetAid}`);
  if (targetAnimal && attackAnimal) {
    try {
      const traitCarnivorous = attackAnimal.hasTrait(tt.TraitCarnivorous);
      if (!traitCarnivorous) {
        throw new ActionCheckError(`server$traitAmbushPerform@Game(${game.id})`
          , 'Animal(%s) has no traitCarnivorous', attackAnimal.id); // refactor checkTraitActivation to get rid of this
      }
      throwError(traitCarnivorous.getErrorOfUse(game, attackAnimal, targetAnimal.id));
      checkTraitActivation_Target(game, attackAnimal, traitCarnivorous, targetAnimal.id);
      dispatch(server$traitActivate(gameId, attackAnimal.id, traitCarnivorous, targetAnimal, HUNT_FLAG.AMBUSH));
    } catch (e) {
      logger.debug(`server$traitAmbushPerform ERROR:`, e);
      dispatch(traitAmbushActivate(gameId, attackAnimalId, false));
      dispatch(server$gameAmbushAttackStart(gameId));
    }
  } else {
    logger.debug(`server$traitAmbushPerform [FAIL]: ${attackAnimalId}(${!!attackAnimal}) > ${ambushTarget.targetAid} $(${!!targetAnimal})`);
    dispatch(server$gameAmbushAttackEnd(gameId));
  }
};

export const server$gameAmbushAttackEnd = (gameId) => (dispatch, getState) => {
  logger.verbose(`server$gameAmbushAttackEnd`);
  let game = selectGame(getState, gameId);
  const {turnRemainingTime} = game.ambush;
  const {targetAid, targetPid, amount, sourceType, sourceId, auto} = game.ambush.targets.first();
  const targetAnimal = game.locateAnimal(targetAid, targetPid);
  if (targetAnimal && targetAnimal.canEat(game)) {
    dispatch(server$startFeeding(gameId, targetAid, amount, sourceType, sourceId, auto));
    dispatch(server$game(gameId, gameFoodTake_End(gameId, targetAid)));
  }

  dispatch(gameAmbushShiftTarget(gameId));

  game = selectGame(getState, gameId);

  let nextFeedingRecord = game.ambush.targets.first();

  if (nextFeedingRecord) {
    dispatch(server$continueFeedingFromGame(gameId, nextFeedingRecord));
  } else {
    dispatch(server$game(gameId, gameAmbushAttackEnd(gameId)));
    if (turnRemainingTime !== void 0) {
      dispatch(server$addTurnTimeout(gameId, void 0, turnRemainingTime));
    }
    dispatch(server$playerActed(gameId, targetPid));
  }
};

// const ambushAddQueue = (data) => ({
//   type: 'ambushAddQueue'
//   , data
// });
//
// const server$gameAmbushAddQueue = ambushAddQueue;

/**
 * Notification
 */

const traitNotify_Start = (gameId, sourceAid, traitId, traitType, targets) => ({
  type: 'traitNotify_Start'
  , data: {gameId, sourceAid, traitId, traitType, targets}
});

const traitNotify_End = (gameId, sourceAid, traitId, traitType, targetId) => ({
  type: 'traitNotify_End'
  , data: {gameId, sourceAid, traitId, traitType, targetId}
});

export const server$traitNotify_Start = (game, sourceAnimal, trait, ...targets) => {
  logger.debug('server$traitNotify_Start:', trait.type);
  return server$game(game.id, traitNotify_Start(game.id, sourceAnimal.id, trait.id, trait.type, targets));
};

//TODO TRAIT
export const server$traitNotify_End = (gameId, sourceAid, trait, targetId) => {
  logger.debug('server$traitNotify_End:', trait.type);
  return server$game(gameId, traitNotify_End(gameId, sourceAid, trait.id, trait.type, targetId));
};

/**
 * Complex Actions
 */

export const server$startFeeding = (gameId, animalId, amount, sourceType, sourceId, autoShare) => (dispatch, getState) => {
  // logger.debug(`server$startFeeding: ${sourceId} feeds ${animalId} through ${sourceType} with (${amount})`);
  logger.debug(`server$startFeeding: ${animalId} gets ${amount} from ${sourceType}(${sourceId})`);
  let game = selectGame(getState, gameId);
  let animal = game.locateAnimal(animalId);
  const animalWasSaturated = animal.isSaturated();

  if (sourceType === 'PLANT') {
    const sourcePlant = game.getPlant(sourceId);
    if (sourcePlant.hasTrait(ptt.PlantTraitHoney)) {
      dispatch(server$takeCardFromRandomPlayer(game, animal.ownerId));
    }
    if (sourcePlant.hasTrait(ptt.PlantTraitOfficinalis)) {
      dispatch(server$game(game.id, traitParalyze(game.id, animal.id)));
    }
  }

  dispatch(server$game(gameId, traitMoveFood(gameId, animalId, amount, sourceType, sourceId)));

  autoShare = !!autoShare || game.status.currentPlayer !== animal.ownerId;

  animal.getTraits().forEach(trait => {
    game = selectGame(getState, gameId);
    let useTrait = (trait.type === tt.TraitCommunication || (sourceType === 'GAME' && trait.type === tt.TraitCooperation));
    if (trait.type === tt.TraitCooperation && sourceType === 'PLANT') {
      const plant = game.getPlant(sourceId);
      useTrait = !getErrorOfAnimalEatingFromPlantNoCD(game, animal, plant);
    }
    if (useTrait) {
      trait = trait.set('value', {sourceType, sourceId, autoShare: true}); // Hack =( to avoid checkActionFails checking for trait.value
      if (!trait.getErrorOfUse(game, animal)) {
        if (autoShare) {
          dispatch(server$traitActivate(gameId, animalId, trait));
        } else {
          dispatch(server$traitSetValue(game, animal, trait, {sourceType, sourceId}));
        }
      }
    }

    if (trait.type === tt.TraitPlantGrazing) {
      dispatch(server$traitSetValue(game, animal, trait, sourceId));
    }
  });

  game = selectGame(getState, gameId);
  animal = game.locateAnimal(animalId);
  const animalIsSaturated = !!animal && animal.isSaturated();
  if (!animalWasSaturated && animalIsSaturated) {
    dispatch(server$activateViviparous(gameId, animalId));
  }

  return true;
};

export const server$takeFoodRequest = (gameId, playerId, animalId, plantId) => (dispatch, getState) => {
  logger.verbose('traitTakeFoodRequest:', playerId, animalId, plantId);
  const game = selectGame(getState, gameId);
  checkGameDefined(game);
  checkGameHasUser(game, playerId);
  checkGamePhase(game, PHASE.FEEDING);
  checkPlayerCanAct(game, playerId);

  const animal = checkPlayerHasAnimal(game, playerId, animalId);

  if (!game.isPlantarium()) {
    throwError(getErrorOfAnimalEatingFromGame(game, animal));

    dispatch(server$startCooldownList(gameId, getFeedingCooldownList(gameId, playerId)));
    dispatch(server$startFeedingFromGame(game.id, animal.id));
  } else if (game.isPlantarium()) {
    const plant = checkGameHasPlant(game, plantId);

    throwError(getErrorOfAnimalEatingFromPlant(game, animal, plant));

    const errorOfPlantCounterAttack = !!getErrorOfPlantCounterAttack(game, animal, plant);
    if (errorOfPlantCounterAttack) {
      dispatch(server$startCooldownList(gameId, getFeedingCooldownList(gameId, playerId)));
      dispatch(server$startFeedingFromGame(game.id, animal.id, 1, 'PLANT', plantId));
    } else {
      dispatch(server$huntStart_Plant(game.id, null, plant, animal
        , HUNT_FLAG.FEED_FROM_PLANT
        , HUNT_FLAG.PLANT_COUNTERATTACK
      ));
    }
  }
};

export const gameFoodTake_Start = (gameId, feedingRecord) => ({
  type: 'gameFoodTake_Start'
  , data: {gameId, feedingRecord}
});

export const gameFoodTake_End = (gameId, animalId, sourceType, sourceId) => ({
  type: 'gameFoodTake_End'
  , data: {gameId, animalId, sourceType, sourceId}
});

export const server$startFeedingFromGame = (
  gameId
  , animalId
  , amount = 1
  , sourceType = 'GAME'
  , sourceId = 'GAME'
  , helperId = null
  , auto = false
) => (dispatch, getState) => {
  logger.debug(`server$startFeedingFromGame: ${animalId} from ${sourceId} as ${sourceType}`);
  const game = selectGame(getState, gameId);
  const animal = game.locateAnimal(animalId);

  const feedingRecord = FeedingRecord.new(gameId, animal, amount, sourceType, sourceId, helperId, auto);

  if (game.status.phase === PHASE.AMBUSH) {
    dispatch(gameAmbushPushTarget(gameId, feedingRecord));
    // dispatch(server$game(gameId, gameAmbushPushTarget(gameId, feedingRecord)));
    return false;
  }

  return dispatch(server$continueFeedingFromGame(gameId, feedingRecord));
};

export const server$continueFeedingFromGame = (gameId, feedingRecord) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const {targetAid, targetPid, amount, sourceType, sourceId, helperId, auto} = feedingRecord;
  logger.debug(`feeding/server$continueFeedingFromGame: ${targetAid} from ${sourceId} as ${sourceType}`);

  const targetAnimal = game.locateAnimal(targetAid, targetPid);

  if (!targetAnimal) {
    logger.debug(`feeding/server$continueFeedingFromGame: ${targetAid} is DEAD`);
    return false;
  }

  dispatch(server$game(gameId, gameFoodTake_Start(gameId, feedingRecord)));

  const ambushers = getAmbushersList(game, targetAnimal);

  if (ambushers.length === 0) {
    dispatch(server$startFeeding(gameId, targetAid, amount, sourceType, sourceId, auto));
    dispatch(server$game(gameId, gameFoodTake_End(gameId, targetAid)));
    if (!helperId) dispatch(server$playerActed(gameId, targetPid));
  } else {
    dispatch(server$gameAmbushPrepareStart(gameId, ambushers, feedingRecord));
  }

  return ambushers.length === 0;
};

/**
 * Question
 * */

export const traitQuestion = (gameId, question) => ({type: 'traitQuestion', data: {gameId, question}});

const makeTraitQuestionTimeout = (gameId, questionId) => `traitQuestion#${gameId}#${questionId}`;

export const traitAnswerRequest = (traitId, targetId) => (dispatch, getState) => dispatch({
  type: 'traitAnswerRequest'
  , data: {
    gameId: getState().getIn(['game', 'id']),
    questionId: getState().getIn(['game', 'question', 'id']),
    traitId,
    targetId
  }
  , meta: {server: true}
});

export const traitAnswerSuccess = (gameId, questionId) => ({
  type: 'traitAnswerSuccess'
  , data: {gameId, questionId}
});

export const server$traitQuestion = (gameId, question) => (dispatch, getState) => {
  logger.debug(`server$traitQuestion`, question.type);
  const turnRemainingTime = dispatch(server$gameCancelTurnTimeout(gameId));

  dispatch(server$questionResumeTimeout(gameId, question.set('turnRemainingTime', turnRemainingTime)));
};

const server$traitQuestionDefaultAction = (gameId, questionId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  if (!game) {
    logger.error('NO GAME', getState().toJS());
    return;
  }
  if (!game.question) {
    logger.error('NO QUESTION', getState().toJS());
    return;
  }
  if (game.question.id !== questionId) {
    logger.error('QUESTION WRONG ID', game.question.id, questionId);
    return;
  }

  const attackAnimal = game.locateAnimal(game.question.sourceAid, game.question.sourcePid);
  const attackTrait = game.locateTrait(game.question.traitId, game.question.sourceAid, game.question.sourcePid);
  const targetAnimal = game.locateAnimal(game.question.targetAid, game.question.targetPid);
  if (game.question.type === QuestionRecord.INTELLECT) {
    const targetId = getTraitDataModel(tt.TraitIntellect).customFns.defaultTarget(game, attackAnimal, attackTrait, defenseAnimal);
    dispatch(server$traitIntellectAnswer(gameId, questionId, tt.TraitIntellect, targetId));
  } else if (game.question.type === QuestionRecord.DEFENSE) {
    const defaultDefence = findDefaultActiveDefence(game, attackAnimal, attackTrait, targetAnimal);
    if (defaultDefence !== null) {
      dispatch(server$traitDefenceAnswer(gameId
        , questionId
        , ...defaultDefence
      ));
    } else {
      logger.error('DEFAULTDEFENCE')
      // dispatch(server$huntKill_Animal(game.id));
    }
  } else {
    logger.error(`Unknown question type`)
  }
};

export const server$traitAnswerSuccess = (gameId, questionId) => (dispatch, getState) => {
  const question = selectGame(getState, gameId).question;
  if (question) {
    dispatch(cancelTimeout(makeTraitQuestionTimeout(gameId, questionId)));
    dispatch(server$game(gameId, traitAnswerSuccess(gameId, questionId)));
    if (question.turnRemainingTime) {
      dispatch(server$addTurnTimeout(gameId, void 0, question.turnRemainingTime));
    }
  }
};

export const server$questionPauseTimeout = (game) => (dispatch, getState) => {
  const gameId = game.id;
  if (!!game.question && !!game.question.id) {
    dispatch(cancelTimeout(makeTraitQuestionTimeout(gameId, game.question.id)));
  }
};

export const server$questionResumeTimeout = (gameId, question) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);

  const userId = question.userId;
  const player = game.getPlayer(userId);

  const timeTraitResponse = !player.timedOut ? game.settings.timeTraitResponse : SETTINGS_TIMED_OUT_TURN_TIME;

  question = question.set('time', Date.now());

  logger.verbose('server$traitQuestion:', question.type, question.sourceAid, '>', question.targetAid);

  dispatch(traitQuestion(gameId, question));
  // Notify all users
  dispatch(Object.assign(traitQuestion(gameId, question.toOthers().toClient())
    , {meta: {clientOnly: true, users: selectUsersInGame(getState, gameId)}}));
  // Notify defending user
  dispatch(Object.assign(traitQuestion(gameId, question.toClient())
    , {meta: {clientOnly: true, userId}}));

  if (game.status.paused) return;
  dispatch(addTimeout(timeTraitResponse
    , makeTraitQuestionTimeout(gameId, question.id)
    , server$traitQuestionDefaultAction(gameId, question.id)));
};

/**
 * Defence
 */

export const server$traitDefenceQuestion = (gameId, attackEid, attackPid, trait, defenseAnimal) => {
  const question = QuestionRecord.new(QuestionRecord.DEFENSE
    , defenseAnimal.ownerId
    , attackEid
    , attackPid
    , trait.id
    , defenseAnimal
  );
  return server$traitQuestion(gameId, question);
};

export const server$traitDefenceAnswer = (gameId, questionId, traitId, targetId) => (dispatch, getState) => {
  logger.debug('server$traitDefenceAnswer', questionId, traitId, targetId);
  const game = selectGame(getState, gameId);
  const question = game.get('question');
  if (!question) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'Game doesnt have Question(%s)', questionId)
  }
  if (question.id !== questionId) {
    throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
      , 'QuesionID is incorrect (%s)', questionId)
  }

  const attackAnimal = game.getEntity(question.sourceAid);
  const attackTrait = attackAnimal.hasTrait(question.traitId);
  if (!attackTrait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', question.sourceAid, traitId)
  }

  const defenseAnimal = checkPlayerHasAnimal(game, question.targetPid, question.targetAid);
  if (traitId !== true) {
    const defenseTrait = checkTraitActivation(game, defenseAnimal, traitId, attackAnimal, attackTrait);
    if (!defenseTrait.getDataModel().defense) {
      throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
        , ERRORS.TRAIT_ACTION_DEFENSE);
    }
    const target = checkTraitActivation_Target(game, defenseAnimal, defenseTrait, targetId, attackAnimal, attackTrait);

    if (checkIfTraitDisabledByIntellect(attackAnimal, defenseTrait))
      throw new ActionCheckError(`server$traitDefenceAnswer@Game(${game.id})`
        , ERRORS.TRAIT_ACTION_SUPRESSED);

    dispatch(server$traitAnswerSuccess(game.id, questionId));
    dispatch(server$traitActivate(gameId, defenseAnimal.id, defenseTrait, target, attackAnimal, attackTrait));
  } else {
    dispatch(server$traitAnswerSuccess(gameId, questionId));
    dispatch(huntSetFlag(gameId, HUNT_FLAG.OPTIONAL_DEFENCE_OFF));
    dispatch(server$huntProcess(gameId))
    // dispatch(server$traitActivate(gameId, attackAnimal.id, attackTrait, defenseAnimal, true));
  }
};

/**
 * Intellect
 */

export const server$traitIntellectQuestion = (gameId, attackEntity, attackTrait, defenseAnimal) => {
  const question = QuestionRecord.new(QuestionRecord.INTELLECT
    , attackEntity.ownerId
    , attackEntity.id
    , attackEntity.ownerId
    , attackTrait.id
    , defenseAnimal
  );
  return server$traitQuestion(gameId, question);
};

export const server$traitIntellectAnswer = (gameId, questionId, traitId, targetId) => (dispatch, getState) => {
  logger.debug('server$traitIntellectAnswer', questionId, traitId, targetId);
  let game = selectGame(getState, gameId);
  if (!game.get('question')) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`
      , 'Game doesnt have Question(%s)', questionId)
  }
  const question = game.get('question');
  if (question.id !== questionId) {
    throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`
      , 'QuesionID is incorrect (%s)', questionId)
  }

  const attackAnimal = checkPlayerHasAnimal(game, question.sourcePid, question.sourceAid);
  const attackTrait = attackAnimal.hasTrait(question.traitId);
  if (!attackTrait) {
    throw new ActionCheckError(`checkTraitActivation@Game(${gameId})`, 'Animal(%s) doesnt have Trait(%s)', question.sourceAid, traitId)
  }
  const targetAnimal = checkPlayerHasAnimal(game, question.targetPid, question.targetAid);

  const traitIntellect = attackAnimal.hasTrait(tt.TraitIntellect);

  throwError(traitIntellect.getErrorOfUse(game, attackAnimal));

  if (targetId === true) {
    // either targetId is true, means - user don't want to use Intellect
  } else {
    // or it's a type/id of targetTrait and we convert it strictly to ID
    const targetTrait = targetAnimal.hasTrait(targetId, true);
    if (!targetTrait) {
      throw new ActionCheckError(`server$traitIntellectAnswer@Game(${game.id})`, 'Wrong target trait')
    }
    targetId = targetTrait.id;
  }

  dispatch(server$traitActivate(gameId, attackAnimal.id, traitIntellect, targetId));
  dispatch(server$traitAnswerSuccess(game.id, questionId));

  dispatch(server$huntProcess(gameId));
};

// region PlantQuestions

export const server$questionPlantCarnivorousCounterattack = (gameId, attackPlant, attackTrait, defenseAnimal) => {
  const question = QuestionRecord.new(QuestionRecord.PLANT_COUNTERATTACK
    , defenseAnimal.ownerId
    , attackPlant
    , attackTrait.id
    , defenseAnimal
  );
  return server$traitQuestion(gameId, question);
};

// endregion

//

export const traitClientToServer = {
  traitTakeFoodRequest: ({gameId, animalId, plantId}, {userId}) => (dispatch) => {
    if (!dispatch(server$autoFoodSharing(gameId, userId))) return;
    dispatch(server$takeFoodRequest(gameId, userId, animalId, plantId));
  }
  , traitTakeShellRequest: ({gameId, animalId, traitId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    checkPlayerCanAct(game, userId);

    const animal = checkPlayerHasAnimal(game, userId, animalId);

    if (!dispatch(server$autoFoodSharing(gameId, userId))) return;

    throwError(checkAnimalCanTakeShellFails(game, animal));

    const trait = game.getArea().shells.get(traitId);
    if (!trait)
      throw new ActionCheckError(`traitTakeShellRequest@Game(${game.id})`, 'Game doesnt have Trait(%s)', traitId);

    dispatch(server$game(gameId, startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId)));
    dispatch(server$game(gameId, traitTakeShell(gameId, AREA.STANDARD, animalId, trait)));
    dispatch(server$playerActed(gameId, userId));
  }
  , traitTakeCoverRequest: ({gameId, animalId, plantId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    checkPlayerCanAct(game, userId);

    const animal = checkPlayerHasAnimal(game, userId, animalId);

    if (!dispatch(server$autoFoodSharing(gameId, userId))) return;

    const plant = checkGameHasPlant(game, plantId);
    throwError(getErrorOfAnimalTakingCover(game, animal, plant));

    dispatch(server$game(gameId, startCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_DURATION.ROUND, TRAIT_COOLDOWN_PLACE.PLAYER, userId)));
    dispatch(server$game(gameId, traitTakeCover(gameId, animalId, plantId)));
    dispatch(server$playerActed(gameId, userId));
  }
  , traitAmbushActivateRequest: ({gameId, animalId, on}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.AMBUSH);

    checkPlayerHasAnimal(game, userId, animalId);

    if (!game.hasIn(['ambush', 'ambushers', animalId]))
      throw new ActionCheckError(`traitAmbushActivateRequest@Game(${game.id})`, 'Animal#%s is not in ambushers', animalId);

    dispatch(server$traitAmbushActivate(gameId, animalId, on));
  }
  , traitAmbushContinueRequest: ({gameId}, {userId}) => (dispatch, getState) => {
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.AMBUSH);

    game.getIn(['ambush', 'ambushers']).forEach((wants, animalId) => {
      if (wants === null) {
        const animal = game.locateAnimal(animalId, userId);
        if (animal) {
          dispatch(server$traitAmbushActivate(gameId, animal.id, false));
        }
      }
    });
  }
  , traitActivateRequest: ({gameId, sourceAid, traitId, targets}, {userId}) => (dispatch, getState) => {
    logger.verbose('traitActivateRequest', gameId, sourceAid, traitId, ...targets);
    let game = selectGame(getState, gameId);
    checkGameDefined(game);
    checkGameHasUser(game, userId);
    checkGamePhase(game, PHASE.FEEDING);
    const sourceAnimal = checkPlayerHasAnimal(game, userId, sourceAid);

    const trait = checkTraitActivation(game, sourceAnimal, traitId);
    //@TODO Communication // trait type checking here smells =\
    if (trait.type !== tt.TraitCommunication && trait.type !== tt.TraitCooperation) {
      if (!dispatch(server$autoFoodSharing(gameId, userId))) return;
    }
    game = selectGame(getState, gameId);

    const target = checkTraitActivation_Target(game, sourceAnimal, trait, ...targets);
    if (!trait.getDataModel().transient) checkPlayerCanAct(game, userId);

    const result = dispatch(server$traitActivate(gameId, sourceAid, trait, target));
    if (result === void 0) {
      throw new Error(`traitActivateRequest@Game(${gameId}): Animal(${sourceAid})-${trait.type}-(${targets.join(' ')}) result undefined`);
    }
    //logger.silly('traitActivateRequest: ' + result);
    if (result) {
      dispatch(server$playerActed(gameId, userId));
    }
  }
  , traitAnswerRequest: ({gameId, questionId, traitId, targetId}, {userId}) => (dispatch, getState) => {
    logger.verbose('traitAnswerRequest', gameId, questionId, traitId, targetId);
    const game = selectGame(getState, gameId);
    checkGameDefined(game);
    if (game.status.phase !== PHASE.FEEDING && game.status.phase !== PHASE.AMBUSH) {
      throw new ActionCheckError(`checkGamePhase@Game(${game.id})`, 'Wrong phase (%s)', game.status.phase);
    }

    if (!game.get('question')) {
      throw new ActionCheckError(`traitAnswerRequest@Game(${game.id})`
        , 'Game doesnt have Question(%s)', questionId)
    }

    const {type, sourcePid, targetPid} = game.question;
    //checkPlayerTurn(game, sourcePid);
    switch (type) {
      case QuestionRecord.DEFENSE:
        if (userId !== targetPid) {
          throw new ActionCheckError(`checkPlayerCanAct@Game(${game.id})`
            , `Player(%s) answering instead of Player(%s)`
            , userId, targetPid);
        }
        dispatch(server$traitDefenceAnswer(gameId, questionId, traitId, targetId));
        break;
      case QuestionRecord.INTELLECT:
        if (userId !== sourcePid) {
          throw new ActionCheckError(`checkPlayerCanAct@Game(${game.id})`
            , `Player(%s) answering instead of Player(%s)`
            , userId, sourcePid);
        }
        dispatch(server$traitIntellectAnswer(gameId, questionId, traitId, targetId));
        break;
    }
  }
};

export const traitServerToClient = {
  traitMoveFood: ({gameId, animalId, amount, sourceType, sourceId}) =>
    traitMoveFood(gameId, animalId, amount, sourceType, sourceId)
  , startCooldown: ({gameId, link, duration, place, placeId}) =>
    startCooldown(gameId, link, duration, place, placeId)
  , startCooldownList: ({list}) => shared$startCooldownList(list)
  , traitQuestion: ({gameId, question}, currentUserId) =>
    traitQuestion(gameId, QuestionRecord.fromJS(question))
  , traitAnswerSuccess: ({gameId, questionId}, currentUserId) =>
    traitAnswerSuccess(gameId, questionId)
  , traitNotify_Start: ({gameId, sourceAid, traitId, traitType, targets}, currentUserId) =>
    traitNotify_Start(gameId, sourceAid, traitId, traitType, targets)
  , traitNotify_End: ({gameId, sourceAid, traitId, traitType, targetId}, currentUserId) =>
    traitNotify_End(gameId, sourceAid, traitId, traitType, targetId)

  , traitAnimalRemoveTrait: ({gameId, sourcePid, sourceAid, traitId}) =>
    traitAnimalRemoveTrait(gameId, sourcePid, sourceAid, traitId)
  , traitAnimalAttachTrait: ({gameId, sourcePid, sourceAid, trait}) =>
    traitAnimalAttachTrait(gameId, sourcePid, sourceAid, TraitModel.fromServer(trait))
  , traitAnimalRecombinateTraits: ({gameId, player1id, player2id, animal1id, animal2id, trait1id, trait2id}) =>
    traitAnimalRecombinateTraits(gameId, player1id, player2id, animal1id, animal2id, trait1id, trait2id)

  , traitAttachToPlant: ({gameId, plantId, trait}) =>
    traitAttachToPlant(gameId, plantId, TraitModel.fromServer(trait))
  , traitDetachFromPlant: ({gameId, plantId, traitId}) =>
    traitDetachFromPlant(gameId, plantId, traitId)
  , traitGrazeFood: ({gameId, food, sourceAid}) => traitGrazeFood(gameId, food, sourceAid)
  , traitParalyze: ({gameId, animalId}) => traitParalyze(gameId, animalId)

  , gameFoodTake_Start: ({gameId, feedingRecord}) => gameFoodTake_Start(gameId, FeedingRecord.fromJS(feedingRecord))
  , gameFoodTake_End: ({gameId, animalId}) => gameFoodTake_End(gameId, animalId)

  , traitAmbushActivate: ({gameId, animalId, on}) => traitAmbushActivate(gameId, animalId, on)
  , gameAmbushPrepareStart: ({gameId, turnRemainingTime}) => gameAmbushPrepareStart(gameId, turnRemainingTime)
  , gameAmbushPrepareEnd: ({gameId}) => gameAmbushPrepareEnd(gameId)
  , gameAmbushAttackStart: ({gameId}) => gameAmbushAttackStart(gameId)
  , gameAmbushAttackEnd: ({gameId}) => gameAmbushAttackEnd(gameId)
  , gameAmbushSetAmbushers: ({gameId, ambushers}) => gameAmbushSetAmbushers(gameId, ambushers)

  , traitConvertFat: ({gameId, sourceAid, traitId}) => traitConvertFat(gameId, sourceAid, traitId)
  , traitSetAnimalFlag: ({gameId, sourceAid, flag, on}) =>
    traitSetAnimalFlag(gameId, sourceAid, flag, on)
  , traitTakeShell: ({gameId, continentId, animalId, trait}) =>
    traitTakeShell(gameId, continentId, animalId, TraitModel.fromServer(trait))
  , traitTakeCover: ({gameId, animalId, plantId}) => traitTakeCover(gameId, animalId, plantId)
  , traitSetValue: ({gameId, sourceAid, traitId, value}) =>
    traitSetValue(gameId, sourceAid, traitId, value)
};