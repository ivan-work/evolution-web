import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe.only('TraitAmbush:', () => {
  it('Simple attack', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $A, $B hiber
  - continent: $C ambush=true carn
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectAnimal(User0, 0).id, '$A should be dead').equal('$B');
    expect(selectAnimal(User1, 0).getFood(), '$C should ambush $A').equal(2);
  });

  it('Simple defence', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $A tail, $B hiber
  - continent: $C ambush=true carn
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectAnimal(User1, 0).getFood(), '$C should get $A tail').equal(1);
    expect(selectAnimal(User0, 0).id, '$A should be alive').equal('$A');
    expect(selectAnimal(User0, 0).getFood(), '$A should get food').equal(1);
  });
});