import * as tt from "../../models/game/evolution/traitTypes";
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {traitActivateRequest} from "../trait";

describe(tt.TraitVomitus, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A mass carn, $B mass carn vomit +++, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    expect(findAnimal('$A').getFood()).equal(0);
    expect(findAnimal('$B').getFood()).equal(2);
    expect(findAnimal0('$B').getFood()).equal(2);
  });
});