import {Map, List} from 'immutable';

import {
  gameEndTurnRequest
} from '../actions/actions';

import {PHASE} from '../../shared/models/game/GameModel';

describe('Game (TURNS):', function () {
  it('Hunting after phase', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
deck: 50 camo
`);
    expect(ServerGame().getIn(['status', 'turn'])).equal(0);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(0);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);

    expectUnchanged(() => clientStore0.dispatch(gameEndTurnRequest())
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(2);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);
  });
});