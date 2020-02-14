import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , traitTakeShellRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';
import ERRORS from "../errors";

describe('TraitShell:', () => {
  it('Works + food', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 2
players:
  - continent: $A carn comm$D wait, $B carn, $C shell tail piracy, $D shell + fat
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().status.round).equal(0);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$C'));
    clientStore0.dispatch(traitAnswerRequest('TraitShell'));
    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(0);
    expect(selectAnimal(User0, 2).id, 'Animal#C.id').equal('$C');
    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('$C cant eat', () =>
        clientStore0.dispatch(traitTakeFoodRequest('$C'))
      , serverStore, clientStore0);

    expectUnchanged('$B cant attack $C', () =>
      clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$C'))
      , serverStore, clientStore0);

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$D'));
    clientStore0.dispatch(traitAnswerRequest('TraitShell'));
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 3).id, 'Animal#D.id').equal('$D');

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expectUnchanged('$C cant eat', () =>
        clientStore0.dispatch(traitActivateRequest('$C', 'TraitPiracy', '$A'))
      , serverStore, clientStore0);

    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'Animal#C.getFood()').equal(0);
    expect(selectAnimal(User0, 3).getFood(), 'Animal#D.getFood()').equal(1);
  });

  it('Places itself at game', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 5 shell
phase: feeding
players:
  - continent: $A +, $B +, $sh1 shell, $sh2 shell, $C carn shell, $W wait +
`);
    const {selectGame, findAnimal, findTrait, findPlayerByIndex} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getArea().shells).size(0);

    clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$sh2'));

    clientStore0.dispatch(traitAnswerRequest(true));

    expect(findAnimal('$sh2'), '$sh2 is dead').not.ok;
    expect(selectGame().getArea().shells, 'shells amount').size(1);

    clientStore0.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn, 'turn 1').equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);

    expect(findAnimal('$A'), '$A is alive').ok;
    expect(findAnimal('$B'), '$B is alive').ok;
    expect(findAnimal('$C'), '$C is alive').ok;
    expect(findAnimal('$W'), '$W is alive').ok;
    expect(findAnimal('$sh1'), '$sh1 is dead').not.ok;
    expect(findAnimal('$sh2'), '$sh2 is dead').not.ok;

    expectError(`$A can't take shell on deploy`, 'phase', () => {
      clientStore0.dispatch(traitTakeShellRequest('$A', selectGame().getArea().shells.first().id));
    });

    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().getArea().shells, 'shells amount').size(2);

    expectError(`$C can't take shell (already has one)`, ERRORS.TRAIT_MULTIPLE, () => {
      clientStore0.dispatch(traitTakeShellRequest('$C', selectGame().getArea().shells.first().id));
    });

    clientStore0.dispatch(traitTakeShellRequest('$A', selectGame().getArea().shells.first().id));

    expect(findPlayerByIndex(0).acted).ok;

    expect(findTrait('$A', tt.TraitShell)).ok;

    expect(selectGame().getArea().shells, 'shells size after $A took one').size(1);

    expectError(`$A can't take shell on cooldown`, ERRORS.TRAIT_MULTIPLE, () => {
      clientStore0.dispatch(traitTakeShellRequest('$A', selectGame().getArea().shells.first().id));
    });
    expectError(`$B can't take shell on cooldown`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitTakeShellRequest('$B', selectGame().getArea().shells.first().id));
    });

    clientStore0.dispatch(gameEndTurnRequest());

    expectError(`$A can't take shell (already has one)`, ERRORS.TRAIT_MULTIPLE, () => {
      clientStore0.dispatch(traitTakeShellRequest('$A', selectGame().getArea().shells.first().id));
    });

    clientStore0.dispatch(traitTakeShellRequest('$B', selectGame().getArea().shells.first().id));

    expect(selectGame().getArea().shells).size(0);
  });

  it(`Can't use traits under shell`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 5 shell
phase: feeding
food: 6
players:
  - continent: $A carn, $B shell carn meta ${tt.TraitThermosynthesis} ${tt.TraitPhotosynthesis}
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest('TraitShell'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.round, 'Round').equal(2);

    expectUnchanged('$B cant attack', () => {
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$A'));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitThermosynthesis));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitPhotosynthesis));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitMetamorphose, tt.TraitThermosynthesis));
    }, serverStore, clientStore0);
  });
});