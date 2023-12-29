import {
  gameDeployAnimalRequest,
  gameDeployTraitRequest,
  gameEndTurnRequest,
  makeTurnTimeoutId,
  traitActivateRequest,
  traitAnswerRequest,
  traitTakeFoodRequest
} from '../actions';

import {QuestionRecord} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import {testShiftTime} from '../../utils/reduxTimeout'

import {makeClientGameSelectors, makeGameSelectors} from '../../selectors';
import ERRORS from "../errors";

describe('TraitAnglerfish:', () => {
  it('Deploy', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: deploy
players:
  - hand: angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectAnimal0, selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectAnimal1, selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id));
    expect(selectAnimal(User0, 0).traits, `Server can see anglerfish`).size(1);
    expect(selectAnimal0(User0, 0).traits, `User0 can see anglerfish`).size(1);
    expect(selectAnimal1(User0, 0).traits, `User1 can't see anglerfish`).size(0);
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectTrait(User0, 0, 0).id).equal(selectTrait0(User0, 0, 0).id);
    clientStore0.dispatch(traitActivateRequest(selectAnimal0(User0, 0).id, selectTrait0(User0, 0, 0).id));
  });

  it('Cannot deploy as a trait', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: deploy
players:
  - hand: angler
    continent: $A
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expectError(`Cannot deploy as a trait`, ERRORS.TRAIT_PLACEMENT_HIDDEN, () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));
    }, serverStore, clientStore0)
  });

  it('Defend itself', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A carn, $B angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(selectAnimal(User0, 0).traits).size(1);
    expect(selectAnimal(User0, 0).id).equal('$B');
  });

  it('Questions', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 0
players:
  - continent: $Q carn tail camo wait, $W carn camo mass, $E carn tail mimi wait, $E2 tail
  - continent: $A angler +, $S angler +, $D angler +
settings:
  timeTurn: 100
  timeTraitResponse: 80
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(25));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(75);

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$A'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);

    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)]).undefined;

    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitCarnivorous));
    expect(findAnimal('$Q')).ok;

    expect(selectPlayer(User0).acted, 'selectPlayer(User0).acted').true;
    expect(selectGame().status.round).equal(0);
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.round).equal(1);
    clientStore0.dispatch(traitActivateRequest('$W', tt.TraitCarnivorous, '$S'));
    expect(findAnimal('$W')).ok;
    expect(findAnimal('$S')).ok;
    expect(selectGame().status.round).equal(1);
    expect(selectPlayer(User0).acted, 'selectPlayer(User0).acted').true;
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$E', tt.TraitCarnivorous, '$D'));
    expect(selectGame().question, 'Question should be ok').ok;
    clientStore1.dispatch(traitAnswerRequest(tt.TraitIntellect, tt.TraitTailLoss));
    expect(selectGame().question).null;

    expect(findAnimal('$Q')).ok;
    expect(findAnimal('$W')).ok;
    expect(findAnimal('$E')).ok;
    expect(findAnimal('$E2')).ok;
    expect(findAnimal('$A').getFood(), '$A food').equal(2);
    expect(findAnimal('$S').getFood(), '$S food').equal(1);
    expect(findAnimal('$D').getFood(), '$D food').equal(2);
  });

  it('Tailloss shouldnt be able to lose Angler', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $Q carn
  - continent: $A tail angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$A'));
    expect(selectAnimal(User0, 0)).ok;
    expect(selectAnimal(User0, 0).getFood()).equal(1);
  });

  it('bug v043', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $Q carn intel camo tail angler ink wait, $W angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$W'));

    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    clientStore0.dispatch(traitAnswerRequest('TraitInkCloud'));

    expect(selectAnimal(User0, 0)).ok;
    expect(selectAnimal(User0, 1)).ok;
    expect(selectAnimal(User0, 0).getFood()).equal(0);
    expect(selectAnimal(User0, 1).getFood()).equal(0);
  });

  it('bug v043 2', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $Q carn intel tail angler ink wait, $W angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$W'));

    expect(selectGame().question.type).equal(QuestionRecord.INTELLECT);
    clientStore0.dispatch(traitAnswerRequest(tt.TraitIntellect, tt.TraitTailLoss));
  });

  it('bug Flight+Carn+Camo should die from Anglerfish', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $Q fli carn camo, $W angler, $E wait
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$W'));

    expect(selectGame().question).not.ok;

    expect(selectAnimal(User0, 0).id).equal('$W');
  });

  it(`#bug Anglerfish should die if it's under trematode`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
phase: feeding
food: 5
players:
  - continent: $A angler=true trem$B, $B, $C carn, $D, $W wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$D'));

    expect(selectGame().question).not.ok;

    expect(findAnimal('$D'), '$D is dead').not.ok;
    expect(findAnimal('$C'), '$C is alive').ok;
    expect(findAnimal('$A'), '$A is alive').ok;
    expect(findAnimal('$A').getFood(), '$A.getFood').equal(0);
  });

  it(`#bug Anglerfish shouldn't attack twice if got taillossed`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $B carn tail camo, $W wait
  - continent: $A angler, $C carn
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$A'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitCamouflage));
    clientStore0.dispatch(gameEndTurnRequest());
    expectError(`Expecting cooldown error on attack`, ERRORS.COOLDOWN, () => {
      clientStore1.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'))
    });
    clientStore1.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$A'))
    expect(findAnimal('$A'), '$A is dead').null;
    expect(findAnimal('$B'), '$B is alive').ok;
    expect(findAnimal('$C'), '$C is alive').ok;
  })

  it(`#bug ${tt.TraitInkCloud} should disallow attack for the turn`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $A carn ink camo, $W1 wait
  - continent: $B angler, $W2 wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));

    expectError(`Expecting cooldown error on attack`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    });
    clientStore0.dispatch(gameEndTurnRequest());
  });

  it(`#bug Attacker can't get food after being eaten by angler`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $A carn, $B, $W wait
  - continent: $C angler, $D
`);
    const {selectGame, findAnimal, findPlayerByIndex} = makeGameSelectors(serverStore.getState, gameId);
    const User1 = findPlayerByIndex(1);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));

    expectError(`Expecting cooldown error on attack`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$B'))
    });
  });

  it(`#bug angler defender not acted after being attacked`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $A carn, $B
  - continent: $C angler, $D
`);
    const {selectGame, findAnimal, findPlayerByIndex} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectPlayer1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);
    const User1 = findPlayerByIndex(1);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));

    expect(selectGame().status.currentPlayer, `Current Player is 1`).equal(User1.id);
    expect(User1.acted, `User1 not acted`).false;
    expect(selectPlayer1().acted, `selectPlayer1 not acted`).false;
  });

  it(`#bug attacker can't attack after defending with ink`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $A carn camo ink, $W1 wait
  - continent: $C angler, $W2 wait
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));
    expectError(`Carn is on cooldown`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
    });
    const traitCarnivorous$A = findTrait('$A', tt.TraitCarnivorous);
    expect(
      selectGame().cooldowns.checkFor(tt.TraitCarnivorous, null, '$A', traitCarnivorous$A.id)
      , `Trait ${traitCarnivorous$A.id} has cooldown`
    ).true;
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expectError(`Carn is on cooldown`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
    });
  });

  it(`#bug angler keeps intellect (https://github.com/ivan-work/evolution-web/issues/53)`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn mimi mass wait, $B cni, $C Anglerfish
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
    expect(findAnimal('$C').hasTrait(tt.TraitCarnivorous, true), `$C should have ${tt.TraitCarnivorous}`).ok;
    expect(findAnimal('$C').hasTrait(tt.TraitIntellect, true), `$C should have no intellect`).not.ok;
    expect(findAnimal('$C').traits).size(1);
  });
});