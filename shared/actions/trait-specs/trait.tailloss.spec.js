import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameActionHelpers} from '../generic';
import {makeGameSelectors} from '../../selectors';

describe('TraitTailLoss:', () => {
  it('Simple drops', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn, $Bca carn, $Bpa carn, $Bta, $Bkill
  - continent: $A1 tailloss, $B1 tailloss carn parasite
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitTailLoss');
    expect(selectTrait(User1, 1, 0).type).equal('TraitTailLoss');
    expect(selectTrait(User1, 1, 1).type).equal('TraitCarnivorous');
    expect(selectTrait(User1, 1, 2).type).equal('TraitParasite');
  });
});