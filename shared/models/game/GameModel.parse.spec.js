import {List, Map} from 'immutable';
import {GameModel, StatusRecord} from './GameModel';
import {AnimalModel} from './evolution/AnimalModel';
import {TraitModel} from './evolution/TraitModel';
import * as cardTypes from './evolution/cards';

describe('GameModel.parse', () => {
  it('parseCardList', () => {
    const list = GameModel.parseCardList('  1 carn, 2 sharp  ');
    expect(list.size).equal(3);
    expect(list.first().type).equal(cardTypes.CardCarnivorous.type);
    expect(list.last().type).equal(cardTypes.CardSharpVision.type);

    expect(GameModel.parseCardList(''), 'parseCardList(empty)').equal(List());
  });

  it('parseAnimalList', () => {
    const list = GameModel.parseAnimalList('u', ' carn sharp , sharp camo ');
    expect(list.size).equal(2);
    expect(list.first().traits.size).equal(2);
    expect(list.last().traits.size).equal(2);
    expect(list.first().traits.first().type).equal('TraitCarnivorous');
    expect(list.first().traits.last().type).equal('TraitSharpVision');
    expect(list.last().traits.first().type).equal('TraitSharpVision');
    expect(list.last().traits.last().type).equal('TraitCamouflage');

    expect(GameModel.parseAnimalList('u', ''), 'parseAnimalList(empty)').equal(List());

    expect(GameModel.parseAnimalList('u', '$').size, 'parseAnimalList($)').equal(1);
    expect(GameModel.parseAnimalList('u', '$').first().traits.size, 'parseAnimalList($)').equal(0);
  });

  it('parseAnimalListWithFood', () => {
    const list = GameModel.parseAnimalList('u', '$, +, $ ++ carn sharp, $ sharp camo, + camo');
    expect(list.size).equal(5);
    expect(list.get(0).traits.size).equal(0);
    expect(list.get(1).traits.size).equal(0);
    expect(list.get(2).traits.size).equal(2);
    expect(list.get(2).traits.get(0).type).equal('TraitCarnivorous');
    expect(list.get(2).traits.get(1).type).equal('TraitSharpVision');
    expect(list.get(3).traits.size).equal(2);
    expect(list.get(3).traits.get(0).type).equal('TraitSharpVision');
    expect(list.get(3).traits.get(1).type).equal('TraitCamouflage');
    expect(list.get(4).traits.size).equal(1);
    expect(list.get(4).traits.get(0).type).equal('TraitCamouflage');

    expect(list.get(0).getFood()).equal(0);
    expect(list.get(1).getFood()).equal(1);
    expect(list.get(2).getFood()).equal(2);
    expect(list.get(3).getFood()).equal(0);
    expect(list.get(4).getFood()).equal(1);
  });

  it('Valid Seed', () => {
    const parsed = GameModel.parse({id: 'r0', users: List(['u0', 'u1'])}
      , `
deck: 12 carnivorous, 6 sharp
food: 2
players:
  - hand: 2 carn
    continent: carn sharp, sharp camo
`);

    expect(parsed.roomId).equal('r0');
    expect(parsed.food).equal(2);
    expect(parsed.started).equal(true);
    expect(parsed.status).equal(new StatusRecord({
      turn: 0
      , round: 0
      , player: 0
      , phase: 1
    }));
    expect(parsed.deck.size).equal(18);
    expect(parsed.deck.first().type).equal('CardCarnivorous');
    expect(parsed.deck.last().type).equal('CardSharpVision');
    expect(parsed.getIn(['players', 'u0', 'ready'])).equal(true);
    expect(parsed.getIn(['players', 'u0', 'hand']).size).equal(2);
    expect(parsed.getIn(['players', 'u0', 'hand']).first().type).equal('CardCarnivorous');
    expect(parsed.getIn(['players', 'u0', 'hand']).last().type).equal('CardCarnivorous');

    const parsedContinent = parsed.getIn(['players', 'u0', 'continent']);
    expect(parsedContinent.size).equal(2);
    expect(parsedContinent.first().traits.size).equal(2);
    expect(parsedContinent.last().traits.size).equal(2);
    expect(parsedContinent.first().traits.first().type).equal('TraitCarnivorous');
    expect(parsedContinent.first().traits.last().type).equal('TraitSharpVision');
    expect(parsedContinent.last().traits.first().type).equal('TraitSharpVision');
    expect(parsedContinent.last().traits.last().type).equal('TraitCamouflage');

    expect(parsed.getIn(['players', 'u1', 'ready'])).true;
    expect(parsed.getIn(['players', 'u1', 'hand'])).equal(List());
    expect(parsed.getIn(['players', 'u1', 'continent'])).equal(List());
  });

  it('mockGame.ParseGame', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
deck: 12 carnivorous, 6 sharp
phase: 2
food: 2
players:
  - hand: 2 carn
    continent: carn sharp, sharp camo
`);
    expect(ServerGame().food).equal(2);
    expect(ServerGame().started).equal(true);
    expect(ServerGame().status).equal(new StatusRecord({
      turn: 0
      , round: 0
      , player: 0
      , phase: 2
    }));
    expect(ServerGame().deck.size).equal(18);
    expect(ServerGame().getIn(['players', User0.id, 'ready'])).true;
    expect(ServerGame().getIn(['players', User0.id, 'hand']).size).equal(2);
    expect(ServerGame().getIn(['players', User0.id, 'continent']).size).equal(2);
    expect(ServerGame().getIn(['players', User1.id, 'ready'])).true;
    expect(ServerGame().getIn(['players', User1.id, 'hand'])).equal(List());
    expect(ServerGame().getIn(['players', User1.id, 'continent'])).equal(List());
  });
});