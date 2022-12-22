import * as tt from "../../models/game/evolution/traitTypes";
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {traitActivateRequest, traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";

describe(tt.TraitVoracious, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A voracious commu$B fat, $B mass carn para, $W + waiter
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$A'))
    clientStore0.dispatch(gameEndTurnRequest())
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(1);
    clientStore0.dispatch(traitTakeFoodRequest('$A'))
    clientStore0.dispatch(gameEndTurnRequest())
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$B').getFood()).equal(2);
    clientStore0.dispatch(traitTakeFoodRequest('$A'))
    clientStore0.dispatch(gameEndTurnRequest())
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findTrait('$A', tt.TraitFatTissue).value).ok;
    expect(findAnimal('$B').getFood()).equal(3);
    clientStore0.dispatch(traitTakeFoodRequest('$A'))
    clientStore0.dispatch(gameEndTurnRequest())
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$B').getFood()).equal(4);
    clientStore0.dispatch(traitTakeFoodRequest('$A'))
    clientStore0.dispatch(gameEndTurnRequest())
    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$B').getFood()).equal(5);
  });
});