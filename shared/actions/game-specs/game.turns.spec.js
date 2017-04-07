import {Map, List} from 'immutable';

import {
  gameEndTurnRequest
  , gameDeployAnimalRequest
  , traitTakeFoodRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('Game (TURNS):', function () {
  it('status.currentPlayer', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 0
deck: 50 camo
`);
    const {selectGame, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(ServerGame().getIn(['status', 'turn'])).equal(0);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(0);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(0);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().food).above(2);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(0);

    clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 0).id));

    expect(ServerGame().getIn(['status', 'currentPlayer']), 'User0 took food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest(selectAnimal(User1, 0).id));

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(1);

    expectUnchanged('User0 cant act on turn1', () => clientStore0.dispatch(gameEndTurnRequest())
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(1);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(2);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(0);
  });

  it('status.roundPlayer', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
deck: 50 camo
players:
  - continent: $A
  - continent: $B
`);
    expect(ServerGame().getIn(['status', 'turn'])).equal(0);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(0);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(0);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(0);

    expect(ServerGame().food).above(2);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(traitTakeFoodRequest('$B'));

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(1);

    expectUnchanged('User0 cant act on turn1', () => clientStore0.dispatch(gameEndTurnRequest())
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(1);

    expect(ServerGame().food).above(2);
    clientStore1.dispatch(traitTakeFoodRequest('$B'));
    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expect(ServerGame().getIn(['status', 'turn'])).equal(2);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(ServerGame().getIn(['status', 'roundPlayer'])).equal(0);
  });
});