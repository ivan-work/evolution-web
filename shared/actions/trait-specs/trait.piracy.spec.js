import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';
import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitPiracy:', () => {
  it('Steals', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 20 camo
phase: 2
food: 0
players:
  - continent: $A piracy, $B piracy, $C piracy, $D piracy, $E piracy + fat
  - continent: $A1 mass +, $B1 mass + fat=true, $C1 +, $D1 fat=true, $E1 mass +
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    // 0-0-0

    // $A can steal from $A1
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$A1'));

    // $B can steal from $B1
    clientStore0.dispatch(traitActivateRequest('$B', 'TraitPiracy', '$B1'));

    expectUnchanged('$C cant steal $C (full)', () =>
        clientStore0.dispatch(traitActivateRequest('$C', 'TraitPiracy', '$C1'))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged('$D cant steal $D1 (empty)', () =>
        clientStore0.dispatch(traitActivateRequest('$D', 'TraitPiracy', '$D1'))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged('$E cant steal $E1 (into fat)', () =>
        clientStore0.dispatch(traitActivateRequest('$E', 'TraitPiracy', '$E1'))
      , serverStore, clientStore0, clientStore1);

    expect(selectAnimal(User0, 0).getFood(), '2 (User0, 0) food').equal(1);
    expect(selectAnimal(User0, 1).getFood(), '2 (User0, 1) food').equal(1);
    expect(selectAnimal(User0, 2).getFood(), '2 (User0, 2) food').equal(0);
    expect(selectAnimal(User0, 3).getFood(), '2 (User0, 3) food').equal(0);

    expect(selectAnimal(User1, 0).getFood(), '2 (User1, 0) food').equal(0);
    expect(selectAnimal(User1, 1).getFood(), '2 (User1, 1) food').equal(0);
    expect(selectAnimal(User1, 2).getFood(), '2 (User1, 2) food').equal(1);
    expect(selectAnimal(User1, 3).getFood(), '2 (User1, 3) food').equal(0);
  });
});