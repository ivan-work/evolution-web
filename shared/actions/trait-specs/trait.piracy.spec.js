import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';
import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe.only('TraitPiracy:', () => {
  it('Steals', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 20 camo
phase: 2
food: 4
players:
  - continent: $A + carn piracy, $B carn piracy, $C + carn piracy
  - continent: $A1 + carn piracy, $FAT + fat fat
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectAnimal(User0, 0).getFood(), 'User0, 0 food initial').equal(1);
    expect(selectAnimal(User0, 1).getFood(), 'User0, 1 food initial').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'User0, 2 food initial').equal(1);
    expect(selectAnimal(User1, 0).getFood(), 'User1, 0 food initial').equal(1);
    expect(selectAnimal(User1, 1).getFood(), 'User1, 1 food initial').equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$A1'));
    expect(selectAnimal(User0, 0).getFood(), 'User0, 0 food').equal(2);
    expect(selectAnimal(User0, 1).getFood(), 'User0, 1 food').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'User0, 2 food').equal(1);
    expect(selectAnimal(User1, 0).getFood(), 'User1, 0 food').equal(0);
    expect(selectAnimal(User1, 1).getFood(), 'User1, 1 food').equal(1);

    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('$A1 cant steal $A (full)', () =>
        clientStore1.dispatch(traitActivateRequest('$A1', 'TraitPiracy', '$A'))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged('$A1 cant steal $B (empty)', () =>
        clientStore1.dispatch(traitActivateRequest('$A1', 'TraitPiracy', '$B'))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged('$A1 cant steal $FAT (empty)', () =>
        clientStore1.dispatch(traitActivateRequest('$A1', 'TraitPiracy', '$FAT'))
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(traitTakeFoodRequest('$A1'));

    expect(selectAnimal(User0, 0).getFood(), '2 (User0, 0) food').equal(2);
    expect(selectAnimal(User0, 1).getFood(), '2 (User0, 1) food').equal(0);
    expect(selectAnimal(User0, 2).getFood(), '2 (User0, 2) food').equal(1);
    expect(selectAnimal(User1, 0).getFood(), '2 (User1, 0) food').equal(1);
    expect(selectAnimal(User1, 1).getFood(), '2 (User1, 1) food').equal(1);

    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitPiracy', '$C'));

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(traitTakeFoodRequest('$FAT'));

    clientStore1.dispatch(gameEndTurnRequest());
    expectUnchanged('$B cant steal $A1 (cooldown)', () =>
    clientStore0.dispatch(traitActivateRequest('$B', 'TraitPiracy', '$A1'))
      , serverStore, clientStore0, clientStore1);

    expect(selectAnimal(User0, 0).getFood(), '3 (User0, 0) food').equal(2);
    expect(selectAnimal(User0, 1).getFood(), '3 (User0, 1) food').equal(1);
    expect(selectAnimal(User0, 2).getFood(), '3 (User0, 2) food').equal(0);
    expect(selectAnimal(User1, 0).getFood(), '3 (User1, 0) food').equal(1);
    expect(selectAnimal(User1, 1).getFood(), '3 (User1, 1) food').equal(2);
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(traitTakeFoodRequest('$A1'));
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().status.phase, 'PHASE = DEPLOY').equal(PHASE.DEPLOY);
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase, 'PHASE = FEEDING').equal(PHASE.FEEDING);

    expect(selectAnimal(User0, 0).getFood(), '4 (User0, 0) food').equal(0);
    expect(selectAnimal(User1, 0).getFood(), '4 (User1, 0) food').equal(0);
    expect(selectAnimal(User1, 1).getFood(), '4 (User1, 1) food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$A1'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFood()).equal(0);
    expect(selectAnimal(User1, 0).getFood()).equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$A1'));

    expect(selectAnimal(User0, 0).getFood()).equal(1);
    expect(selectAnimal(User1, 0).getFood()).equal(0);
  });
});