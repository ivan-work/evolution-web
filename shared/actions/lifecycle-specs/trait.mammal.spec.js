//    TraitMammal: Когда $A получает $F, поместите $F на любое свое $A без свойств.
import * as tt from '../../models/game/evolution/traitTypes';
import {makeGameSelectors} from "../../selectors";
import {traitActivateRequest, traitTakeFoodRequest} from "../trait";

describe(`${tt.TraitMammal}:`, () => {
  it(`Normal food, zero`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - continent: $A mamma wait, $B fat, $C camo
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(0);
    expect(findAnimal('$C').getFood()).equal(0);
  })

  it(`Normal food, single`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - continent: $A mamma wait, $B, $C camo, $D +
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(1);
    expect(findAnimal('$C').getFood()).equal(0);
    expect(findAnimal('$B').getFood()).equal(1);
  })

  it(`Plant food, already fed`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: fung $a ++
players:
  - continent: $A mamma wait, $B
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$a'));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(1);
  })

  it(`Cooperation`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - continent: $A mamma wait coop$C, $B, $C camo
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$C'));
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(1);
    expect(findAnimal('$C').getFood()).equal(1);
  })

  it(`works with ${tt.TraitPiracy}`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - continent: $A mamma wait pira, $B, $C mass +
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPiracy, '$C'));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(1);
    expect(findAnimal('$C').getFood()).equal(0);
  })

  it(`works with ${tt.TraitAnglerfish}`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - continent: $A mamma wait, $B angler
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(1);
  })
})