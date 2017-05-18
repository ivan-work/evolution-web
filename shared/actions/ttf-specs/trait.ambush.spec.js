import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitAmbush:', () => {
  it('Simple attack', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
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
phase: feeding
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
phase: feeding
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
phase: feeding
food: 4
players:
  - continent: $A tail mimi, $B hiber, $D
  - continent: $C ambush=true carn
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expect(selectGame().question, 'Game asks question').ok;

    clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$D'));

    expect(selectAnimal(User1, 0).getFood(), '$C should get $A tail').equal(2);
    expect(selectAnimal(User0, 0).id, '$A should be alive').equal('$A');
    expect(selectAnimal(User0, 1).id, '$B should be alive').equal('$B');
    expect(selectAnimal(User0, 2), '$D should be alive').undefined;
    expect(selectAnimal(User0, 0).getFood(), '$A should get food').equal(1);
  });

  it('Cooldowns', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q ambush=true carn hiber tail fat fat, $W ambush carn hiber tail fat fat
  - continent: $A ambush=true carn hiber tail fat fat, $S ambush carn hiber tail fat fat
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFoodAndFat(), '$Q should get food').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$A should get food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    expect(selectGame().question, 'Game asks question 2').ok;
    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFoodAndFat(), '$Q should get food').equal(2);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$A should get food').equal(2);

    expect(selectGame().status.round, 'Round').equal(1);
    clientStore0.dispatch(traitActivateRequest('$W', 'TraitAmbush'));
    clientStore1.dispatch(traitActivateRequest('$S', 'TraitAmbush'));

    clientStore0.dispatch(traitTakeFoodRequest('$W'));
    expect(selectGame().question, 'Game asks question 3').ok;
    clientStore0.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 1).getFoodAndFat(), '$W should get food').equal(1);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '$S should get food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$S'));
    expect(selectGame().question, 'Game asks question 4').ok;
    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 1).getFoodAndFat(), '$W should get food').equal(2);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '$S should get food').equal(2);
  });

  it('Triple trouble', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A tail fat
  - continent: $B ambush=true carn, $C ambush=true carn, $D ambush=true carn
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));

    expect(selectAnimal(User0, 0), '$A dead').undefined;
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$B should get food').equal(1);
    expect(selectAnimal(User1, 1).getFoodAndFat(), '$C should get food').equal(1);
    expect(selectAnimal(User1, 2).getFoodAndFat(), '$D should get food').equal(2);
  });

  it('Intellect testing', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q swim, $W flight
  - continent: $A ambush=true carn int, $S ambush=true carn int
`);

    //- continent: $Q swim, $W flight, $E tail, $R camo
    //- continent: $A ambush=true carn int, $S ambush=true carn int, $D ambush=true carn int, $F ambush=true carn int

    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectGame().food).equal(4);
    clientStore0.dispatch(traitTakeFoodRequest('$W'));
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().food).equal(3);

    clientStore0.dispatch(traitTakeFoodRequest('$W'));
    expect(selectGame().food).equal(3);
    expect(selectPlayer(User0).continent).size(0);
  });

  it('Ink Cloud vs Ambush', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q ink fat
  - continent: $A ambush=true carn wait
`);

    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectPlayer(User0).continent).size(1);
    expect(selectGame().food).equal(3);
    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().food).equal(2);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectPlayer(User0).continent).size(0);
    expect(selectGame().food).equal(2);
  });

  it('Ink Cloud + TailLoss vs Ambush + Intellect', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q ink fat tail
  - continent: $A ambush=true carn int wait
`);

    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    clientStore1.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    expect(selectPlayer(User0).continent).size(1);
    expect(selectGame().food).equal(3);
    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().food).equal(2);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectPlayer(User0).continent).size(0);
    expect(selectGame().food).equal(2);
  });
});