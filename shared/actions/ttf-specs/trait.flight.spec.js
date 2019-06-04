import {
  gameEndTurnRequest
  , traitActivateRequest
  , gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';
import {traitAnswerRequest} from "../trait";

describe(tt.TraitFlight, () => {
  it('Protects normally', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $B flight fat, $C carn wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectUnchanged(`Flight active`, () => {
      clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$B'));
    }, serverStore, clientStore0);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(findAnimal('$A')).ok;
    expect(findAnimal('$B')).null;
    expect(findAnimal('$C')).ok;
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(2);
    expect(findAnimal('$C').getFood(), '$C.getFood()').equal(0);
  });

  it('Protects ambusher', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $B flight angler angler
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectUnchanged(`Flight works despite angler`, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    }, serverStore, clientStore0);
    expect(findAnimal('$A')).ok;
    expect(findAnimal('$B')).ok;
  });
});















