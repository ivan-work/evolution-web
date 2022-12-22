import * as tt from "../../models/game/evolution/traitTypes";
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {gameEndTurnRequest} from "../game";
import {traitActivateRequest} from "../trait";
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

    expect(findAnimal('$A').getFood()).equal(0)
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
});