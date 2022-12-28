import * as tt from "../../models/game/evolution/traitTypes";
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {gameEndTurnRequest} from "../game";
import {traitActivateRequest, traitAnswerRequest} from "../trait";
import Errors from "../errors";

describe(tt.TraitAggression, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A aggression carn massive para vivi, $B, $C, $D, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, findTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const traitAggression = findTrait0('$A', tt.TraitAggression)
    expect(traitAggression).ok;

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    expect(findAnimal('$B')).not.ok;
    expect(findAnimal('$A').getFood()).equal(2);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'))
    expect(selectGame().cooldowns.checkFor(traitAggression.type, null, '$A', traitAggression.id)).ok
    expect(selectGame0().cooldowns.checkFor(traitAggression.type, null, '$A', traitAggression.id)).ok
    expect(findAnimal('$C')).not.ok;
    expect(findAnimal('$A').getFood()).equal(4);
    clientStore0.dispatch(gameEndTurnRequest());
    expectError(`Can't attack more than 2 times`, Errors.COOLDOWN, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$D'))
    })
  });

  it('Works with anglerfish as ink cloud', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A aggression carn massive para ink, $B angler, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, findTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const traitAggression = findTrait0('$A', tt.TraitAggression)
    expect(traitAggression).ok;

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud))
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    expect(findAnimal('$B')).not.ok;
    expect(selectGame().cooldowns.checkFor(traitAggression.type, null, '$A', traitAggression.id)).ok
    expect(selectGame0().cooldowns.checkFor(traitAggression.type, null, '$A', traitAggression.id)).ok
    expect(findAnimal('$A').getFood()).equal(2);
    clientStore0.dispatch(gameEndTurnRequest());
    expectError(`Can't attack more than 2 times`, Errors.COOLDOWN, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$D'))
    })
  });

  it('Works with anglerfish as tail loss', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A aggr carn shell tail, $B angler, $W waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, findTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const traitAggression = findTrait0('$A', tt.TraitAggression)
    expect(traitAggression).ok;

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    clientStore0.dispatch(traitAnswerRequest(tt.TraitIntellect, tt.TraitShell))
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss))
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    expect(findAnimal('$B')).not.ok;
  });

  it('Works with mimicry', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A aggr carn, $B mimi, $C, $W waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, findTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const traitAggression = findTrait0('$A', tt.TraitAggression)
    const traitCarnivorous = findTrait0('$A', tt.TraitCarnivorous)
    expect(traitAggression).ok;
    expect(traitCarnivorous).ok;

    expect(findAnimal('$A').getFood()).equal(0)
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$C'))
    expect(findAnimal('$B')).ok;
    expect(findAnimal('$C')).not.ok;
    clientStore0.dispatch(gameEndTurnRequest())
    expect(selectGame().cooldowns.checkFor(traitAggression.type, null, '$A', traitAggression.id)).ok
    expect(selectGame0().cooldowns.checkFor(traitAggression.type, null, '$A', traitAggression.id)).ok
    expect(selectGame().cooldowns.checkFor(tt.TraitCarnivorous, null, '$A', traitCarnivorous.id), `${tt.TraitCarnivorous} is not on CD`).not.ok
    expect(selectGame0().cooldowns.checkFor(tt.TraitCarnivorous, null, '$A', traitCarnivorous.id)).not.ok
    expect(findAnimal('$A').getFood()).equal(2);
  });
});