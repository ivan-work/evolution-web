import {
  gameEndTurnRequest
  , traitActivateRequest
  , gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';
import {traitAnswerRequest} from "../trait";

describe(tt.TraitShy, () => {
  it('Dies normally', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn wait, $B shy
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(findAnimal('$A')).ok;
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(2);
    expect(findAnimal('$B')).null;
  });

  it('Protects normally', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn wait, $B shy tail fat, $C carn
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitFatTissue));
    clientStore0.dispatch(gameEndTurnRequest());
    expectUnchanged(`Shy is active now`, () => {
      clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$B'));
    }, serverStore, clientStore0);
    expect(selectGame().question).null;
    expect(findAnimal('$A')).ok;
    expect(findAnimal('$B')).ok;
    expect(findAnimal('$C')).ok;
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$C').getFood(), '$C.getFood()').equal(0);
  });

  it('Protects from intellect', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait, $B shy tail fat, $C carn
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitIntellect, tt.TraitShy));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitFatTissue));
    clientStore0.dispatch(gameEndTurnRequest());
    expectUnchanged(`Shy is active now`, () => {
      clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$B'));
    }, serverStore, clientStore0);
    expect(selectGame().question).null;
    expect(findAnimal('$A')).ok;
    expect(findAnimal('$B')).ok;
    expect(findAnimal('$C')).ok;
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$C').getFood(), '$C.getFood()').equal(0);
  });
});















