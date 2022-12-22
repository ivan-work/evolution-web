import * as tt from "../../models/game/evolution/traitTypes";
import {makeGameSelectors} from "../../selectors";
import {traitActivateRequest} from "../trait";
import {gameEndTurnRequest} from "../game";

describe(tt.TraitInfected, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 10 camo
players:
  - continent: $A carn, $B infected, $C carn flea flea, $D infected, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$A').hasTrait(tt.TraitFlea)).ok;
    expect(findAnimal('$B')).null;
    clientStore0.dispatch(gameEndTurnRequest());
    expect(findAnimal('$C').traits.filter((trait) => trait.type === tt.TraitFlea)).size(2);
    clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$D'))
    expect(findAnimal('$C').traits.filter((trait) => trait.type === tt.TraitFlea)).size(3);
  });
});