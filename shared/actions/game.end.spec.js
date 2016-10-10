import {Map, List} from 'immutable';

import {PHASE} from '../../shared/models/game/GameModel';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
} from '../actions/actions';

describe('Game (ENDING PHASE):', function () {
  it('Skip Turn limit', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
deck: 10 camo
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
  });

  it('Next deploy: (FULL DECK)', () => {
    const [{serverStore, ServerGame, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    ParseGame(`
deck: 32 carn
food: 4
phase: 2
players:
  - continent: $, $, $, $ carn +, $
  - continent: $ +, $, $ carn ++, $, $
  - continent:
`);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    // User0: $ +, $, $, $ carn +, $
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).ended).equal(false);
    expect(ServerGame().getPlayer(User1.id).ended).equal(true);

    // User0: $ +, $ +, $, $ carn +, $
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 1).id));
    clientStore0.dispatch(gameEndTurnRequest());

    // User0: $ +, $ +, $ +, $ carn +, $
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 2).id));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().status.turn, 'ServerGame().status.turn').equal(1);
    expect(ServerGame().status.turn, 'ServerGame().status.phase').equal(PHASE.DEPLOY);
    expect(ServerGame().getPlayer(User0).continent).size(3);
    expect(ServerGame().getPlayer(User1).continent).size(2);
    expect(ServerGame().getPlayer(User2).continent).size(0);
    expect(ServerGame().getPlayer(User0).hand).size(4);
    expect(ServerGame().getPlayer(User1).hand).size(3);
    expect(ServerGame().getPlayer(User2).hand).size(6);
  });

  it('Next deploy: (not full DECK)', () => {
    const [{serverStore, ServerGame, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    ParseGame(`
deck: 4 carn
food: 4
phase: 2
players:
  - continent: $ +
  - continent: $ +
  - continent: $ +
`);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0).continent).size(1);
    expect(ServerGame().getPlayer(User1).continent).size(1);
    expect(ServerGame().getPlayer(User2).continent).size(1);
    expect(ServerGame().getPlayer(User0).hand).size(2);
    expect(ServerGame().getPlayer(User1).hand).size(1);
    expect(ServerGame().getPlayer(User2).hand).size(1);
  });

  it('Next deploy: (empty deck)', () => {
    const [{serverStore, ServerGame, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    ParseGame(`
food: 4
phase: 2
players:
  - continent: $ + , $
  - continent: $ + camo sharp
  - continent: $ +,$,$,$
`);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0).countScore(), 'score for User0').equal(4);
    expect(ServerGame().getPlayer(User1).countScore(), 'score for User1').equal(4);
    expect(ServerGame().getPlayer(User2).countScore(), 'score for User2').equal(8);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0).countScore(), 'score for User0').equal(2);
    expect(ServerGame().getPlayer(User1).countScore(), 'score for User1').equal(4);
    expect(ServerGame().getPlayer(User2).countScore(), 'score for User2').equal(2);
    expect(ServerGame().status.phase).equal(PHASE.FINAL);
  });
});