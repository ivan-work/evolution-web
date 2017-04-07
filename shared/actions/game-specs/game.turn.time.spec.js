import {Map, List} from 'immutable';

import {
  gameEndTurnRequest
  , gameDeployAnimalRequest
  , traitTakeFoodRequest
  , roomCreateRequest
  , roomEditSettingsRequest
  , roomJoinRequest
  , gameCreateRequest
  , gameReadyRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('Game (TURNS TIME):', function () {
  it('Deploy, basic', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 0
deck: 50 camo
players:
  - hand: 5 camo
  - hand: 5 camo
settings:
  timeTurn: 100
`);

    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    //console.log(selectGame().status, Date.now());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(0);

    //console.log(selectGame().status, Date.now());
    await new Promise(resolve => setTimeout(resolve, 50));
    //console.log(selectGame().status, Date.now());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(0);

    //console.log(selectGame().status, Date.now());
    await new Promise(resolve => setTimeout(resolve, 100));
    //console.log(selectGame().status, Date.now());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'Player changed by turn time').equal(1);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(0);

    await new Promise(resolve => setTimeout(resolve, 100)); // finish
  });

  it.skip('Deploy, switch to feeding', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 0
deck: 50 camo
players:
  - hand: 5 camo
  - hand: 5 camo
settings:
  timeTurn: 100
`);

    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    //console.log(selectGame().status, Date.now());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(0);

    //console.log(selectGame().status, Date.now());
    await new Promise(resolve => setTimeout(resolve, 50));
    //console.log(selectGame().status, Date.now());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(0);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(0);

    //console.log(selectGame().status, Date.now());
    await new Promise(resolve => setTimeout(resolve, 100)); // 150 total time
    //console.log(selectGame().status, Date.now());

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'Player changed by turn time').equal(1);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(0);

    await new Promise(resolve => setTimeout(resolve, 100)); // 250 total time

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer']), '0-2-0 currentPlayer').equal(0);
    expect(selectGame().getIn(['status', 'roundPlayer'])).equal(0);

    console.log(selectGame().status.turnTime, Date.now())
    console.log(serverStore.getTimeouts())
  });
});