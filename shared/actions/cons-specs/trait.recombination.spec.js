import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , gameDeployTraitRequest
  , gameDeployRegeneratedAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';

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

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitRecombination, tt.TraitScavenger, tt.TraitCarnivorous));
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
});