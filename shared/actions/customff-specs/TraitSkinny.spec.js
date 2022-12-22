import * as tt from "../../models/game/evolution/traitTypes";
import {makeGameSelectors} from "../../selectors";
import {traitActivateRequest} from "../trait";
import {GAME_TRAIT_TARGET_ERROR} from "../../errors/ERR";

describe(tt.TraitSkinny, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $B TraitSkinny, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    expect(findAnimal('$A').getFood()).equal(1);
  });
});