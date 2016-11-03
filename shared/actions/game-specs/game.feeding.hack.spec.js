import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
} from '../actions';

import {makeGameSelectors} from '../../selectors';

describe('Game Hacking (EAT PHASE):', function () {
  it('Simple eating', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
food: 2
phase: 2
players:
  - hand: 6 camo
    continent: $,$
  - continent: $,$
`);
    const {selectCard} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged(`Can't deploy animal on FEEDING`, () =>
        clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0))
      , serverStore, clientStore1);
  });
});