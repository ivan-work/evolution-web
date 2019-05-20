import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAmbushActivateRequest
  , traitAmbushContinueRequest
  , traitAnswerRequest
  , makeTurnTimeoutId
} from '../actions';

import {testShiftTime} from '../../utils/reduxTimeout'
import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';

describe('TraitAmbush:', () => {
  it('Simple attack', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A, $B wait
  - continent: $C ambush carn
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushActivateRequest('$C'));

    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
    expect(findAnimal('$A'), '$A should be dead').not.ok;
    expect(findAnimal('$C').getFood(), '$C should ambush $A').equal(2);

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
  });

  it('Simple defence', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A tail, $B hiber
  - continent: $C ambush carn
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$C'));

    expect(findAnimal('$C').getFood(), '$C should get $A tail').equal(1);
    expect(findAnimal('$A'), '$A should be alive').ok;
    expect(findAnimal('$A').getFood(), '$A should get food').equal(1);

    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
  });

  it('Complex defence, timeout', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A tail mimi, $B hiber, $D mimi
  - continent: $C ambush carn
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);


    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    clientStore1.dispatch(traitAmbushActivateRequest('$C'));
    expect(selectGame().question, 'Game asks question').ok;
    serverStore.dispatch(testShiftTime(100));

    expect(findAnimal('$C').getFood(), '$C should get $A tail').equal(1);
    expect(findAnimal('$A'), '$A should be alive').ok;
    expect(findAnimal('$A').getFood(), '$A should get food').equal(1);

    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
  });

  it('Complex defence, manual', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A tail mimi, $B hiber, $D
  - continent: $C ambush carn
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$C'));

    expect(selectGame().question, 'Game asks question').ok;

    clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$D'));

    expect(findAnimal('$C').getFood(), '$C should get $D').equal(2);
    expect(findAnimal('$A'), '$A should be alive').ok;
    expect(findAnimal('$B'), '$B should be alive').ok;
    expect(findAnimal('$D'), '$D should be dead').null;
    expect(findAnimal('$A').getFood(), '$A should get food').equal(1);
  });

  it('Cooldowns', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q ambush carn hiber tail fat fat, $W ambush carn hiber tail fat fat
  - continent: $A ambush carn hiber tail fat fat, $S ambush carn hiber tail fat fat
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));

    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$S', false));

    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(findAnimal('$Q').getFoodAndFat(), '$Q should get food').equal(1);
    expect(findAnimal('$A').getFoodAndFat(), '$A should get food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$A'));

    clientStore0.dispatch(traitAmbushActivateRequest('$Q'));
    clientStore0.dispatch(traitAmbushActivateRequest('$W', false));

    expect(selectGame().question, 'Game asks question 2').ok;
    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(findAnimal('$Q').getFoodAndFat(), '$Q should get food').equal(2);
    expect(findAnimal('$A').getFoodAndFat(), '$A should get food').equal(2);

    clientStore0.dispatch(traitTakeFoodRequest('$W'));

    clientStore1.dispatch(traitAmbushActivateRequest('$S'));
    expect(selectGame().question, 'Game asks question 3').ok;
    clientStore0.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(findAnimal('$W').getFoodAndFat(), '$W should get food').equal(1);
    expect(findAnimal('$S').getFoodAndFat(), '$S should get food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$S'));

    clientStore0.dispatch(traitAmbushActivateRequest('$W'));
    expect(selectGame().question, 'Game asks question 4').ok;
    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(findAnimal('$W').getFoodAndFat(), '$W should get food').equal(2);
    expect(findAnimal('$S').getFoodAndFat(), '$S should get food').equal(2);
  });

  it('Triple trouble', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A tail fat
  - continent: $B ambush carn, $C ambush carn, $D ambush carn
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$B'));
    clientStore1.dispatch(traitAmbushActivateRequest('$C'));
    clientStore1.dispatch(traitAmbushActivateRequest('$D'));

    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitFatTissue'));

    expect(findAnimal('$A'), '$A dead').null;
    expect(findAnimal('$B').getFoodAndFat(), '$B should get food').equal(1);
    expect(findAnimal('$C').getFoodAndFat(), '$C should get food').equal(1);
    expect(findAnimal('$D').getFoodAndFat(), '$D should get food').equal(2);
  });

  it('Triple trouble with Ink', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A ink wait
  - continent: $B ambush carn, $C ambush carn, $D ambush carn
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$B'));
    clientStore1.dispatch(traitAmbushActivateRequest('$C'));
    clientStore1.dispatch(traitAmbushActivateRequest('$D'));

    expect(selectGame().question, 'Game asks question').ok;
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));

    expect(findAnimal('$A'), '$A dead').null;
    expect(findAnimal('$B').getFoodAndFat(), '$B should have 0 food').equal(0);
    expect(findAnimal('$C').getFoodAndFat(), '$C should have 2 food').equal(2);
  });

  it('Players order', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}, {User2, clientStore2}] = mockGame(3);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A ambush carn wait
  - continent: $B ambush carn wait
  - continent: $C ambush carn wait
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$B', false));
    clientStore2.dispatch(traitAmbushActivateRequest('$C', false));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(traitTakeFoodRequest('$B'));
    clientStore2.dispatch(traitAmbushActivateRequest('$C'));
    clientStore0.dispatch(traitAmbushActivateRequest('$A'));

    expect(findAnimal('$B'), '$B dead').null;
    expect(findAnimal('$C').getFoodAndFat(), '$C food').equal(2);
    expect(findAnimal('$A').getFoodAndFat(), '$A food').equal(1);
  });

  it('Intellect testing', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q swim, $W flight
  - continent: $A ambush carn int wait, $S ambush carn int
`);

    //- continent: $Q swim, $W flight, $E tail, $R camo
    //- continent: $A ambush carn int, $S ambush carn int, $D ambush carn int, $F ambush carn int

    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));

    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$S', false));

    expect(findAnimal('$Q')).null;
    expect(selectGame().food).equal(4);

    expectUnchanged('Has eating cooldown', () => {
      clientStore0.dispatch(traitTakeFoodRequest('$W'));
    }, serverStore, clientStore0, clientStore1);
    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().food).equal(3);

    clientStore0.dispatch(traitTakeFoodRequest('$W'));
    clientStore1.dispatch(traitAmbushActivateRequest('$S'));
    expect(findAnimal('$W')).null;
    expect(selectGame().food).equal(3);
    expect(selectPlayer(User0).continent).size(0);
  });

  it('Ink Cloud vs Ambush', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q ink fat
  - continent: $A ambush carn wait
`);

    const {selectGame, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));

    expect(selectPlayer(User0).continent).size(1);
    expect(selectGame().food).equal(3);

    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().food).equal(2);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));

    expect(selectPlayer(User0).continent).size(0);
    expect(selectGame().food).equal(2);
  });

  it('Ink Cloud + TailLoss vs Ambush + Intellect', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q ink fat tail
  - continent: $A ambush carn int wait
`);

    const {selectGame, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore1.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));

    expect(selectPlayer(User0).continent).size(1);
    expect(selectGame().food).equal(3);

    clientStore1.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().food).equal(2);

    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));

    expect(selectPlayer(User0).continent).size(0);
    expect(selectGame().food).equal(2);
  });

  it(`Works with cooperation and homeo`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $Q wait coop$W coop$E homeo, $W, $E coop$R, $R
  - continent: $A carn ambu, $S carn ambu, $D carn ambu, $F carn ambu
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushContinueRequest());

    expect(findAnimal('$Q').getFood()).equal(1);
    expect(findAnimal('$W').getFood()).equal(0);
    expect(findAnimal('$E').getFood()).equal(0);
    expect(findAnimal('$R').getFood()).equal(0);

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitWaiter));

    // Ignore $W
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushContinueRequest());

    // Since there was an attack, need to retry waiter
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitWaiter));

    expect(findAnimal('$W').getFood()).equal(1);
    expect(findAnimal('$E').getFood()).equal(0);
    expect(findAnimal('$R').getFood()).equal(0);

    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore1.dispatch(traitAmbushContinueRequest());

    expect(findAnimal('$E')).null;
    expect(findAnimal('$R').getFood()).equal(0);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitHomeothermy));
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushContinueRequest());
  });

  it(`Doesnt attack full animal`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $Q wait coop$W, $W + wait
  - continent: $A carn ambu
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushContinueRequest());

    expect(findAnimal('$Q').getFood()).equal(1);
    expect(findAnimal('$W').getFood()).equal(1);

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
  });

  it(`Bug with multicoop`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A coop$B, $B camo coop$C, $C wait 
  - continent: $D carn ambu
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$B'));
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCooperation));
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushActivateRequest('$D'));

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCooperation));

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(findAnimal('$C').getFood()).equal(1);

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
  });

  it(`Ambush on cooperation at the end of turn`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $Q coop$W, $W
  - continent: $A carn ambu wait
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    // User0 takes food with $Q
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    // Game enters AMBUSH phase for $Q
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    // User1 skips AMBUSH for $Q
    clientStore1.dispatch(traitAmbushContinueRequest());

    // Game returns to FEEDING phase because $Q has option to share food with $W
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    // User0 waits all his time
    serverStore.dispatch(testShiftTime(100));

    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(findAnimal('$A').getFood()).equal(2);
    expect(selectGame().status.currentPlayer).equal(User1.id);
  });

  it(`Ambush on cooperation at the end of turn with multiple targets PAUSED`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $Q coop$W coop$E, $W, $E
  - continent: $A carn ambu wait, $B carn ambu wait
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);

    clientStore1.dispatch(traitAmbushContinueRequest());

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    clientStore0.dispatch(gameEndTurnRequest());

    // Hunt for $W
    console.log('Hunt for $W')
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    // Activate both animals:
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$B'));

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    clientStore0.dispatch(gameEndTurnRequest());

    // Hunt for $E
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushActivateRequest('$B'));


    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(User1.id);
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$B').getFood()).equal(2);
  });

  it(`Ambush on cooperation at the end of turn with multiple targets UNPAUSED`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $Q coop$W coop$E, $W, $E
  - continent: $A carn ambu wait, $B carn ambu wait
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);

    clientStore1.dispatch(traitAmbushContinueRequest());

    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    serverStore.dispatch(testShiftTime(100));

    // Hunt for $W
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    // Activate both animals:
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore1.dispatch(traitAmbushActivateRequest('$B'));

    // Hunt for $E
    expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    clientStore1.dispatch(traitAmbushActivateRequest('$B'));


    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$B').getFood()).equal(2);
    expect(selectGame().status.currentPlayer).equal(User1.id);
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(100);
  });

  it(`Ambush at multiple targets + Mimicry `, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $Q coop$W coop$E coop$D wait, $W mimi, $E, $D
  - continent: $A carn ambu, $S carn ambu, $D carn ambu
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    clientStore1.dispatch(traitAmbushContinueRequest());
    serverStore.dispatch(testShiftTime(100));

    // $A attacks $W, eats $E
    clientStore1.dispatch(traitAmbushActivateRequest('$A'));
    clientStore1.dispatch(traitAmbushContinueRequest());

    clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$E'));

    // $S attacks $D, eats $D
    clientStore1.dispatch(traitAmbushActivateRequest('$S'));
    clientStore1.dispatch(traitAmbushContinueRequest());

    expect(findAnimal('$Q').getFood()).equal(1);
    expect(findAnimal('$W').getFood()).equal(1);
    expect(findAnimal('$E')).null;
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$S').getFood()).equal(2);
    expect(findAnimal('$D').getFood()).equal(0);
    expect(selectGame().status.currentPlayer).equal(User1.id);
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(100);
  });
});