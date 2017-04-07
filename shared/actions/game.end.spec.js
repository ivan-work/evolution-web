import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
} from '../actions/actions';

describe('Game (EAT PHASE):', function () {
  it('Skip Turn limit', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
food: 4
phase: 2
players:
  - continent: $, $, $, $
  - continent: $, $, $, $
`);
    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).skipped).equal(0);
    expect(ServerGame().getPlayer(User1.id).skipped).equal(0);

    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    expect(ServerGame().getPlayer(User0.id).acted).equal(true);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).skipped).equal(0);
    expect(ServerGame().getPlayer(User1.id).skipped).equal(1);

    // wrong animal!
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    expect(ServerGame().getPlayer(User0.id).acted).equal(false);

    // right animal
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 1).id));
    expect(ServerGame().getPlayer(User0.id).acted).equal(true);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).skipped).equal(0);
    expect(ServerGame().getPlayer(User1.id).skipped).equal(1);

    clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 0).id));
    expect(ServerGame().getPlayer(User0.id).skipped).equal(0);
    expect(ServerGame().getPlayer(User1.id).skipped).equal(0);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).skipped).equal(0);
    expect(ServerGame().getPlayer(User1.id).skipped).equal(0);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).skipped).equal(0);
    expect(ServerGame().getPlayer(User0.id).ended).equal(true);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).ended, 'next phase').equal(false);
    expect(ServerGame().getPlayer(User1.id).ended).equal(false);

    ////Skipped turns: 1
    //expect(ServerGame().getPlayer(User0.id).skipped).equal(1);
    //expect(ClientGame0().getPlayer(User0.id).skipped).equal(1);
    //expect(ClientGame1().getPlayer(User0.id).skipped).equal(1);
    //expect(ServerGame().getPlayer(User1.id).skipped).equal(0);
    //expect(ClientGame0().getPlayer(User1.id).skipped).equal(0);
    //expect(ClientGame1().getPlayer(User1.id).skipped).equal(0);
    //
    //clientStore1.dispatch(gameEndTurnRequest());
    //
    //clientStore0.dispatch(gameEndTurnRequest());
    //clientStore1.dispatch(gameEndTurnRequest());
    //
    //expect(ServerGame().status.phase).equal(0);
    //expect(ClientGame0().status.phase).equal(0);
    //expect(ClientGame1().status.phase).equal(0);
    //expect(ServerGame().getPlayer(User0.id).skipped).equal(0);
    //expect(ServerGame().getPlayer(User1.id).skipped).equal(0);
  });
});