import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , gameDeployAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe.only('TraitAnglerfish:', () => {
  it('Deploy', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 1
players:
  - hand: angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectAnimal0, selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectAnimal1, selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id));
    expect(selectAnimal(User0, 0).traits, `Server can see anglerfish`).size(1);
    expect(selectAnimal0(0).traits, `User0 can see anglerfish`).size(1);
    expect(selectAnimal1(0, User0).traits, `User1 can't see anglerfish`).size(0);
  });

  it('Defend itself', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $A carn, $B angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).id).equal('$B');
  });

//  it('Defend intellect', () => {
//    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
//    const gameId = ParseGame(`
//deck: 10 camo
//phase: 2
//food: 4
//players:
//  - continent: $A carn, $B angler
//`);
//    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
//
//    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
//    expect(selectAnimal(User0, 0).id).equal('$B');
//  });
});