import {Map, List} from 'immutable';

import {
  gameEndTurnRequest
  , gameDeployAnimalRequest
  , traitTakeFoodRequest
} from '../actions';

import {replaceGetRandom} from '../../utils/randomGenerator';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('Game (TURNS):', function () {
  it('status.currentPlayer', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: prepare
deck: 50 camo
`);
    const {selectGame, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().status.turn).equal(0);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(selectGame().status.currentPlayer).equal(0);
    expect(selectGame().status.roundPlayer).equal(0);

    replaceGetRandom(() => 2, () => {
      clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
      clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));

      clientStore0.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(gameEndTurnRequest());
    });

    expect(selectGame().status.turn).equal(0);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(0);
    expect(selectGame().status.roundPlayer).equal(0);

    clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 0).id));

    expect(selectGame().status.currentPlayer, 'User0 took food').equal(1);

    clientStore1.dispatch(traitTakeFoodRequest(selectAnimal(User1, 0).id));

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(selectGame().status.currentPlayer).equal(1);
    expect(selectGame().status.roundPlayer).equal(1);

    expectUnchanged('User0 cant act on turn1', () => clientStore0.dispatch(gameEndTurnRequest())
      , serverStore, clientStore0, clientStore1);

    replaceGetRandom(() => 2, () => {
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(gameEndTurnRequest());
    });

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(1);
    expect(selectGame().status.roundPlayer).equal(1);

    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectAnimal(User1, 0).getFood()).equal(1);
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0)).ok;
    expect(selectAnimal(User1, 0)).ok;

    expect(selectGame().status.turn, 'status.turn').equal(2);
    expect(selectGame().status.phase, 'status.phase').equal(PHASE.DEPLOY);
    expect(selectGame().status.currentPlayer, 'status.currentPlayer').equal(0);
    expect(selectGame().status.roundPlayer, 'status.roundPlayer').equal(0);
  });

  it('status.roundPlayer', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 50 camo
players:
  - continent: $A
  - continent: $B
`);
    const {selectGame, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().status.turn).equal(0);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(selectGame().status.currentPlayer).equal(0);
    expect(selectGame().status.roundPlayer).equal(0);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn).equal(0);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(0);
    expect(selectGame().status.roundPlayer).equal(0);

    expect(selectGame().food).above(2);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(traitTakeFoodRequest('$B'));

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(selectGame().status.currentPlayer).equal(1);
    expect(selectGame().status.roundPlayer).equal(1);

    expectUnchanged('User0 cant act on turn1', () => clientStore0.dispatch(gameEndTurnRequest())
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(1);
    expect(selectGame().status.roundPlayer).equal(1);

    expect(selectGame().food).above(2);
    clientStore1.dispatch(traitTakeFoodRequest('$B'));
    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expect(selectGame().status.turn).equal(2);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(selectGame().status.currentPlayer).equal(0);
    expect(selectGame().status.roundPlayer).equal(0);
  });
});