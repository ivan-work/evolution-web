import logger from '~/shared/utils/logger';
import {createReducer, ensureParameter, validateParameter} from '../../shared/utils';
import {getRandom} from '../../shared/utils/randomGenerator';
import {Map, List, OrderedMap, fromJS} from 'immutable';
import {PHASE, AREA, HuntRecord, AmbushRecord} from '../../shared/models/game/GameModel';
import {getTraitDataModel} from '../../shared/models/game/evolution/TraitModel';
import {
  TRAIT_TARGET_TYPE,
  TRAIT_ANIMAL_FLAG,
  ANIMAL_DEATH_REASON
} from '../../shared/models/game/evolution/constants';
import * as tt from '../../shared/models/game/evolution/traitTypes';
import * as pt from '../../shared/models/game/evolution/plantarium/plantTypes';

import {TraitNeoplasm} from '../../shared/models/game/evolution/traitsData/cons';

const byId = id => object => object.id === id;

/**
 * TRAITS
 */

/**
 * LOGGING
 * */

//const addToGameLog = (message) => (game) => game.update('log', log => log.push(message));
const addToGameLog = (message) => (game) => game.update('log', log => log.push({
  timestamp: Date.now()
  , message
}));

export const logAnimal = animal => animal && ['$Animal'].concat(animal.traits.toArray()
  .filter(trait => !trait.getDataModel().hidden)
  .map(trait => trait.type));

export const logPlant = plant => plant && ['$Plant'].concat(plant.traits.toArray()
  .filter(trait => !trait.getDataModel().hidden)
  .map(trait => trait.type));

const logAnimalById = (game, animalId) => {
  return logAnimal(game.locateAnimal(animalId));
};

const logTrait = (game, traitId) => {
  return traitId;
};

/**
 * OK LETS REDUCE!
 */

export const gameStart = game => game
  .setIn(['status', 'phase'], PHASE.DEPLOY)
  .setIn(['status', 'round'], 0);

export const gameGiveCards = (game, {userId, cards}) => {
  ensureParameter(userId, 'string');
  ensureParameter(cards, List);
  return game
    .update('deck', deck => deck.skip(cards.size))
    .updateIn(['players', userId, 'hand'], hand => hand.concat(cards))
    .update(addToGameLog(['gameGiveCards', userId, cards.size]));
};

const gameDeployAnimal = (animal, card, position) => (game) => {
  //console.log('gameDeployAnimal', animal)
  return game
    .updateIn(['players', animal.ownerId, 'continent'], continent => OrderedMap(continent.entrySeq().splice(position, 0, [animal.id, animal])));
};

export const gameDeployAnimalFromHand = (game, {userId, animal, animalPosition, cardId}) => {
  const {card, cardIndex} = game.locateCard(cardId, userId);
  return game
    .removeIn(['players', userId, 'hand', cardIndex])
    .update(gameDeployAnimal(animal, card, animalPosition))
    .update(addToGameLog(['gameDeployAnimal', userId]));
};

export const gameDeployAnimalFromDeck = (game, {animal, sourceAid}) => {
  const ending = game.deck.size === 1;
  const parent = game.locateAnimal(sourceAid);
  const animalIndex = game.getPlayer(parent.ownerId).continent.keySeq().keyOf(sourceAid);
  const card = game.getIn(['deck', 0]);
  return game
    .update(game => !ending ? game
      : game
        .update('players', players => players.map(player => player
          .update('continent', continent => continent.map(animal => animal.setIn(['flags', TRAIT_ANIMAL_FLAG.HIBERNATED], false))))))
    .update('deck', deck => deck.skip(1))
    .update(gameDeployAnimal(animal, card, animalIndex + 1))
    .update(addToGameLog(['traitGiveBirth', logAnimal(parent)]));
};

export const gameDeployTrait = (game, {cardId, traits}) => {
  const {playerId: cardOwnerId, cardIndex} = game.locateCard(cardId);
  const animals = [];
  return game
    .removeIn(['players', cardOwnerId, 'hand', cardIndex])
    .update(game => traits.reduce((game, trait) => {
      const animal = game.locateAnimal(trait.hostAnimalId);
      animals.push(logAnimal(animal));
      return game.updateIn(['players', animal.ownerId, 'continent', trait.hostAnimalId], a => a.traitAttach(trait))
    }, game))
    .update(addToGameLog(['gameDeployTrait', cardOwnerId, traits[0].type].concat(animals)));
};

export const gameDeployPlantTraits = (game, {cardId, traits}) => {
  const {playerId: cardOwnerId, cardIndex} = game.locateCard(cardId);
  const plants = [];
  return game
    .removeIn(['players', cardOwnerId, 'hand', cardIndex])
    .update(game => traits.reduce((game, trait) => {
      const plant = game.getPlant(trait.hostAnimalId);
      plants.push(logPlant(plant));
      return game.updateIn(['plants', plant.id], a => a.traitAttach(trait))
    }, game))
    .update(addToGameLog(['gameDeployTrait', cardOwnerId, traits[0].type].concat(plants)));
};

export const traitAnimalAttachTrait = (game, {sourcePid, sourceAid, trait}) => game
  .updateIn(['players', sourcePid, 'continent', sourceAid], animal => animal.traitAttach(trait));

export const traitAnimalRemoveTrait = (game, {sourcePid, sourceAid, traitId}) => {
  const deadAnimals = [];
  return game
    .updateIn(['players', sourcePid, 'continent'], continent => continent
      .map(animal => animal
        .update(animal => {
          // Drop trait disabling after loss of neoplasm
          if (animal.getIn(['traits', traitId, 'type']) === tt.TraitNeoplasm && !animal.hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)) {
            return animal.update('traits', traits => traits.map(trait => trait.set('disabled', false)))
          }
          return animal;
        })
        .traitDetach(trait => trait.id === traitId || trait.linkId === traitId)
        .update(animal => {
          if (TraitNeoplasm.customFns.shouldKillAnimal(animal)) {
            deadAnimals.push(animal.id);
          }
          return animal;
        })
      ))
    .update(game => deadAnimals.reduce(
      (game, animalId) => animalDeath(game, {type: ANIMAL_DEATH_REASON.NEOPLASM, animalId})
      , game));
};

const recombinateTrait = (trait) => trait.set('value', false).set('disabled', false);

export const traitAnimalRecombinateTraits = (game, {player1id, player2id, animal1id, animal2id, trait1id, trait2id}) => {
  const trait1 = recombinateTrait(game.locateTrait(trait1id, animal1id, player1id));
  const trait2 = recombinateTrait(game.locateTrait(trait2id, animal2id, player2id));

  let animal1 = game.locateAnimal(animal1id, player1id)
    .traitDetach(trait => trait.id === trait1id);
  if (trait1.type === tt.TraitNeoplasm && !animal1.hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)) {
    animal1 = animal1.update('traits', traits => traits.map(trait => trait.set('disabled', false)));
  }

  let animal2 = game.locateAnimal(animal2id, player2id)
    .traitDetach(trait => trait.id === trait2id);
  if (trait2.type === tt.TraitNeoplasm && !animal2.hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)) {
    animal2 = animal2.update('traits', traits => traits.map(trait => trait.set('disabled', false)));
  }

  if (!trait2.getDataModel().checkTraitPlacementFails(animal1))
    animal1 = animal1.traitAttach(trait2);
  if (!trait1.getDataModel().checkTraitPlacementFails(animal2))
    animal2 = animal2.traitAttach(trait1);

  if (TraitNeoplasm.customFns.shouldKillAnimal(animal1)) {
    game = animalDeath(game, {type: ANIMAL_DEATH_REASON.NEOPLASM, animalId: animal1id});
  } else {
    game = game.setIn(['players', player1id, 'continent', animal1id], animal1)
  }
  if (TraitNeoplasm.customFns.shouldKillAnimal(animal2)) {
    game = animalDeath(game, {type: ANIMAL_DEATH_REASON.NEOPLASM, animalId: animal2id});
  } else {
    game = game.setIn(['players', player2id, 'continent', animal2id], animal2)
  }
  return game;
};

export const traitAttachToPlant = (game, {plantId, trait}) => game
  .updateIn(['plants', plantId], plant => plant.traitAttach(trait));

export const traitDetachFromPlant = (game, {plantId, traitId}) => {
  return game
    .updateIn(['plants', plantId], plant => plant.traitDetach(trait => trait.id === traitId || trait.linkId === traitId));
};

export const playerActed = (game, {userId}) => {
  return game
    .setIn(['players', userId, 'acted'], true)
    .update('cooldowns', cooldowns => cooldowns.eventNextAction());
};

export const gameEndTurn = (game, {userId}) => {
  const acted = game.getIn(['players', userId, 'acted']);
  const hand = game.getIn(['players', userId, 'hand']);
  return game
    .setIn(['players', userId, 'ended'], game.status.phase === PHASE.DEPLOY && (!acted || hand.size === 0))
    .setIn(['players', userId, 'acted'], false)
    .update(addToGameLog(['gameEndTurn', userId, acted]));
};

export const gameNextRound = (game, {}) => game
  .updateIn(['status', 'round'], round => round + 1)
  .update(addToGameLog(['gameNextRound']));

export const gameNextPlayer = (game, {playerId}) => game
  .gameNextPlayer(playerId)
  .update(addToGameLog(['gameNextPlayer', playerId]));

export const gameAddTurnTimeout = (game, {turnStartTime, turnDuration}) => game
  .setIn(['status', 'turnStartTime'], turnStartTime)
  .setIn(['status', 'turnDuration'], turnDuration);

export const gameSetUserTimedOut = (game, {playerId, timedOut}) => game.setIn(['players', playerId, 'timedOut'], timedOut);

export const gameSetUserWantsPause = (game, {userId, wantsPause}) => game.setIn(['players', userId, 'wantsPause'], wantsPause);

export const gameSetPaused = (game, {paused}) => game.setIn(['status', 'paused'], paused);

/**
 * GAME PHASES
 * */

export const gameStartTurn = (game) => {
  const roundPlayerIndex = game.getPlayer(game.status.roundPlayer).index;
  const nextRoundPlayerIndex = (roundPlayerIndex + 1) % game.players.size;
  const nextRoundPlayerId = game.players.find(p => p.index === nextRoundPlayerIndex).id;
  return game
    .updateIn(['status', 'turn'], turn => ++turn)
    .setIn(['status', 'roundPlayer'], nextRoundPlayerId)
    .setIn(['food'], 0)
    .mapPlants(plant => plant
      .set('food', plant.getFood() === 0 ? 1 : plant.data.produceFood(game, plant))
      .set('covers', plant.coverSlots)
    )
    .update('cooldowns', cooldowns => cooldowns.eventNextTurn());
};

export const gameStartDeploy = (game) => {
  return game
    .update('players', players => players.map(player => player
      .set('ended', !player.playing)
      .update('continent', continent => continent.map(animal => animal
        .set('food', 0)
        .set('flags', Map())
        .update('traits', traits => traits
          .map(trait => trait.type === tt.TraitIntellect ? trait.set('value', false) : trait)
          .map(trait => trait.set('disabled', false))
        )
        .update(animal => TraitNeoplasm.customFns.actionProcess(animal))
      ))
    ))
    .setIn(['status', 'round'], 0)
};

export const gameStartFeeding = (game, {food = 0}) => {
  ensureParameter(food, 'number');
  return game
    .update('players', players => players.map(player => player
      .set('ended', !player.playing)))
    .update('plants', plants => plants.map(plant => plant.set('covers', plant.coverSlots)))
    .setIn(['food'], food)
    .setIn(['status', 'round'], 0)
    .update(processNeoplasm)
};

const processNeoplasm = (game) => {
  let deadAnimals = [];
  return game
    .update('players', players => players.map(player => player.update('continent', continent => continent
      .map(animal => {
        const traitNeoplasm = animal.hasTrait(tt.TraitNeoplasm);
        if (!traitNeoplasm) return animal;
        const updatedAnimal = TraitNeoplasm.customFns.actionMoveInAnimal(animal);
        if (updatedAnimal) {
          return TraitNeoplasm.customFns.actionProcess(updatedAnimal);
        } else {
          deadAnimals.push(animal.id);
          return animal;
        }
      })
    )))
    .update(game => deadAnimals.reduce(
      (game, animalId) => animalDeath(game, {type: ANIMAL_DEATH_REASON.NEOPLASM, animalId})
      , game));
};

export const gameStartExtinct = (game) => game
// AUTO FAT PROCESSING - disabled by rules. TODO delete on sight
// .update('players', players => players.map(player => player
//   .update('continent', continent => continent.map(animal => animal.digestFood()))
// ));

export const gameStartRegeneration = (game) => game
  .setIn(['status', 'round'], 0);

const gameStartPhaseUpdate = {
  [PHASE.PREPARE]: (game) => game
  , [PHASE.DEPLOY]: gameStartDeploy
  , [PHASE.FEEDING]: gameStartFeeding
  , [PHASE.AMBUSH]: (game) => game
  , [PHASE.EXTINCTION]: gameStartExtinct
  , [PHASE.REGENERATION]: gameStartRegeneration
  , [PHASE.FINAL]: (game) => game
};

export const gameStartPhase = (game, {phase, timestamp, data}) => (game
    .setIn(['status', 'phase'], phase)
    .setIn(['status', 'turnStartTime'], timestamp)
    .update(addToGameLog(['gameStartPhase', phase, data]))
    .update(game => gameStartPhaseUpdate[phase](game, data))
);

/**
 * Traits
 * */

export const gameDeployRegeneratedAnimal = (game, {userId, cardId, animalId, source}) => game
  .update(game => {
    if (source === 'DECK') {
      return game.update('deck', deck => deck.skip(1))
    } else {
      const {cardIndex} = game.locateCard(cardId, userId);
      return game.removeIn(['players', userId, 'hand', cardIndex]);
    }
  })
  .update(game => traitSetAnimalFlag(game, {sourceAid: animalId, flag: TRAIT_ANIMAL_FLAG.REGENERATION, on: false}))
;

export const traitMoveFood = (game, {animalId, amount, sourceType, sourceId}) => {
  ensureParameter(animalId, 'string');
  ensureParameter(amount, 'number');
  const animal = game.locateAnimal(animalId);

  const updatedGame = game
    .updateIn(['players', animal.ownerId, 'continent', animal.id], animal => animal.receiveFood(amount));

  switch (sourceType) {
    case 'GAME': {
      return updatedGame
        .update('food', food => food - amount)
        .update(addToGameLog(['traitMoveFood', amount, sourceType, logAnimal(animal)]));
    }
    case 'PLANT': {
      const source = game.getPlant(sourceId);
      return updatedGame
        .updateIn(['plants', sourceId, 'food'], food => Math.max(food - amount, 0))
        .update(addToGameLog(['traitMoveFood', amount, sourceType, logAnimal(animal), logPlant(source)]));
    }
    case tt.TraitPiracy: {
      const source = game.locateAnimal(sourceId);
      return updatedGame
        .updateIn(['players', source.ownerId, 'continent', sourceId, 'food'], food => Math.max(food - amount, 0))
        .update(addToGameLog(['traitMoveFood', amount, sourceType, logAnimal(animal), logAnimal(source)]));
    }
    default: {
      return updatedGame
        .update(addToGameLog(['traitMoveFood', amount, sourceType, logAnimal(animal), logAnimalById(game, sourceId)]));
    }
  }
};

export const traitMoveCard = (game, {fromPid, toPid, cardId}) => {
  const card = game.getPlayer(fromPid).hand.find(byId(cardId));
  return game
    .updateIn(['players', fromPid, 'hand'], hand => hand.filterNot(byId(cardId)))
    .updateIn(['players', toPid, 'hand'], hand => hand.push(card))
    .update(addToGameLog(['traitMoveCard', fromPid, toPid]));
};

export const animalDeath = (game, {type, animalId, data}) => {
  const animal = game.locateAnimal(animalId);
  const shell = animal.hasTrait(tt.TraitShell);
  return game
    .updateIn(['players', animal.ownerId, 'scoreDead'], scoreDead => scoreDead + 1 + animal.traits.size + (!!shell ? -1 : 0))
    .removeIn(['players', animal.ownerId, 'continent', animalId])
    .updateIn(['players', animal.ownerId, 'continent'], continent => continent
      .map(a => a.traitDetach(trait => trait.linkAnimalId === animal.id)))
    .updateIn(['areas', AREA.STANDARD, 'shells'], shells => shell ? shells.set(shell.id, shell) : shells)
    .mapPlants(plant => plant.type !== pt.PlantFungus ? plant
      : plant.set('food', Math.min(plant.data.maxFood, plant.getFood() + 1)))
    .update(addToGameLog(['animalDeath', type, logAnimal(animal)]));
};

export const plantDeath = (game, {plantId}) => {
  const plant = game.getPlant(plantId);
  return game
    .removeIn(['plants', plantId])
    .update('plants', plants => plants.map(p =>
      p.traitDetach(trait => trait.linkAnimalId === plantId)
    ))
    .update('deckPlantsDiscard', deck => !deck ? deck : deck.push(plant.type))
    .update(addToGameLog(['plantDeath', logPlant(plant)]));
};

export const startCooldown = (game, {link, duration, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.startCooldown(link, duration, place, placeId));

export const clearCooldown = (game, {link, place, placeId}) =>
  game.update('cooldowns', cooldowns => cooldowns.clearCooldown(link, place, placeId));

// Transferring new game for game.end
export const gameEnd = (oldGame, {game}) => {
  const scoreboard = game.players.reduce((result, player, playerId) => result.concat([{
    playerId
    , playing: player.playing
    , scoreNormal: player.countScore()
    , scoreDead: player.scoreDead
    , scoreRandom: getRandom()
  }]), []);

  const scoreboardFinal = scoreboard.sort((p1, p2) =>
    !p1.playing ? 1
      : !p2.playing ? -1
      : p2.scoreNormal !== p1.scoreNormal ? p2.scoreNormal - p1.scoreNormal
        : p2.scoreDead !== p1.scoreDead ? p2.scoreDead - p1.scoreDead
          : p2.scoreRandom - p1.scoreRandom);

  return game
    .set('scoreboardFinal', scoreboardFinal)
    .set('winnerId', scoreboardFinal[0].playerId)
    .setIn(['status', 'phase'], PHASE.FINAL);
};

export const gamePlayerLeft = (game, {userId}) => game
  .setIn(['players', userId, 'hand'], List())
  .setIn(['players', userId, 'playing'], false);

export const traitQuestion = (game, {question}) => game
  .set('question', question);

export const traitAnswerSuccess = (game, {questionId}) => game
  .remove('question');

export const traitGrazeFood = (game, {food}) => game
  .set('food', Math.max(game.food - 1, 0));

export const traitParalyze = (game, {animalId}) => {
  const animal = game.locateAnimal(animalId);
  const linkedTraits = [];
  return game
    .update(game => traitSetAnimalFlag(game, {sourceAid: animalId, flag: TRAIT_ANIMAL_FLAG.PARALYSED, on: true}))
    .updateIn(['players', animal.ownerId, 'continent', animal.id], animal => animal
      .update('traits', traits => traits.map(trait => {
        if (trait.isLinked()) linkedTraits.push(trait.findLinkedTrait(game));
        return trait.set('disabled', true)
      }))
      .recalculateFood()
    )
    .update(game => linkedTraits.reduce((game, trait) =>
        game.updateIn(['players', trait.ownerId, 'continent', trait.hostAnimalId], animal => animal
          .setIn(['traits', trait.id, 'disabled'], true)
          .recalculateFood()
        )
      , game));
};

export const traitConvertFat = (game, {sourceAid, traitId}) => {
  const animal = game.locateAnimal(sourceAid);

  return game.updateIn(['players', animal.ownerId, 'continent', animal.id], animal => {
    const traitIndex = animal.traits.valueSeq().findIndex(t => t.id === traitId);
    const availableFat = animal.traits.take(traitIndex + 1).filter(trait => trait.type === tt.TraitFatTissue && trait.value).size;
    let fatCounter = availableFat;
    return animal
      .update('traits', traits => traits.map(trait =>
        (trait.type === tt.TraitFatTissue && trait.value) ? trait.set('value', fatCounter-- <= 0)
          : trait))
      .receiveFood(availableFat)
  });
};

export const traitSetAnimalFlag = (game, {sourceAid, flag, on}) => {
  const animal = game.locateAnimal(sourceAid);
  if (animal) return game.setIn(['players', animal.ownerId, 'continent', animal.id, 'flags', flag], on);

  const plant = game.getPlant(sourceAid);
  if (plant) return game.setIn(['plants', plant.id, 'flags', flag], on);

  logger.error(`Cannot traitSetAnimalFlag for ${sourceAid} (${flag} ${on})`);
  return game;
};

export const traitSetValue = (game, {sourceAid, traitId, value}) => {
  const animal = game.locateAnimal(sourceAid);
  if (animal) return game.setIn(['players', animal.ownerId, 'continent', animal.id, 'traits', traitId, 'value'], value);

  const plant = game.getPlant(sourceAid);
  if (plant) return game.setIn(['plants', plant.id, 'traits', traitId, 'value'], value);

  logger.error(`Cannot traitSetValue for ${sourceAid} (${traitId} ${value})`);
  return game;
};

const traitNotify_Start_getTarget = {
  'TraitCommunication': (game, animalId) => [logAnimalById(game, animalId)]
  , 'TraitCooperation': (game, animalId) => [logAnimalById(game, animalId)]
  , 'TraitPoisonous': (game, animalId) => [logAnimalById(game, animalId)]
  , [TRAIT_TARGET_TYPE.ANIMAL]: (game, animalId) => [logAnimalById(game, animalId)]
  , [TRAIT_TARGET_TYPE.TRAIT]: (game, targetId) => [logTrait(game, targetId)]
  , [TRAIT_TARGET_TYPE.TWO_TRAITS]: (game, trait1Id, trait2Id) => [logTrait(game, trait1Id), logTrait(game, trait2Id)]
  , default: () => []
};

export const traitNotify_Start = (game, {sourceAid, traitId, traitType, targets}) => {
  if (targets[0] === true) return game;
  const animal = game.locateAnimal(sourceAid);
  const targetType = getTraitDataModel(traitType).targetType;
  const getTarget = traitNotify_Start_getTarget[traitType]
    || traitNotify_Start_getTarget[targetType]
    || traitNotify_Start_getTarget.default;
  const logTargets = getTarget(game, ...targets);
  return game.update(addToGameLog(['traitNotify_Start', logAnimal(animal), traitType].concat(logTargets)));
};

export const traitTakeShell = (game, {continentId, animalId, trait}) => {
  const animal = game.locateAnimal(animalId);
  return game
    .removeIn(['areas', continentId, 'shells', trait.id])
    .updateIn(['players', animal.ownerId, 'continent', animal.id], a => a.traitAttach(trait))
    .update(addToGameLog(['traitTakeShell', logAnimal(animal)]));
};


export const traitTakeCover = (game, {animalId, plantId}) => {
  const animal = game.locateAnimal(animalId);
  return game
    .updateIn(['plants', plantId, 'covers'], covers => covers - 1)
    .update(game => traitSetAnimalFlag(game, {sourceAid: animalId, flag: TRAIT_ANIMAL_FLAG.IN_COVER, on: true}))
    .update(addToGameLog(['traitTakeCover', logAnimal(animal), logPlant(game.getPlant(plantId))]));
};

export const traitAmbushActivate = (game, {animalId, on}) => game
  .setIn(['ambush', 'ambushers', animalId], on);
export const gameAmbushPushTarget = (game, {feedingRecord}) => game
  .updateIn(['ambush', 'targets'], targets => targets.push(feedingRecord));
export const gameAmbushShiftTarget = (game, {}) => game
  .updateIn(['ambush', 'targets'], targets => targets.shift());
export const gameAmbushSetAmbushers = (game, {ambushers}) => game
  .setIn(['ambush', 'ambushers'], ambushers.reduce((result, animalId) => result.set(animalId, null), OrderedMap()));
export const gameAmbushPrepareStart = (game, {turnRemainingTime}) => game
  .setIn(['ambush'], AmbushRecord.new(turnRemainingTime));
export const gameAmbushPrepareEnd = (game) => game;
export const gameAmbushAttackStart = (game) => game
  .update('cooldowns', cooldowns => cooldowns.eventNextAction());
export const gameAmbushAttackEnd = (game) => game
  .setIn(['status', 'phase'], PHASE.FEEDING)
  .removeIn(['ambush']);

export const huntStart = (game, {type, attackEntityId, attackPlayerId}) => game
  .update('hunts', hunts => hunts.unshift(HuntRecord({
    type
    , attackEntityId
    , attackPlayerId
  })));
export const huntSetTarget = (game, {attackTraitId, attackTraitType, targetAid, targetPid}) => game
  .setIn(['hunts', 0, 'attackTraitId'], attackTraitId)
  .setIn(['hunts', 0, 'attackTraitType'], attackTraitType)
  .setIn(['hunts', 0, 'targetAid'], targetAid)
  .setIn(['hunts', 0, 'targetPid'], targetPid);

export const huntSetFlag = (game, {key, value}) => game.updateIn(['hunts', 0, 'flags'], flags => flags.add(key));

export const huntUnsetFlag = (game, {key, value}) => game.updateIn(['hunts', 0, 'flags'], flags => flags.remove(key));

export const huntEnd = (game, {}) => game.update('hunts', hunts => hunts.shift());

// region Plantarium
export const gameSpawnPlants = (game, {plants}) => {
  return game
    .update(game => {
      if (game.deckPlants === null) {
        // client
        return game;
      }

      let deck = game.deckPlants;
      let resetDiscard = false;

      if (plants.size > deck.size) {
        // No shuffling because it's a feature creep
        deck = deck.concat(game.deckPlantsDiscard);
      }
      return game
        .set('deckPlants', deck.skip(plants.size))
    })
    .update('plants', plantsMap => plants.reduce((result, plant) => result.set(plant.id, plant), plantsMap))
    .update(addToGameLog(['gameSpawnPlants', plants.size]));
}

export const gameDeployPlant = (game, {plant}) => game
  .setIn(['plants', plant.id], plant)
  .update(addToGameLog(['gameDeployPlant', logPlant(plant)]));

export const gamePlantUpdateFood = (game, {plantId, amount}) => game
  .updateIn(['plants', plantId], plant => plant.receiveFood(amount))
  .update(addToGameLog(['gamePlantUpdateFood', logPlant(game.getPlant(plantId)), amount]));
// endregion

export const reducer = createReducer(Map(), {
  gameCreateSuccess: (state, {game}) => state.set(game.id, game)
  , gameDestroy: (state, data) => state.remove(data.gameId)
  , gameStart: (state, data) => state.update(data.gameId, game => gameStart(game, data))
  , gameGiveCards: (state, data) => state.update(data.gameId, game => gameGiveCards(game, data))

  , gameNextRound: (state, data) => state.update(data.gameId, game => gameNextRound(game, data))
  , gameNextPlayer: (state, data) => state.update(data.gameId, game => gameNextPlayer(game, data))
  , gameAddTurnTimeout: (state, data) => state.update(data.gameId, game => gameAddTurnTimeout(game, data))
  , gameDeployAnimalFromHand: (state, data) => state.update(data.gameId, game => gameDeployAnimalFromHand(game, data))
  , gameDeployAnimalFromDeck: (state, data) => state.update(data.gameId, game => gameDeployAnimalFromDeck(game, data))
  , gameDeployTrait: (state, data) => state.update(data.gameId, game => gameDeployTrait(game, data))
  , gameDeployPlantTraits: (state, data) => state.update(data.gameId, game => gameDeployPlantTraits(game, data))
  , gameDeployRegeneratedAnimal: (state, data) => state.update(data.gameId, game =>
    gameDeployRegeneratedAnimal(game, data))
  , gameEndTurn: (state, data) => state.update(data.gameId, game => gameEndTurn(game, data))
  , gameEnd: (state, data) => state.update(data.gameId, game => gameEnd(game, data))
  , gamePlayerLeft: (state, data) => state.update(data.gameId, game => gamePlayerLeft(game, data))
  , gameStartTurn: (state, data) => state.update(data.gameId, game => gameStartTurn(game, data))
  , gameStartPhase: (state, data) => state.update(data.gameId, game => gameStartPhase(game, data))
  , gameSetUserTimedOut: (state, data) => state.update(data.gameId, game => gameSetUserTimedOut(game, data))
  , gameSetUserWantsPause: (state, data) => state.update(data.gameId, game => gameSetUserWantsPause(game, data))
  , gameSetPaused: (state, data) => state.update(data.gameId, game => gameSetPaused(game, data))

  , traitAmbushActivate: (state, data) => state.update(data.gameId, game => traitAmbushActivate(game, data))
  , gameAmbushPrepareStart: (state, data) => state.update(data.gameId, game => gameAmbushPrepareStart(game, data))
  , gameAmbushPrepareEnd: (state, data) => state.update(data.gameId, game => gameAmbushPrepareEnd(game, data))
  , gameAmbushAttackStart: (state, data) => state.update(data.gameId, game => gameAmbushAttackStart(game, data))
  , gameAmbushAttackEnd: (state, data) => state.update(data.gameId, game => gameAmbushAttackEnd(game, data))
  , gameAmbushPushTarget: (state, data) => state.update(data.gameId, game => gameAmbushPushTarget(game, data))
  , gameAmbushShiftTarget: (state, data) => state.update(data.gameId, game => gameAmbushShiftTarget(game, data))
  , gameAmbushSetAmbushers: (state, data) => state.update(data.gameId, game => gameAmbushSetAmbushers(game, data))

  , playerActed: (state, data) => state.update(data.gameId, game => playerActed(game, data))
  , animalDeath: (state, data) => state.update(data.gameId, game => animalDeath(game, data))
  , plantDeath: (state, data) => state.update(data.gameId, game => plantDeath(game, data))

  , traitMoveFood: (state, data) => state.update(data.gameId, game => traitMoveFood(game, data))
  , traitMoveCard: (state, data) => state.update(data.gameId, game => traitMoveCard(game, data))

  , startCooldown: (state, data) => state.update(data.gameId, game => startCooldown(game, data))
  , clearCooldown: (state, data) => state.update(data.gameId, game => clearCooldown(game, data))
  , traitQuestion: (state, data) => state.update(data.gameId, game => traitQuestion(game, data))
  , traitAnswerSuccess: (state, data) => state.update(data.gameId, game => traitAnswerSuccess(game, data))

  , traitAnimalAttachTrait: (state, data) => state.update(data.gameId, game => traitAnimalAttachTrait(game, data))
  , traitAnimalRemoveTrait: (state, data) => state.update(data.gameId, game => traitAnimalRemoveTrait(game, data))
  , traitAnimalRecombinateTraits: (state, data) =>
    state.update(data.gameId, game => traitAnimalRecombinateTraits(game, data))

  , traitAttachToPlant: (state, data) => state.update(data.gameId, game => traitAttachToPlant(game, data))
  , traitDetachFromPlant: (state, data) => state.update(data.gameId, game => traitDetachFromPlant(game, data))
  , traitConvertFat: (state, data) => state.update(data.gameId, game => traitConvertFat(game, data))
  , traitGrazeFood: (state, data) => state.update(data.gameId, game => traitGrazeFood(game, data))
  , traitParalyze: (state, data) => state.update(data.gameId, game => traitParalyze(game, data))
  , traitSetAnimalFlag: (state, data) => state.update(data.gameId, game => traitSetAnimalFlag(game, data))
  , traitSetValue: (state, data) => state.update(data.gameId, game => traitSetValue(game, data))
  , traitNotify_Start: (state, data) => state.update(data.gameId, game => traitNotify_Start(game, data))
  // , traitNotify_End: (state, data) => state.update(data.gameId, game => traitNotify_End(game, data))
  , traitTakeShell: (state, data) => state.update(data.gameId, game => traitTakeShell(game, data))
  , traitTakeCover: (state, data) => state.update(data.gameId, game => traitTakeCover(game, data))
  , testHackGame: (state, data) => state.update(data.gameId, data.callback)

  , huntStart: (state, data) => state.update(data.gameId, game => huntStart(game, data))
  , huntSetTarget: (state, data) => state.update(data.gameId, game => huntSetTarget(game, data))
  , huntSetFlag: (state, data) => state.update(data.gameId, game => huntSetFlag(game, data))
  , huntUnsetFlag: (state, data) => state.update(data.gameId, game => huntUnsetFlag(game, data))
  , huntEnd: (state, data) => state.update(data.gameId, game => huntEnd(game, data))

  , gameSpawnPlants: (state, data) => state.update(data.gameId, game => gameSpawnPlants(game, data))
  , gameDeployPlant: (state, data) => state.update(data.gameId, game => gameDeployPlant(game, data))
  , gamePlantUpdateFood: (state, data) => state.update(data.gameId, game => gamePlantUpdateFood(game, data))
});