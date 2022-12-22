import {
  gameEndTurnRequest
  , gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe(tt.TraitAdaptation, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: deploy
players:
  - hand: 2 Adaptation, 2 Massive, 2 Camo
    continent: $A, $B Carnivorous
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectCard0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$A'));
    clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$B'));
    expect(findAnimal('$A').getNeededFood(), '$A.getNeededFood()').equal(1);
    expect(findAnimal('$B').getNeededFood(), '$B.getNeededFood()').equal(1);
    clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$A'));
    clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$B'));
    expectError(`$A can't deploy TraitCamouflage because of tt.TraitAdaptation`, tt.TraitAdaptation, () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$A'));
    });
    expectError(`$B can't deploy TraitCamouflage because of tt.TraitAdaptation`, tt.TraitAdaptation, () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$B'));
    });
    expect(findAnimal('$A').getNeededFood(), '$A.getNeededFood()').equal(1);
    expect(findAnimal('$B').getNeededFood(), '$B.getNeededFood()').equal(2);
  });
});















