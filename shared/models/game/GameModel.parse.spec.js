import {List, Map} from 'immutable';
import {GameModel, PHASE, StatusRecord} from './GameModel';
import {SettingsRecord} from './GameSettings';
import {AnimalModel} from './evolution/AnimalModel';
import {TraitModel} from './evolution/TraitModel';
import * as cardsData from './evolution/cards/index';
import * as traitTypes from './evolution/traitTypes/index';

describe('GameModel.parse', () => {
  it('parseCardList', () => {
    const list = GameModel.parseCardList('  1 carn, 1 sharp, Parasite  ');
    expect(list.size).equal(3);
    expect(list.get(0).type).equal(cardsData.CardCarnivorous.type);
    expect(list.get(0).trait1).equal(traitTypes.TraitCarnivorous);
    expect(list.get(1).type).equal(cardsData.CardSharpVision.type);
    expect(list.get(1).trait1).equal(traitTypes.TraitSharpVision);
    expect(list.get(2).type).equal(cardsData.CardParasiteAndCarnivorous.type);
    expect(list.get(2).trait1).equal(traitTypes.TraitParasite);
    expect(list.get(2).trait2).equal(traitTypes.TraitCarnivorous);

    expect(GameModel.parseCardList(''), 'parseCardList(empty)').equal(List());
  });

  it('parseAnimalList', () => {
    const list = GameModel.parseAnimalList('u', ' carn sharp , sharp camo , $A ');
    expect(list.size).equal(3);
    expect(list.get(0).traits.size).equal(2);
    expect(list.get(0).traits.first().type).equal('TraitCarnivorous');
    expect(list.get(0).traits.last().type).equal('TraitSharpVision');
    expect(list.get(1).traits.size).equal(2);
    expect(list.get(1).traits.first().type).equal('TraitSharpVision');
    expect(list.get(1).traits.last().type).equal('TraitCamouflage');
    expect(list.get(2).id).equal('$A');
    expect(list.get(2).traits.size).equal(0);

    expect(GameModel.parseAnimalList('u', ''), 'parseAnimalList(empty)').equal(List());

    expect(GameModel.parseAnimalList('u', '$').size, 'parseAnimalList($)').equal(1);
    expect(GameModel.parseAnimalList('u', '$').first().traits.size, 'parseAnimalList($)').equal(0);
  });

  it('parseAnimalList with links', () => {
    const list = GameModel.parseAnimalList('u', '$A coop$B symb$C, $B, $C');
    expect(list.size).equal(3);
    expect(list.get(0).traits.size).equal(2);
    expect(list.get(0).traits.first().type).equal('TraitCooperation');
    expect(list.get(0).traits.last().type).equal('TraitSymbiosis');
    expect(list.get(1).traits.size).equal(1);
    expect(list.get(1).traits.first().type).equal('TraitCooperation');
    expect(list.get(2).traits.size).equal(1);
    expect(list.get(2).traits.first().type).equal('TraitSymbiosis');

    const TraitCooperation$A = list.get(0).traits.first();
    const TraitCooperation$B = list.get(1).traits.first();
    const TraitSymbiosis$A = list.get(0).traits.first();
    const TraitSymbiosis$C = list.get(1).traits.first();

    expect(TraitCooperation$A.id).equal(TraitCooperation$B.linkId);
    expect(TraitCooperation$A.hostAnimalId).equal('$A');
    expect(TraitCooperation$A.linkAnimalId).equal('$B');
    expect(TraitCooperation$B.hostAnimalId).equal('$B');
    expect(TraitCooperation$B.linkAnimalId).equal('$A');
    expect(TraitCooperation$A.linkSource).true;
    expect(TraitCooperation$B.linkSource).false;
    expect(TraitCooperation$A.ownerId).equal('u');
    expect(TraitCooperation$B.ownerId).equal('u');

    expect(TraitSymbiosis$A.id).equal(TraitCooperation$B.linkId);
    expect(TraitSymbiosis$A.hostAnimalId).equal('$A');
    expect(TraitSymbiosis$A.linkAnimalId).equal('$B');
    expect(TraitSymbiosis$C.hostAnimalId).equal('$B');
    expect(TraitSymbiosis$C.linkAnimalId).equal('$A');
    expect(TraitSymbiosis$A.linkSource, '$A link source').true;
    expect(TraitSymbiosis$C.linkSource, '$B link source').false;
    expect(TraitSymbiosis$A.ownerId).equal('u');
    expect(TraitSymbiosis$C.ownerId).equal('u');
  });

  it('parseAnimalListWithFood', () => {
    const list = GameModel.parseAnimalList('u', '$A, +, $B ++ carn sharp, $ sharp camo, + camo');
    expect(list.size).equal(5);
    expect(list.get(0).traits.size).equal(0);
    expect(list.get(0).id).equal('$A');
    expect(list.get(1).traits.size).equal(0);
    expect(list.get(2).id).equal('$B');
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
    expect(parsed.status).equal(new StatusRecord({
      turn: 0
      , round: 0
      , player: 0
      , phase: 1
      , started: true
    }));
    expect(parsed.deck.size).equal(18);
    expect(parsed.deck.first().type).equal('CardCarnivorous');
    expect(parsed.deck.first().trait1).equal('TraitCarnivorous');
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
    expect(serverStore.getState().getIn(['rooms', ServerGame().roomId, 'gameId']), 'room.gameId === game.id').equal(ServerGame().id);
    expect(ServerGame().food).equal(2);
    expect(ServerGame().status).equal(new StatusRecord({
      turn: 0
      , round: 0
      , player: 0
      , phase: 2
      , started: true
    }));
    expect(ServerGame().deck.size).equal(18);
    expect(ServerGame().getIn(['players', User0.id, 'ready'])).true;
    expect(ServerGame().getIn(['players', User0.id, 'hand']).size).equal(2);
    expect(ServerGame().getIn(['players', User0.id, 'continent']).size).equal(2);
    expect(ServerGame().getIn(['players', User1.id, 'ready'])).true;
    expect(ServerGame().getIn(['players', User1.id, 'hand'])).equal(List());
    expect(ServerGame().getIn(['players', User1.id, 'continent'])).equal(List());
  });

  it('mockGame.ParseGame settings', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  timeTraitResponse: 10
  timeTurn: 20
  decks: TEST
`);
    expect(ServerGame().settings).equal(new SettingsRecord({
      timeTurn: 20
      , timeTraitResponse: 10
      , decks: List(['TEST'])
    }))
  });

  it('mockGame.ParseGame settings without decks', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  timeTraitResponse: 10
  timeTurn: 20
`);
    expect(ServerGame().settings).equal(new SettingsRecord({
      timeTurn: 20
      , timeTraitResponse: 10
      , decks: List(['Base2'])
    }))
  });

  it('mockGame.ParseGame phase 0', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 12 carnivorous, 6 sharp
phase: 0
food: 2
players:
  - hand: 2 carn
    continent: carn sharp, sharp camo
`);
    expect(ServerGame().status.started).equal(true);
    expect(ServerGame().food, 'ServerGame().food').equal(2);
    expect(ServerGame().status.turn, 'turn').equal(0);
    expect(ServerGame().status.round, 'round').equal(0);
    expect(ServerGame().status.currentPlayer, 'currentPlayer').equal(0);
    expect(ServerGame().status.roundPlayer, 'roundPlayer').equal(0);
    expect(ServerGame().status.phase, 'phase').equal(1);
    expect(ServerGame().status.turnStartTime, 'turnTime').above(0);
    // console.log(ServerGame().getIn(['players', User1.id, 'hand']).size)
    // console.log(ServerGame().getIn(['players', User0.id, 'hand']).size)
    expect(ServerGame().deck.size, 'deck.size').equal(9);
    expect(ServerGame().getIn(['players', User0.id, 'ready'])).true;
    expect(ServerGame().getIn(['players', User0.id, 'hand'])).size(5);
    expect(ServerGame().getIn(['players', User0.id, 'continent'])).size(2);
    expect(ServerGame().getIn(['players', User1.id, 'ready'])).true;
    expect(ServerGame().getIn(['players', User1.id, 'hand'])).size(6);
    expect(ServerGame().getIn(['players', User1.id, 'continent'])).size(0);
  });
});