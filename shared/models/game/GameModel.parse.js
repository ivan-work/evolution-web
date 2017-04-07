import uuid from 'node-uuid';
import invariant from 'invariant';
import {Map, List} from 'immutable';

import {GameModel, StatusRecord} from './GameModel';
import {PlayerModel} from './PlayerModel';
import {AnimalModel} from './evolution/AnimalModel';
import {TraitModel} from './evolution/TraitModel';
import * as cardClasses from './evolution/cards';
import yaml from 'yaml-js';

const searchCardClasses = (name) => cardClasses[Object.keys(cardClasses)
  .find(cardClassName => ~cardClasses[cardClassName].type.toLowerCase().indexOf(name.toLowerCase()))];

export const parseCardList = string => {
  invariant(typeof string === 'string', `GameModel.parseCardList: bad string: (${string})`)
  return GameModel.generateDeck(string
    .split(',')
    .map(raw => {
      const countAndCard = raw.trim().split(' ');
      if (countAndCard.length !== 2) return null;
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
        if ('$' === prop) {
          return animal;
        } else if (/^\++$/.test(prop)) {
          return animal.set('food', prop.length)
        } else {
          return animal.update('traits', traits => traits.push(TraitModel.parse(prop)))
        }
      }, AnimalModel.new(userId)));
};

export const parse = (room, string = '') => {
  const seed = yaml.load(string) || {};

  const deck = parseCardList(seed.deck || '');

  const players = room.users.reduce((result, id, index) => {
    const player = new PlayerModel({
      id
      , hand: parseCardList(seed.players && seed.players[index] && seed.players[index].hand || '')
      , continent: parseAnimalList(id, seed.players && seed.players[index] && seed.players[index].continent || '')
      , ready: true
      , index
      , ended: false
    });
    return result.set(id, player);
  }, Map());

  return GameModel.fromServer({
    id: uuid.v4().slice(0, 4)
    , roomId: room.id
    , food: seed.food || 0
    , started: true
    , status: new StatusRecord({
      phase: seed.phase || 1
    })
    , deck
    , players
  });
};
