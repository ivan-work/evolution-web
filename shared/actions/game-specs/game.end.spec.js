import {Map, List} from 'immutable';

import {PHASE} from '../../models/game/GameModel';
import {TraitModel} from '../../models/game/evolution/TraitModel';
import {TraitDataModel} from '../../models/game/evolution/TraitDataModel';
import * as traits from '../../models/game/evolution/traitsData/index';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , roomExitRequest
  , SOCKET_DISCONNECT_NOW
} from '../actions';

describe('Game (ENDING PHASE):', function () {
  it('Skip Turn limit', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
deck: 10 camo
food: 4
phase: 2
players:
  - continent: $A, $B, $C, $D graz
  - continent: $X, $Y, $Z, $W
`);
    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).ended).equal(false);
    expect(ServerGame().getPlayer(User1.id).ended).equal(false);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(ServerGame().getPlayer(User0.id).acted).equal(true);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).ended).equal(false);
    expect(ServerGame().getPlayer(User1.id).ended).equal(false);

    clientStore0.dispatch(gameEndTurnRequest());
    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).ended).equal(false);
    expect(ServerGame().getPlayer(User1.id).ended).equal(false);

    clientStore1.dispatch(gameEndTurnRequest());
    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User1.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).ended).equal(false);
    expect(ServerGame().getPlayer(User1.id).ended).equal(true);

    clientStore0.dispatch(traitTakeFoodRequest('$B'));
    expect(ServerGame().getPlayer(User0.id).acted).equal(true);
    expect(ServerGame().getPlayer(User0.id).ended).equal(false);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).acted).equal(false);
    expect(ServerGame().getPlayer(User0.id).ended).equal(false);

    clientStore0.dispatch(gameEndTurnRequest());

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
  - continent: $A graz, $B, $C, $D carn +, $E
  - continent: $Z +, $X, $C carn ++, $V, $N
  - continent:
`);
    // User0: $A +, $B, $C, $D carn +, $E
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0.id).ended).equal(false);
    expect(ServerGame().getPlayer(User1.id).ended).equal(true);
    expect(ServerGame().getPlayer(User2.id).ended).equal(true);

    // User0: $A +, $B +, $C, $D carn +, $E
    clientStore0.dispatch(traitTakeFoodRequest('$B'));
    clientStore0.dispatch(gameEndTurnRequest());

    // User0: $A +, $B +, $C +, $D carn +, $E
    clientStore0.dispatch(traitTakeFoodRequest('$C'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().status.turn, 'ServerGame().status.turn').equal(1);
    expect(ServerGame().status.turn, 'ServerGame().status.phase').equal(PHASE.DEPLOY);
    expect(ClientGame0().status.turn, 'ClientGame0().status.turn').equal(1);
    expect(ClientGame0().status.turn, 'ClientGame0().status.phase').equal(PHASE.DEPLOY);
    expect(ServerGame().getPlayer(User0).continent).size(3);
    expect(ServerGame().getPlayerAnimal(User0, 0).getFood()).equal(0);
    expect(ServerGame().getPlayerAnimal(User0, 1).getFood()).equal(0);
    expect(ServerGame().getPlayerAnimal(User0, 2).getFood()).equal(0);
    expect(ServerGame().getPlayer(User1).continent).size(2);
    expect(ClientGame0().getPlayer(User1).continent).size(2);
    expect(ServerGame().getPlayer(User2).continent).size(0);
    expect(ClientGame0().getPlayer(User2).continent).size(0);
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

    expect(ServerGame().getPlayer(User0).continent).size(1);
    expect(ServerGame().getPlayer(User1).continent).size(1);
    expect(ServerGame().getPlayer(User2).continent).size(1);
    //console.log(
    //  ServerGame().getPlayer(User0).hand.size
    //  , ServerGame().getPlayer(User1).hand.size
    //  , ServerGame().getPlayer(User2).hand.size
    //)
    //console.log(
    //  ServerGame().status.currentPlayer
    //  , ServerGame().status.roundPlayer
    //  , ServerGame().getPlayer(User0).index
    //  , ServerGame().getPlayer(User1).index
    //  , ServerGame().getPlayer(User2).index
    //)
    expect(ServerGame().getPlayer(User0).hand).size(1);
    expect(ServerGame().getPlayer(User1).hand).size(2);
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
    expect(ServerGame().getPlayer(User0).countScore(), 'score for User0 before').equal(4);
    expect(ServerGame().getPlayer(User1).countScore(), 'score for User1 before').equal(4);
    expect(ServerGame().getPlayer(User2).countScore(), 'score for User2 before').equal(8);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0).countScore(), 'score for User0 after').equal(2);
    expect(ServerGame().getPlayer(User1).countScore(), 'score for User1 after').equal(4);
    expect(ServerGame().getPlayer(User2).countScore(), 'score for User2 after').equal(2);
    expect(ServerGame().status.phase).equal(PHASE.FINAL);
  });

  it('User0, User1 in Game, User0 exits game, User1 win', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(``);
    clientStore0.dispatch(roomExitRequest());
    expect(ServerGame().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ServerGame().winnerId).equal(User1.id);
    expect(ClientGame1().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ClientGame1().winnerId).equal(User1.id);
  });

  it('User0, User1 in Game, User0 disconnects, User1 win', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(``);
    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    expect(ServerGame().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ServerGame().winnerId).equal(User1.id);
    expect(ClientGame1().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ClientGame1().winnerId).equal(User1.id);
  });
});