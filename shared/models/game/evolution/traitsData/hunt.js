import logger from "../../../../utils/logger";
import {selectGame} from "../../../../selectors";
import {server$game} from "../../../../actions/generic";
import {getTraitDataModel, TraitModel} from "../TraitModel";
import * as tt from "../traitTypes";
import * as ptt from "../plantarium/plantTraitTypes";
import {
  clearCooldown, getFeedingCooldownList,
  server$gameAmbushAttackStart, server$startCooldownList,
  server$startFeeding,
  server$startFeedingFromGame,
  server$traitActivate,
  server$traitAnimalAttachTrait,
  server$traitAnimalRemoveTrait, server$traitDefenceAnswer, server$traitDefenceQuestion,
  server$traitDetachFromPlant, server$traitIntellectAnswer, server$traitIntellectQuestion, server$traitKillAnimal,
  server$traitNotify_End, server$traitQuestion,
  server$traitSetValue,
  server$traitStartCooldown,
  traitAmbushActivate,
  traitParalyze, traitQuestion
} from "../../../../actions/trait";
import {HUNT_FLAG, TRAIT_COOLDOWN_LINK, TRAIT_COOLDOWN_PLACE} from "../constants";
import {getErrorOfAnimalEatingFromPlant, getErrorOfAnimalEatingFromPlantNoCD} from "../../../../actions/trait.checks";
import {
  findAnglerfish,
  findDefaultActiveDefence,
  getActiveDefenses,
  getAffectiveDefenses, getIntellectValue,
  getStaticDefenses,
  TraitCarnivorous
} from "./TraitCarnivorous";
import {TraitMimicry, TraitTailLoss} from "./index";
import {QuestionRecord} from "../../GameModel";
import {server$playerActed} from "../../../../actions/game";
import {AnimalModel} from "../AnimalModel";
import {server$gamePlantUpdateFood} from "../../../../actions/game.plantarium";

export const HUNT_TYPE = {ANIMAL: 'ANIMAL', PLANT: 'PLANT'};

export const gameGetHunt = (game) => game.hunts.first();

export const huntGetFlag = (game, key) => gameGetHunt(game).flags.has(key);

const getHuntingEntity = (game) => {
  return game.locateAnimal(gameGetHunt(game).attackEntityId) || game.getPlant(gameGetHunt(game).attackEntityId);
};

export const huntStart = (gameId, type, attackEntityId, attackPlayerId) => ({
  type: 'huntStart',
  data: {gameId, type, attackEntityId, attackPlayerId}
});

export const huntSetTarget = (gameId, attackTrait, targetAnimal) => ({
  type: 'huntSetTarget',
  data: {
    gameId
    , attackTraitId: attackTrait.id
    , attackTraitType: attackTrait.type
    , targetAid: targetAnimal.id
    , targetPid: targetAnimal.ownerId
  }
});

export const huntSetFlag = (gameId, key) => ({
  type: 'huntSetFlag',
  data: {gameId, key}
});

export const huntUnsetFlag = (gameId, key) => ({
  type: 'huntUnsetFlag',
  data: {gameId, key}
});

export const huntEnd = (gameId) => ({
  type: 'huntEnd',
  data: {gameId}
});

const noopIfProd = (fn) => process.env.NODE_ENV === 'production' ? () => `#NOOP` : fn;

const debugHuntFlags = noopIfProd((game) => `(${gameGetHunt(game).flags.toJS()})`);

const debugHunts = noopIfProd((game) => `(${game.hunts.map(hunt => `${hunt.attackEntityId} > ${hunt.targetAid} ${debugHuntFlags(game)}`).toArray()})`);

const server$huntStart = (gameId, type, attackEntity, attackTrait, targetAnimal, ...flags) => (dispatch, getState) => {
  let game = selectGame(getState, gameId);
  logger.verbose(`server$huntStart: ${attackEntity.id} > ${targetAnimal.id}`);
  // dispatch(server$game(gameId, huntStart(gameId, attackEntity.id, attackTrait.id, targetAnimal.id)));
  dispatch(huntStart(gameId, type, attackEntity.id, attackEntity.ownerId));
  dispatch(huntSetTarget(gameId, attackTrait, targetAnimal));

  flags.forEach((flag) =>
    dispatch(huntSetFlag(gameId, flag))
  );

  dispatch(server$huntProcess(gameId));
};

// Public

export const server$huntStart_Animal = (gameId, attackAnimal, attackTrait, targetAnimal, ...flags) => (dispatch, getState) => {
  dispatch(server$huntStart(gameId, HUNT_TYPE.ANIMAL, attackAnimal, attackTrait, targetAnimal, ...flags));
};

export const server$huntStart_Plant = (gameId, attackPlant, targetAnimal, ...flags) => (dispatch, getState) => {
  const attackTrait = attackPlant.hasTrait(ptt.PlantTraitHiddenCarnivorous);
  dispatch(server$huntStart(gameId, HUNT_TYPE.PLANT, attackPlant, attackTrait, targetAnimal, ...flags));
};

export const server$huntProcess = (gameId) => (dispatch, getState) => {
  let game = selectGame(getState, gameId);
  let hunt = gameGetHunt(game);
  logger.debug(`server$huntProcess: ${debugHunts(game)}`);

  const attackEntity = getHuntingEntity(game);
  const attackTrait = game.locateTrait(hunt.attackTraitId, hunt.attackEntityId);
  const targetAnimal = game.locateAnimal(hunt.targetAid);

  let animalAnglerfish = findAnglerfish(game, targetAnimal);
  if (animalAnglerfish) {
    logger.debug(`server$huntProcess/Anglerfish/${animalAnglerfish.id}`);
    const traitAnglerfish = animalAnglerfish.traits.first();

    const newTraitCarnivorous = TraitModel.new(tt.TraitCarnivorous);
    const newTraitIntellect = TraitModel.new(tt.TraitIntellect);

    dispatch(server$traitAnimalRemoveTrait(game, animalAnglerfish, traitAnglerfish));

    dispatch(server$traitAnimalAttachTrait(game, animalAnglerfish, newTraitCarnivorous));
    dispatch(server$traitAnimalAttachTrait(game, animalAnglerfish, newTraitIntellect));

    game = selectGame(getState, gameId);

    animalAnglerfish = game.locateAnimal(animalAnglerfish.id, animalAnglerfish.ownerId);

    switch (hunt.type) {
      case HUNT_TYPE.ANIMAL:
        if (!TraitCarnivorous.getErrorOfUseOnTarget(game, animalAnglerfish, attackEntity)) {
          dispatch(server$traitActivate(gameId, animalAnglerfish.id, newTraitCarnivorous, attackEntity, HUNT_FLAG.TRAIT_ANGLERFISH));
        } else {
          dispatch(server$traitAnimalRemoveTrait(game, animalAnglerfish, newTraitIntellect));
          dispatch(server$huntEnd(gameId));
        }
        break;
      case HUNT_TYPE.PLANT:
        dispatch(server$huntEnd(gameId));
        const newGame = selectGame(getState, gameId);
        const newPlant = newGame.getPlant(attackEntity.id);
        const anglerfishShouldEat = (
          animalAnglerfish.id !== targetAnimal.id
          && !getErrorOfAnimalEatingFromPlantNoCD(newGame, animalAnglerfish, newPlant)
        );
        logger.debug(`server$huntProcess/Anglerfish/anglerfishShouldEat/${animalAnglerfish.id}: ${anglerfishShouldEat}`);
        dispatch(server$traitAnimalRemoveTrait(newGame, animalAnglerfish, newTraitIntellect));
        if (anglerfishShouldEat) {
          dispatch(server$startFeedingFromGame(gameId, animalAnglerfish.id, 1, 'PLANT', attackEntity.id));
        }
        break;
    }

    return;
  }

  const traitShy = targetAnimal.hasTrait(tt.TraitShy);
  if (traitShy) {
    dispatch(huntSetFlag(gameId, HUNT_FLAG.TRAIT_SHY));
  }

  const staticDefenses = getStaticDefenses(game, attackEntity, targetAnimal);

  const traitIntellect = (
    attackEntity.hasTrait(tt.TraitIntellect)
    || (huntGetFlag(game, HUNT_FLAG.PLANT_COUNTERATTACK) && attackEntity.hasTrait(ptt.PlantTraitHiddenIntellect))
  );
  let disabledTraitId = !!traitIntellect && traitIntellect.value;
  let canUseIntellect = !!traitIntellect && disabledTraitId !== true && !traitIntellect.getErrorOfUse(game, attackEntity);
  if (canUseIntellect && staticDefenses.length === 1) {
    dispatch(server$traitActivate(game.id, attackEntity.id, traitIntellect, staticDefenses[0].id));
    dispatch(server$huntProcess(gameId));
    return;
  }
  logger.debug(`server$huntProcess/${attackEntity.id}/Intellect/Status/ ${canUseIntellect}, ${disabledTraitId}`);

  let possibleDefenseTargets = 0;
  const possibleDefenses = getActiveDefenses(game, attackEntity, attackTrait, targetAnimal)
    .filter((defenseTrait) => {
      if (defenseTrait.isEqual(disabledTraitId)) return false;

      if (defenseTrait.type === tt.TraitMimicry) {
        possibleDefenseTargets += TraitMimicry.getTargets(game, targetAnimal, defenseTrait, attackEntity, attackTrait).size;
      } else if (defenseTrait.type === tt.TraitTailLoss) {
        possibleDefenseTargets += TraitTailLoss.getTargets(game, targetAnimal, defenseTrait, attackEntity, attackTrait).size;
      }

      return true;
    });
  logger.debug(`server$huntProcess/${attackEntity.id}/possibleDefenses/ ${[].concat(possibleDefenses)})`);
  logger.debug(`server$huntProcess/${attackEntity.id}/possibleDefenseTargets/ ${possibleDefenseTargets})`);

  if (canUseIntellect) {
    const affectiveDefenses = getAffectiveDefenses(game, attackEntity, targetAnimal);
    logger.debug(`server$huntProcess/${attackEntity.id}/Intellect/Defenses/ ${[].concat(possibleDefenses, affectiveDefenses)})`);
    if ((possibleDefenses.length + affectiveDefenses.length) > 0) {
      if (hunt.type === HUNT_TYPE.ANIMAL) {
        const question = QuestionRecord.new(QuestionRecord.INTELLECT
          , attackEntity.ownerId
          , attackEntity
          , attackTrait.id
          , targetAnimal
        );
        dispatch(server$traitQuestion(gameId, question));
      } else {
        const targetId = getTraitDataModel(tt.TraitIntellect).customFns.defaultTarget(game, attackEntity, attackTrait, targetAnimal);
        logger.debug(`server$huntProcess/${attackEntity.id}/Intellect/PlantCounterattackDefense/ ${targetId}`);
        dispatch(server$traitActivate(game.id, attackEntity.id, traitIntellect, targetId));
        dispatch(server$huntProcess(gameId));
        // const players = game.getActualPlayers().toIndexedSeq();
        // const targetPlayerIndex = players.findIndex(p => p.id === targetAnimal.ownerId);
        // const previousPlayer = players.get(targetPlayerIndex - 1).id;
        // const question = QuestionRecord.new(QuestionRecord.INTELLECT
        //   , previousPlayer.id
        //   , attackEntity
        //   , attackTrait.id
        //   , targetAnimal
        // );
        // server$traitQuestion(gameId, question);
      }
      return false;
    }
  }

  if (possibleDefenses.length > 1
    || possibleDefenseTargets > 1
    || possibleDefenses.some(t => t.getDataModel().optional)) {
    dispatch(server$traitDefenceQuestion(gameId, attackEntity, attackTrait, targetAnimal));
    return false;
  }

  const defaultDefence = findDefaultActiveDefence(game, attackEntity, attackTrait, targetAnimal);
  if (defaultDefence) {
    const question = QuestionRecord.new(QuestionRecord.DEFENSE, targetAnimal.ownerId, attackEntity, attackTrait.id, targetAnimal, 0);
    logger.debug(`server$traitDefenceQuestionInstant: ${attackEntity.id} > ${targetAnimal.id} + ${defaultDefence}`);
    dispatch(traitQuestion(gameId, question));
    dispatch(server$traitDefenceAnswer(gameId
      , question.id
      , ...defaultDefence
    ));
    return false;
  } else {
    if (hunt.type === HUNT_TYPE.ANIMAL) {
      return dispatch(server$huntKill_Animal(gameId));
    } else {
      dispatch(huntSetFlag(gameId, HUNT_FLAG.FEED_ATTACKING_PLANT));
      return dispatch(server$huntKill(gameId));
    }
  }
};

export const server$huntKill_Animal = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const hunt = gameGetHunt(game);
  const attackAnimal = getHuntingEntity(game);
  const targetAnimal = game.locateAnimal(hunt.targetAid);
  const disabledTraitId = getIntellectValue(attackAnimal);

  const traitCnidocytes = targetAnimal.hasTrait(tt.TraitCnidocytes);
  if (traitCnidocytes && !traitCnidocytes.isEqual(disabledTraitId) && !traitCnidocytes.getErrorOfUse(game, attackAnimal)) {
    dispatch(traitCnidocytes.getDataModel().customFns.paralyze(game.id, targetAnimal, traitCnidocytes, attackAnimal));
  }

  dispatch(huntSetFlag(gameId, HUNT_FLAG.FEED_FROM_KILL));

  return dispatch(server$huntKill(gameId));
};

export const server$huntKill = (gameId) => (dispatch, getState) => {
  const game = selectGame(getState, gameId);
  const hunt = gameGetHunt(game);

  const attackEntity = getHuntingEntity(game);
  const attackTrait = game.locateTrait(hunt.attackTraitId, hunt.attackEntityId);
  const targetAnimal = game.locateAnimal(hunt.targetAid);
  const disabledTraitId = getIntellectValue(attackEntity);

  const traitPoisonous = targetAnimal.hasTrait(tt.TraitPoisonous);
  if (traitPoisonous && !traitPoisonous.isEqual(disabledTraitId)) {
    dispatch(server$traitActivate(game.id, targetAnimal.id, traitPoisonous, attackEntity));
  }

  dispatch(huntSetFlag(game.id, HUNT_FLAG.FEED_SCAVENGERS));
  dispatch(server$traitKillAnimal(game.id, attackEntity, targetAnimal));
  return dispatch(server$huntEnd(gameId));
};

export const server$huntEnd = (gameId) => (dispatch, getState) => {
  let game = selectGame(getState, gameId);
  const hunt = gameGetHunt(game);

  const attackEntity = getHuntingEntity(game);
  const attackTrait = game.locateTrait(hunt.attackTraitId, hunt.attackEntityId);
  const targetAnimal = game.locateAnimal(hunt.targetAid);

  logger.verbose(`server$huntEnd [START]: ${debugHunts(game)}`);

  if (huntGetFlag(game, HUNT_FLAG.FEED_FROM_PLANT)) {
    dispatch(server$startCooldownList(gameId, getFeedingCooldownList(gameId, hunt.targetPid)));
  }

  if (attackEntity) {
    const traitIntellect = attackEntity.hasTrait(tt.TraitIntellect) || attackEntity.hasTrait(ptt.PlantTraitHiddenIntellect);
    if (!!traitIntellect && traitIntellect.value === true) dispatch(server$traitSetValue(game, attackEntity, traitIntellect, false));

    if (!huntGetFlag(game, HUNT_FLAG.TRAIT_INK_CLOUD)) {
      const ensuredAttackTrait = TraitModel.new(hunt.attackTraitType).set('id', hunt.attackTraitId); // Attack trait could be undefined
      dispatch(server$traitStartCooldown(game.id, ensuredAttackTrait, attackEntity));
    }
    if (huntGetFlag(game, HUNT_FLAG.TRAIT_ANGLERFISH)) {
      const traitIntellect = attackEntity.hasTrait(tt.TraitIntellect);
      if (traitIntellect) dispatch(server$traitAnimalRemoveTrait(game, attackEntity, traitIntellect));
    }
    if (huntGetFlag(game, HUNT_FLAG.FEED_FROM_KILL)) {
      dispatch(server$startFeeding(gameId, attackEntity.id, 2, tt.TraitCarnivorous));
    }
    if (huntGetFlag(game, HUNT_FLAG.PARALYZE)) {
      dispatch(server$game(gameId, traitParalyze(gameId, hunt.attackEntityId)));
    }
    if (huntGetFlag(game, HUNT_FLAG.FEED_SCAVENGERS)) {
      const currentPlayerIndex = game.getPlayer(attackEntity.ownerId || game.status.currentPlayer).index;

      game.sortPlayersFromIndex(game.players, currentPlayerIndex).some(player => player.continent.some(animal => {
        const traitScavenger = animal.hasTrait(tt.TraitScavenger);
        if (traitScavenger && animal.canEat(game) > 0) {
          dispatch(server$startFeeding(gameId, animal.id, 1, tt.TraitScavenger, attackEntity.id));
          return true;
        }
      }));
    }
    if (huntGetFlag(game, HUNT_FLAG.FEED_FROM_TAIL_LOSS)) {
      if (attackEntity instanceof AnimalModel) {
        dispatch(server$startFeeding(gameId, attackEntity.id, 1, tt.TraitTailLoss, attackEntity.id));
      } else {
        dispatch(server$gamePlantUpdateFood(gameId, attackEntity.id, 1, tt.TraitCarnivorous));
      }
    }
    if (huntGetFlag(game, HUNT_FLAG.FEED_ATTACKING_PLANT)) {
      dispatch(server$gamePlantUpdateFood(gameId, attackEntity.id, 2, tt.TraitCarnivorous));
    }
  }

  if (targetAnimal) {
    if (huntGetFlag(game, HUNT_FLAG.TRAIT_SHY)) {
      const traitShy = targetAnimal.hasTrait(tt.TraitShy);
      if (traitShy) {
        dispatch(traitShy.getDataModel().action(game, targetAnimal, traitShy));
      }
    }
    if (huntGetFlag(game, HUNT_FLAG.FEED_FROM_PLANT)) {
      if (!getErrorOfAnimalEatingFromPlant(game, targetAnimal, attackEntity)) {
        dispatch(server$startFeedingFromGame(gameId, targetAnimal.id, 1, 'PLANT', attackEntity.id));
      }
    }
  }

  dispatch(huntEnd(gameId));

  if (attackEntity && attackTrait) {
    dispatch(server$traitNotify_End(gameId, hunt.attackEntityId, attackTrait, hunt.targetAid));
  }

  if (huntGetFlag(game, HUNT_FLAG.AMBUSH)) {
    dispatch(clearCooldown(gameId, TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, hunt.attackPlayerId));
    dispatch(traitAmbushActivate(gameId, hunt.attackEntityId, false));
    dispatch(server$gameAmbushAttackStart(gameId));
  }

  logger.verbose(`server$huntEnd [END]: ${debugHunts(game)}`);

  if (gameGetHunt(selectGame(getState, gameId))) {
    logger.info(`ENDING ANOTHER HUNT: ${debugHunts(game)}`);
    dispatch(server$huntEnd(gameId));
  }
  if (!huntGetFlag(game, HUNT_FLAG.AMBUSH) && hunt.attackPlayerId) {
    dispatch(server$playerActed(gameId, hunt.attackPlayerId));
  }
  if (huntGetFlag(game, HUNT_FLAG.FEED_FROM_PLANT)) {
    dispatch(server$playerActed(gameId, hunt.targetPid));
  }
  if (huntGetFlag(game, HUNT_FLAG.PLANT_ATTACK)) {
    dispatch(server$playerActed(gameId, game.status.currentPlayer));
  }
};