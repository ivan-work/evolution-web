import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , gameDeployTraitRequest
  , gameDeployRegeneratedAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe('TraitRecombination:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A recomb$B carn camo ++ wait, $B sharp scav +
`);
    const {selectGame, selectPlayer, findCard, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(findTrait('$A', tt.TraitCamouflage)).ok;
    expect(findTrait('$A', tt.TraitCarnivorous)).ok;
    expect(findTrait('$B', tt.TraitSharpVision)).ok;
    expect(findTrait('$B', tt.TraitScavenger)).ok;

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitCamouflage, tt.TraitSharpVision));
    expect(findTrait('$A', tt.TraitCamouflage)).undefined;
    expect(findTrait('$A', tt.TraitSharpVision)).ok;
    expect(findTrait('$B', tt.TraitSharpVision)).undefined;
    expect(findTrait('$B', tt.TraitCamouflage)).ok;

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitRecombination, tt.TraitScavenger, tt.TraitCarnivorous));
    expectUnchanged('Cooldown', () =>
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitScavenger, tt.TraitCarnivorous))
      , serverStore, clientStore0);
    expect(findTrait('$A', tt.TraitCarnivorous), tt.TraitCarnivorous).undefined;
    expect(findTrait('$A', tt.TraitScavenger), tt.TraitScavenger).ok;
    expect(findTrait('$B', tt.TraitScavenger), tt.TraitScavenger).undefined;
    expect(findTrait('$B', tt.TraitCarnivorous), tt.TraitCarnivorous).ok;

    // A (0/1) B (0/2)
    clientStore0.dispatch(gameEndTurnRequest()); // + Food
    clientStore0.dispatch(gameEndTurnRequest()); // Waiter
    // A (1/1) B (0/2)
    clientStore0.dispatch(gameEndTurnRequest()); // + Food
    clientStore0.dispatch(gameEndTurnRequest()); // Waiter
    // A (1/1) B (1/2)
    clientStore0.dispatch(gameEndTurnRequest()); // + Food
    clientStore0.dispatch(gameEndTurnRequest()); // Waiter
    // A (1/1) B (2/2)
    clientStore0.dispatch(gameEndTurnRequest()); // End feeing
    clientStore0.dispatch(gameEndTurnRequest()); // End deploy

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitRecombination, tt.TraitCamouflage, tt.TraitScavenger));
    expect(findTrait('$A', tt.TraitCamouflage), tt.TraitCamouflage).ok;
    expect(findTrait('$A', tt.TraitScavenger), tt.TraitScavenger).undefined;
    expect(findTrait('$A', tt.TraitCarnivorous), tt.TraitCarnivorous).undefined;
    expect(findTrait('$B', tt.TraitCamouflage), tt.TraitCamouflage).undefined;
    expect(findTrait('$B', tt.TraitScavenger), tt.TraitScavenger).undefined;
    expect(findTrait('$B', tt.TraitCarnivorous), tt.TraitCarnivorous).ok;
  });

  it('BUG dead recombination', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A recomb$B carn fat wait, $B regen
`);
    const {selectGame, selectPlayer, findCard, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expectUnchanged('Dead recombination', () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitFatTissue, tt.TraitRegeneration));
    }, serverStore, clientStore0);
  });

  it('BUG Recombination of fat', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A recomb$B carn fat=true wait, $B regen
`);
    const {selectGame, selectPlayer, findCard, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitFatTissue, tt.TraitRegeneration));

    expect(findTrait('$B', tt.TraitFatTissue).value).equal(false);
  });

  it('BUG Recombination of disabled', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A recomb$B meta neoplasm wait, $B regen carn
`);
    const {selectGame, selectPlayer, findCard, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged('Metamorphosis disabled', () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitMetamorphose, tt.TraitMetamorphose));
    }, serverStore, clientStore0);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitMetamorphose, tt.TraitRegeneration));

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitMetamorphose, tt.TraitMetamorphose));

    expect(findAnimal('$B').getFood()).equal(1)

  });

  it('BUG Recombination kills empty neoplasm', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A recomb$B neoplasm wait, $B fat
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitNeoplasm, tt.TraitFatTissue));

    expect(findAnimal('$A')).ok;
    expect(findAnimal('$B')).null;
    expect(findAnimal0('$A')).ok;
    expect(findAnimal0('$B')).null;
  });

  it(`Recombination+neoplasm doesn't kill animal with 1 trait`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 12
players:
  - continent: $A camo neo fat=true recomb$B , $B fat=true
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitFatTissue, tt.TraitFatTissue));

    expect(findAnimal('$A')).ok;
    expect(findAnimal('$B')).ok;
  });

  it('Recombination+neoplasm enables animal traits', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 12
players:
  - continent: $A camo neo fat=true recomb$B , $B fat=true camo
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitNeoplasm, tt.TraitFatTissue));

    expect(findAnimal('$A'), '$A is alive').ok;
    expect(findAnimal('$B'), '$B is alive').ok;
    expect(findTrait('$A', tt.TraitCamouflage).disabled).not.ok;
  });

  it.skip('Recombination with regen drops all traits', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A1 recomb$B1 fat fat fat, $B1 regen, $A2 recomb$B2 fat fat fat, $B2 regen, $W wait
`);
    const {selectGame, selectPlayer, findCard, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    console.log(findAnimal('$A1'));
    console.log(findAnimal('$B1'));
    console.log(findAnimal('$A2'));
    console.log(findAnimal('$B2'));

    clientStore0.dispatch(traitActivateRequest('$A1', tt.TraitRecombination, tt.TraitFatTissue, tt.TraitRegeneration));
    clientStore0.dispatch(traitActivateRequest('$B2', tt.TraitRecombination, tt.TraitRegeneration, tt.TraitFatTissue));

    console.log(findAnimal('$A1'));
    console.log(findAnimal('$B1'));
    console.log(findAnimal('$A2'));
    console.log(findAnimal('$B2'));
  });
});


























