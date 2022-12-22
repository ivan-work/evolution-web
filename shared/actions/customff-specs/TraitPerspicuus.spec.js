import * as tt from "../../models/game/evolution/traitTypes";
import {makeGameSelectors} from "../../selectors";
import {traitActivateRequest} from "../trait";
import {GAME_TRAIT_TARGET_ERROR} from "../../errors/ERR";

describe(tt.TraitPerspicuus, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $B TraitPerspicuus, $C TraitPerspicuus +, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectError(`Can't attack Perspicuus`, GAME_TRAIT_TARGET_ERROR, () => clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B')))
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'))
    expect(findAnimal('$A').getFood()).equal(2);
  });
});