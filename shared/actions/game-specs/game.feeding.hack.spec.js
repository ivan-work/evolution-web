import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
} from '../actions';

describe('Game Hacking (EAT PHASE):', function () {
  it('Simple eating', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
food: 2
phase: 2
players:
  - hand: 6 camo
    continent: $,$
  - continent: $,$
`);

    expectUnchanged(() => clientStore0.dispatch(gameDeployAnimalRequest(ClientGame0().getPlayerCard(User0, 0).id, 0)), serverStore, clientStore1);
  });
});