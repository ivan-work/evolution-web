import * as tt from "../../models/game/evolution/traitTypes";
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {gameEndTurnRequest} from "../game";
import {traitActivateRequest} from "../trait";

describe(tt.TraitCannibalism, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
deck: 10 camo
players:
  - continent: $A cannibalism carn int massive, $B cannibalism carn int massive, $C, $W + waiter
  - continent: $D
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expect(findAnimal('$A').getFood()).equal(0)
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'))
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$D'))
    clientStore0.dispatch(gameEndTurnRequest());

    expect(findAnimal('$A').getFood()).equal(3);
    expect(findAnimal('$B').getFood()).equal(2);
  });
});