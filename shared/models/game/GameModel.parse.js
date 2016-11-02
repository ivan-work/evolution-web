import uuid from 'node-uuid';
import invariant from 'invariant';
import {Map, List} from 'immutable';

import {GameModel, StatusRecord} from './GameModel';
import {PlayerModel} from './PlayerModel';
import {CardModel} from './CardModel';
import {AnimalModel} from './evolution/AnimalModel';
import {TraitModel} from './evolution/TraitModel';
import * as cardData from './evolution/cardData';
import yaml from 'yaml-js';

const searchCardClasses = (name) => Object.keys(cardData)
  .filter(cardClassName => cardData[cardClassName])
  .map(cardClassName => cardData[cardClassName])
  .find(cardClass => ~cardClass.type.toLowerCase().indexOf(name.toLowerCase()));

export const parseCardList = string => {
  invariant(typeof string === 'string', `GameModel.parseCardList: bad string: (${string})`)
  return GameModel.generateDeck(string
    .split(',')
    .map(raw => {
      let countAndCard = raw.trim().split(' ');
      if (countAndCard.length === 1) {
        if (countAndCard[0].length === 0) {
          return null;
        } else {
          countAndCard = [1, countAndCard[0]];
        }
      }
      if (countAndCard.length > 2) {
        console.warn(`Cannot parse CardAndCount[${raw}]`);
        return null;
      }
      const cardClass = searchCardClasses(countAndCard[1]);
      invariant(cardClass, `GameModel.parseCardList: can't find ${countAndCard[1]}`);
      countAndCard[1] = cardClass;
      return countAndCard;
    })
    .filter(cc => cc !== null));
};

export const parseAnimalList = (userId, string) => {
  invariant(typeof userId === 'string', `GameModel.parseAnimalList wrong userId: (${userId})`)
  invariant(typeof string === 'string', `GameModel.parseAnimalList wrong string: (${string})`)
  return List(string.split(','))
    .map(rawAnimal => rawAnimal.trim())
    .filter(rawAnimal => rawAnimal.length > 0)
    .map(rawAnimal => rawAnimal
      .split(' ')
      .reduce((animal, prop) => {
        prop = prop.trim();
        if (/^\$.*$/.test(prop)) {
          return prop.length > 1 ? animal.set('id', prop) : animal;
        } else if (/^\++$/.test(prop)) {
          return animal.set('food', prop.length)
        } else {
          return animal.update('traits', traits => traits.push(
            TraitModel.parse(prop).attachTo(animal)
          ))
        }
      }, AnimalModel.new(userId)));
};

export const parseFromRoom = (room, string = '') => {
  const seed = yaml.load(string) || {};

  const deck = parseCardList(seed.deck || '').map(card => card.toClient());

  if (seed.phase === void 0) seed.phase = 1;

  const players = room.users.reduce((result, id, index) => {
    const player = new PlayerModel({
      id
      , hand: parseCardList(seed.players && seed.players[index] && seed.players[index].hand || '')
      , continent: parseAnimalList(id, seed.players && seed.players[index] && seed.players[index].continent || '')
      , ready: seed.phase !== 0
      , index
      , ended: false
    }).toClient();
    result[id] = player;
    return result;
  }, {});

  return GameModel.fromServer({
    id: uuid.v4().slice(0, 4)
    , roomId: room.id
    , food: seed.food || 0
    , started: seed.phase !== 0
    , status: new StatusRecord({
      phase: seed.phase
    })
    , deck
    , players
  });
};

export const parseRaw = (string) => parseFromRoom({
  id: 'test'
  , users
}, string);
