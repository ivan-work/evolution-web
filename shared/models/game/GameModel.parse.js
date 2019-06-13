import logger from "../../utils/logger";
import uuid from 'uuid';
import invariant from 'invariant';
import {OrderedMap} from 'immutable';
import merge from 'lodash/merge'

import {GameModel, generateDeck, StatusRecord, PHASE, generatePlantDeck, AREA} from './GameModel';
import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';
import {AnimalModel} from './evolution/AnimalModel';
import {parsePlantTrait, parseTrait, TraitModel} from './evolution/TraitModel';
import * as cardsData from './evolution/cards/index';
import * as pt from './evolution/plantarium/plantTypes';
import * as ptt from './evolution/plantarium/plantTraitTypes';
import {TraitNeoplasm} from './evolution/traitsData';
import yaml from 'yaml-js';
import PlantModel from "./evolution/plantarium/PlantModel";

const searchCardType = (name) => Object.keys(cardsData)
  .find(cardType => ~cardType.toLowerCase().indexOf(name.toLowerCase()));

const searchPlantType = (name) => Object.keys(pt)
  .find(plantType => ~plantType.toLowerCase().indexOf(name.toLowerCase()));

export const parsePhase = (string) => PHASE[Object.keys(PHASE).find((key) => {
  string = !!string ? string.toUpperCase() : 'DEPLOY';
  return key === string
})];

const getCountAndType = (rawct, defaultCount = 1) => {
  let [count, type] = rawct.trim().split(' ');
  if (type === void 0) {
    type = count.trim();
    count = defaultCount;
  }
  return [+count, type];
};

export const parseCardList = string => {
  invariant(typeof string === 'string', `GameModel.parseCardList: bad string: (${string})`)
  return generateDeck(string
    .split(',')
    .filter(rawct => rawct.trim().length > 0)
    .map(rawct => getCountAndType(rawct, 1))
    .map((countType) => {
      const cardType = searchCardType(countType[1]);
      invariant(cardType, `searchCardType: can't find [${countType[1]}]`);
      countType[1] = cardType;
      return countType;
    }));
};

export const parsePlantDeck = string => {
  invariant(typeof string === 'string', `GameModel.parsePlantDeck: bad string: (${string})`);
  return generatePlantDeck(string
    .split(',')
    .filter(rawct => rawct.trim().length > 0)
    .map(rawct => getCountAndType(rawct, 1))
    .map((countType) => {
      const plantType = searchPlantType(countType[1]);
      invariant(plantType, `searchPlantType: can't find [${countType[1]}]`);
      countType[1] = plantType;
      return countType;
    }));
};

export const parseAnimalList = (userId, string) => {
  invariant(typeof userId === 'string', `GameModel.parseAnimalList wrong userId: (${userId})`);
  invariant(typeof string === 'string', `GameModel.parseAnimalList wrong string: (${string})`);
  const links = [];
  let animalsMap = string.split(',')
    .map(rawAnimal => rawAnimal.trim())
    .filter(rawAnimal => rawAnimal.length > 0)
    .map(rawAnimal => rawAnimal
      .split(' ')
      .reduce((animal, prop) => {
        prop = prop.trim();
        if (/^\$.*$/.test(prop)) {
          return prop.length > 1 ? animal.set('id', prop) : animal;
        }
        if (/^!.*$/.test(prop)) {
          return animal.setIn(['flags', prop], true);
        }
        else if (/\$/.test(prop)) {
          const [traitName, targetId] = prop.split('$');
          links.push([animal.id, traitName, '$' + targetId]);
          return animal;
        }
        else if (/^\++$/.test(prop)) {
          return animal.set('food', prop.length)
        }
        else {
          invariant(!!prop, `GameModel.parseAnimalList prop undefined: (${prop})`);
          const type = parseTrait(prop.split('=')[0]);
          const value = prop.split('=')[1];
          if (!type) throw new Error(`Cannot parse prop (${prop})`);
          return animal.traitAttach(TraitModel.new(type).set('value', value), true);
        }
      }, AnimalModel.new(userId, null)))
    .reduce((result, animal) => result.set(animal.id, animal), OrderedMap());
  links.forEach(([a1id, prop, a2id]) => {
    invariant(animalsMap.has(a1id), 'invalid linkable trait ' + [a1id, prop, a2id]);
    invariant(animalsMap.has(a2id), 'invalid linkable trait ' + [a1id, prop, a2id]);
    const a1 = animalsMap.get(a1id);
    const a2 = animalsMap.get(a2id);
    const [trait1, trait2] = TraitModel.LinkBetween(parseTrait(prop), a1, a2);
    animalsMap = animalsMap
      .set(a1.id, a1.traitAttach(trait1))
      .set(a2.id, a2.traitAttach(trait2));
  });
  return animalsMap
    .map(a => TraitNeoplasm.customFns.actionProcess(a));
};

export const parsePlantsList = (string) => {
  invariant(typeof string === 'string', `parsePlantsList wrong string: (${string})`);
  const links = [];
  let plantsMap = string.split(',')
    .map(plantString => plantString.trim())
    .filter(plantString => plantString.length > 0)
    .map(plantString => {
      const [rawType, ...props] = plantString.split(' ');
      const type = searchPlantType(rawType);
      invariant(!!type, `parsePlantsList wrong plant type: (${rawType})`);
      const plant = PlantModel.new(type).set('food', 0).set('covers', 0);
      return props.reduce((plant, prop) => {
        prop = prop.trim();
        if (/^\$.*$/.test(prop)) {
          return prop.length > 1 ? plant.set('id', prop) : plant;
        }
        else if (/^\$.*$/.test(prop)) {
          return prop.length > 1 ? plant.set('id', prop) : plant;
        }
        else if (/\$/.test(prop)) {
          const [traitName, targetId] = prop.split('$');
          links.push([plant.id, traitName, '$' + targetId]);
          return plant;
        }
        else if (/^\++$/.test(prop)) {
          return plant.set('food', prop.length)
        }
        else if (/^\*+$/.test(prop)) {
          return plant.set('covers', prop.length)
        }
        else {
          invariant(!!prop, `GameModel.parseAnimalList prop undefined: (${prop})`);
          const type = parsePlantTrait(prop.split('=')[0]);
          const value = prop.split('=')[1];
          if (!type) throw new Error(`Cannot parse prop (${prop})`);
          return plant.traitAttach(TraitModel.new(type).set('value', value), true);
        }
      }, plant)
    })
    .reduce((result, plant) => result.set(plant.id, plant), OrderedMap());

  links.forEach(([a1id, prop, a2id]) => {
    invariant(plantsMap.has(a1id), `invalid link(${[a1id, prop, a2id]}): no ${a1id} found in ${plantsMap.keySeq().toJS()}`);
    invariant(plantsMap.has(a2id), `invalid link(${[a1id, prop, a2id]}): no ${a2id} found in ${plantsMap.keySeq().toJS()}`);
    const a1 = plantsMap.get(a1id);
    const a2 = plantsMap.get(a2id);
    const [trait1, trait2] = TraitModel.LinkBetween(parsePlantTrait(prop), a1, a2);
    plantsMap = plantsMap
      .set(a1.id, a1.traitAttach(trait1))
      .set(a2.id, a2.traitAttach(trait2));
  });
  return plantsMap;
};

export const parseFromRoom = (room, string = '') => {
  const seed = merge({
    players: []
    , settings: {}
  }, yaml.load(string));

  const deck = parseCardList(seed.deck || '').map(card => card.toClient());
  const pdeck = seed.settings.addon_plantarium ? parsePlantDeck(seed.pdeck || '') : null;

  const players = room.users.reduce((result, id, index) => {
    return [...result, [id, new PlayerModel({
      id
      , hand: parseCardList(seed.players[index] && seed.players[index].hand || '')
      , continent: parseAnimalList(id, seed.players[index] && seed.players[index].continent || '')
      , index
      , ended: false
    }).toClient()]];
  }, []);

  return GameModel.fromServer(new GameModel({
    id: uuid.v4()
    , roomId: room.id
    , timeCreated: Date.now()
    , food: seed.food || 0
    , status: new StatusRecord({
      roundPlayer: room.users.first()
      , currentPlayer: room.users.first()
      , phase: parsePhase(seed.phase)
    })
    , deck
    , pdeck
    , players
    , plants: parsePlantsList(seed.plants || '').map(p => p.toClient()).entrySeq()
    , settings: {
      ...seed.settings
    }
  }).toJS());
};