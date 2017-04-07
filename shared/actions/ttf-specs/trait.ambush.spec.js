import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitAmbush:', () => {
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

  it('Complex defence, timeout', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $A tail mimi, $B hiber, $D mimi
  - continent: $C ambush=true carn
settings:
  timeTraitResponse: 10
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectGame().question, 'Game asks question').ok;

    await new Promise(resolve => setTimeout(resolve, 15));

    expect(selectAnimal(User1, 0).getFood(), '$C should get $A tail').equal(1);
    expect(selectAnimal(User0, 0).id, '$A should be alive').equal('$A');
    expect(selectAnimal(User0, 0).getFood(), '$A should get food').equal(1);
  });

  it('Complex defence, manual', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $A tail mimi, $B hiber, $D
  - continent: $C ambush=true carn
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expect(selectGame().question, 'Game asks question').ok;

    clientStore0.dispatch(traitDefenceAnswerRequest('TraitMimicry', '$D'));

    expect(selectAnimal(User1, 0).getFood(), '$C should get $A tail').equal(2);
    expect(selectAnimal(User0, 0).id, '$A should be alive').equal('$A');
    expect(selectAnimal(User0, 1).id, '$B should be alive').equal('$B');
    expect(selectAnimal(User0, 2), '$D should be alive').undefined;
    expect(selectAnimal(User0, 0).getFood(), '$A should get food').equal(1);
  });

  it.only('Cooldowns', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $Q ambush=true carn hiber tail fat fat, $W ambush carn hiber tail fat fat
  - continent: $A ambush=true carn hiber tail fat fat, $S ambush carn hiber tail fat fat
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitDefenceAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFoodAndFat(), '$Q should get food').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$A should get food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    expect(selectGame().question, 'Game asks question 2').ok;
    clientStore1.dispatch(traitDefenceAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFoodAndFat(), '$Q should get food').equal(2);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$A should get food').equal(2);

    expect(selectGame().status.round, 'Round').equal(1);
    clientStore0.dispatch(traitActivateRequest('$W', 'TraitAmbush'));
    clientStore1.dispatch(traitActivateRequest('$S', 'TraitAmbush'));
    console.log(selectAnimal(User1, 1).traits.toJS())

    clientStore0.dispatch(traitTakeFoodRequest('$W'));
    expect(selectGame().question, 'Game asks question 3').ok;
    clientStore0.dispatch(traitDefenceAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 1).getFoodAndFat(), '$W should get food').equal(1);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '$S should get food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$S'));
    expect(selectGame().question, 'Game asks question 4').ok;
    clientStore1.dispatch(traitDefenceAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 1).getFoodAndFat(), '$W should get food').equal(2);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '$S should get food').equal(2);
  });

  it.only('Double trouble', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $A tail fat
  - continent: $B ambush=true carn, $C ambush=true carn, $D ambush=true carn
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitDefenceAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitDefenceAnswerRequest('TraitTailLoss', 'TraitTailLoss'));

    expect(selectAnimal(User0, 0), '$A dead').undefined;
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$B should get food').equal(1);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '$C should get food').equal(1);
    expect(selectAnimal(User1, 2).getFoodAndFat(), '$D should get food').equal(2);
  });
});