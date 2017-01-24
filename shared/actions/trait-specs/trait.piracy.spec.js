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
food: 4
players:
  - continent: $A + carn piracy, $B carn piracy, $C + carn piracy
  - continent: $A1 + carn piracy, $FAT + fat fat piracy
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    // 0-0-0

    expect(selectAnimal(User0, 0).getFoodAndFat(), 'User0, 0 food initial').equal(1);
    expect(selectAnimal(User0, 1).getFoodAndFat(), 'User0, 1 food initial').equal(0);
    expect(selectAnimal(User0, 2).getFoodAndFat(), 'User0, 2 food initial').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), 'User1, 0 food initial').equal(1);
    expect(selectAnimal(User1, 1).getFoodAndFat(), 'User1, 1 food initial').equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$A1'));

    expect(selectAnimal(User0, 0).getFoodAndFat(), 'User0, 0 food').equal(2);
    expect(selectAnimal(User0, 1).getFoodAndFat(), 'User0, 1 food').equal(0);
    expect(selectAnimal(User0, 2).getFoodAndFat(), 'User0, 2 food').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), 'User1, 0 food').equal(0);
    expect(selectAnimal(User1, 1).getFoodAndFat(), 'User1, 1 food').equal(1);
    clientStore0.dispatch(gameEndTurnRequest());

    // 0-0-1

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

    expect(selectAnimal(User0, 0).getFoodAndFat(), '2 (User0, 0) food').equal(2);
    expect(selectAnimal(User0, 1).getFoodAndFat(), '2 (User0, 1) food').equal(0);
    expect(selectAnimal(User0, 2).getFoodAndFat(), '2 (User0, 2) food').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '2 (User1, 0) food').equal(1);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '2 (User1, 1) food').equal(1);

    clientStore1.dispatch(gameEndTurnRequest());

    // 0-1-0

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitPiracy', '$C'));
    expect(selectAnimal(User0, 0).getFoodAndFat(), '3 (User0, 0) food').equal(2);
    expect(selectAnimal(User0, 1).getFoodAndFat(), '3 (User0, 1) food').equal(1);
    expect(selectAnimal(User0, 2).getFoodAndFat(), '3 (User0, 2) food').equal(0);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '3 (User1, 0) food').equal(1);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '3 (User1, 1) food').equal(1);
    clientStore0.dispatch(gameEndTurnRequest());

    // 0-1-1

    clientStore1.dispatch(traitTakeFoodRequest('$FAT'));
    clientStore1.dispatch(gameEndTurnRequest());

    // 0-2-0

    expectUnchanged('$B cant steal $A1 (cooldown)', () =>
        clientStore0.dispatch(traitActivateRequest('$B', 'TraitPiracy', '$A1'))
      , serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(gameEndTurnRequest());

    // 0-2-1 x0

    clientStore1.dispatch(traitTakeFoodRequest('$A1'));
    clientStore1.dispatch(gameEndTurnRequest());

    // 0-3-1 x0

    clientStore1.dispatch(gameEndTurnRequest());

    // 0-3-1 x01

    expect(selectGame().status.phase, 'PHASE = DEPLOY').equal(PHASE.DEPLOY);
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase, 'PHASE = FEEDING').equal(PHASE.FEEDING);

    // 1-0-1

    expect(selectAnimal(User0, 0).getFoodAndFat(), '4 (User0, 0) food').equal(0);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '4 (User1, 0) food').equal(0);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '4 (User1, 1) food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$A1'));
    clientStore1.dispatch(gameEndTurnRequest());

    // 1-1-0

    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(0);
    expect(selectAnimal(User1, 0).getFoodAndFat()).equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$A1'));
    clientStore0.dispatch(gameEndTurnRequest());

    // 1-1-1

    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat()).equal(0);

    clientStore1.dispatch(traitTakeFoodRequest('$A1'));
    clientStore1.dispatch(gameEndTurnRequest());

    // 1-2-0

    clientStore0.dispatch(gameEndTurnRequest());

    // 1-2-1 x0

    clientStore1.dispatch(traitTakeFoodRequest('$A1'));
    clientStore1.dispatch(gameEndTurnRequest());

    // 1-3-1 x0

    expectUnchanged('$A1 (full) cant steal $A', () =>
      clientStore1.dispatch(traitActivateRequest('$A1', 'TraitPiracy', '$A'))
      , serverStore, clientStore0, clientStore1);
    clientStore1.dispatch(gameEndTurnRequest());
  });

  it('Steals from fat massive', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 20 camo
phase: 2
food: 4
players:
  - continent: $Q piracy +, $W +
  - continent: $A ++ massive fat
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    // 0-0-0
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(traitTakeFoodRequest('$A'));

    // Deploy
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    // Feeding
    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitPiracy', '$A'));

    expect(selectAnimal(User0, 0).getFoodAndFat(), 'Can steal from fat massive').equal(1);
  });
});