import {Map, List} from 'immutable';

import {
  gameEndTurnRequest
  , SOCKET_DISCONNECT_NOW
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';
import {testShiftTime} from '../../utils/reduxTimeout'

describe('Game (TURNS TIME):', function () {
  it('Deploy, basic', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: prepare
deck: 50 camo
players:
  - hand: 5 camo
  - hand: 5 camo
`);

    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    //console.log(selectGame().status, Date.now());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(User0.id);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(User0.id);

    serverStore.dispatch(testShiftTime(selectGame().settings.timeTurn));

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'Player changed by turn time').equal(User1.id);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(User0.id);
  });

  it('Deploy, switch to feeding', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: prepare
deck: 50 camo
players:
  - hand: 5 camo
    continent: $
  - hand: 5 camo
    continent: $
`);
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase']), 'first').equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(User0.id);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(User0.id);

    serverStore.dispatch(testShiftTime(selectGame().settings.timeTurn));

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase']), 'third').equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'Player changed by turn time').equal(User1.id);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(User0.id);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer']), '0-2-0 currentPlayer').equal(User0.id);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(User0.id);
  });
});