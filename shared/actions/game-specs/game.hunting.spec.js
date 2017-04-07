import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
} from '../actions';
import {makeGameSelectors} from '../../selectors';

import {PHASE} from '../../models/game/GameModel';

describe('Game (Hunting):', function () {
  it('Hunting', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
food: 10
phase: 2
players:
  - continent: $0A Carnivorous, $0B Carnivorous, $0C Carnivorous
  - continent: $1A Carnivorous, $1B Carnivorous, $1C Carnivorous, $1D Carnivorous
`);
    const {selectGame, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const getAnimalIds = (user) => selectGame().getIn(['players', user.id, 'continent']).toArray().map(animal => animal.id);

    expectChanged('$0A > $1A', () =>
        clientStore0.dispatch(traitActivateRequest('$0A', 'TraitCarnivorous', '$1A'))
      , serverStore, clientStore0, clientStore1);

    expectUnchanged('User0 has cooldown on hunt', () =>
        clientStore0.dispatch(traitActivateRequest('$0B', 'TraitCarnivorous', '$1B'))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged('User0 has cooldown on food', () =>
        clientStore0.dispatch(traitTakeFoodRequest('$0B'))
      , serverStore, clientStore0, clientStore1);

    expect(getAnimalIds(User0)).eql(['$0A', '$0B', '$0C']);
    expect(getAnimalIds(User1)).eql(['$1B', '$1C', '$1D']);

    expect(selectGame().food).equal(10);
    expect(selectAnimal(User0, 0).getFood()).equal(2);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged('$1C can take food', () =>
      clientStore1.dispatch(traitTakeFoodRequest('$1C'))
      , serverStore, clientStore0, clientStore1);

    expectUnchanged('$1D has cooldown on hunt', () =>
        clientStore1.dispatch(traitActivateRequest('$1D', 'TraitCarnivorous', '$0A'))
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());

    expectUnchanged('$0A is on cooldown', () =>
        clientStore0.dispatch(traitActivateRequest('$0A', 'TraitCarnivorous', '$1B'))
      , serverStore, clientStore0, clientStore1);

    expectChanged('$0B can hunt $1B', () =>
        clientStore0.dispatch(traitActivateRequest('$0B', 'TraitCarnivorous', '$1B'))
      , serverStore, clientStore0, clientStore1);

    expect(getAnimalIds(User0)).eql(['$0A', '$0B', '$0C']);
    expect(getAnimalIds(User1)).eql(['$1C', '$1D']);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged('$1C can take food', () =>
        clientStore1.dispatch(traitTakeFoodRequest('$1C'))
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('$1C is full and can\' hunt $0C', () =>
        clientStore1.dispatch(traitActivateRequest('$1C', 'TraitCarnivorous', '$0C'))
      , serverStore, clientStore0, clientStore1);

    expectChanged('$1D can hunt $0C', () =>
        clientStore1.dispatch(traitActivateRequest('$1D', 'TraitCarnivorous', '$0C'))
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().food).equal(8);
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1).getFood()).equal(2);
    expect(selectAnimal(User1, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 1).getFood()).equal(2);
    expect(getAnimalIds(User0)).eql(['$0A', '$0B']);
    expect(getAnimalIds(User1)).eql(['$1C', '$1D']);
  });

//  it('Hunting with fat', () => {
//    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
//    const gameId = ParseGame(`
//deck: 10 camo
//food: 10
//phase: 2
//players:
//  - continent: $A Carnivorous fat fat fat
//  - continent: $B
//`);
//    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
//
//    clientStore0.dispatch(traitTakeFoodRequest('$A'));
//    clientStore0.dispatch(gameEndTurnRequest());
//    clientStore1.dispatch(gameEndTurnRequest());
//
//    clientStore0.dispatch(traitTakeFoodRequest('$A'));
//    clientStore0.dispatch(gameEndTurnRequest());
//
//    clientStore0.dispatch(traitTakeFoodRequest('$A'));
//    clientStore0.dispatch(gameEndTurnRequest());
//
//    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
//    clientStore0.dispatch(gameEndTurnRequest());
//
//    expect(selectAnimal(User0, 0).getFood(), '$A.getFood()').equal(5);
//    expect(selectPlayer(User1).continent).size(0);
//  });

  it('Hunting after phase', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
food: 10
phase: 2
players:
  - continent: $0A Carnivorous, $0B Carnivorous, $0C, $0D
  - continent: $1A Carnivorous, $1B Carnivorous, $1C, $1D
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$0A', 'TraitCarnivorous', '$1C'));
    clientStore1.dispatch(traitActivateRequest('$1A', 'TraitCarnivorous', '$0C'));
    clientStore0.dispatch(traitActivateRequest('$0B', 'TraitCarnivorous', '$1D'));
    clientStore1.dispatch(traitActivateRequest('$1B', 'TraitCarnivorous', '$0D'));

    expect(selectPlayer(User0).continent).size(2);
    expect(selectPlayer(User1).continent).size(2);

    expect(selectGame().getIn(['status', 'turn'])).equal(1);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().getIn(['status', 'turn'])).equal(1);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(1);

    expect(selectAnimal(User1, 0).getFood(), 'food pre-hunt').equal(0);

    clientStore1.dispatch(traitActivateRequest('$1A', 'TraitCarnivorous', '$0A'));

    expect(selectAnimal(User1, 0).getFood(), 'food after-hunt').equal(2);
    expect(selectAnimal(User0, 0).id).equal('$0B');
  });
});