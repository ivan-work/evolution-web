import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitAnswerRequest
  , traitActivateRequest
  , makeTurnTimeoutId
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import {replaceGetRandom} from '../../utils/randomGenerator';
import {testShiftTime} from '../../utils/reduxTimeout'

import {makeGameSelectors} from '../../selectors';

describe('TraitRunning:', () => {
  it('carn > running', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 0
players:
  - continent: $A carn waiter, $B carn, $C carn, $Runner running
`);
    const {selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(findTrait('$Runner', tt.TraitRunning)).ok;

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Runner'));
      expect(findAnimal('$Runner'), '$Runner ran away').ok;

      expect(ServerGame().getPlayer(User0).acted, 'User0 has acted').true;
      expect(ServerGame().status.phase).equal(PHASE.FEEDING);

      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$Runner'));
      expect(findAnimal('$Runner'), '$Runner ran away').ok;
      clientStore0.dispatch(gameEndTurnRequest());
    });

    replaceGetRandom(() => 0, () => {
      expectUnchanged('Hunter has cooldown', () =>
        clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Runner'))
        , serverStore, clientStore0);
      clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$Runner'));
      expect(findAnimal('$C').getFoodAndFat(), '$C gets food').equal(2);
      expect(findAnimal('$Runner')).null;
    });
  });

  it('B runs away manually', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players: 
  - continent: $A carn wait, $B run tail 
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, findAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
    // C attacks A and A runs out manually
    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
      expect(selectGame().question).ok;
      expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)]).undefined;
      serverStore.dispatch(testShiftTime(50));
      clientStore0.dispatch(traitAnswerRequest(tt.TraitRunning));
    });
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    expect(findAnimal('$A').getFood()).equal(0);
    expect(findAnimal('$B')).ok;
  });

  it('B runs away auto', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players: 
  - continent: $A carn wait, $B run tail 
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, findAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
    // C attacks A and A runs out manually
    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
      expect(selectGame().question).ok;
      expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)]).undefined;
      serverStore.dispatch(testShiftTime(100));
    });
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    expect(findAnimal('$A').getFood()).equal(0);
    expect(findAnimal('$B')).ok;
  });

  it('B fails running manual', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players: 
  - continent: $A carn wait, $B run tail 
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, findAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
    // C attacks A and A runs out manually
    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
      expect(selectGame().question).ok;
      clientStore0.dispatch(traitAnswerRequest(tt.TraitRunning));
      expect(selectGame().question).ok;
    });

    replaceGetRandom(() => 1, () => {
      expectUnchanged(`Running is in cooldown`, () => {
        clientStore0.dispatch(traitAnswerRequest(tt.TraitRunning));
      });
      clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitRunning));
    });
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B')).ok;
  });

  it('B fails running auto', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players: 
  - continent: $A carn wait, $B run tail 
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, findAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);
    // C attacks A and A runs out manually
    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
      expect(selectGame().question).ok;
      serverStore.dispatch(testShiftTime(100));
      expect(selectGame().question).ok;
    });

    replaceGetRandom(() => 1, () => {
      serverStore.dispatch(testShiftTime(100));
    });
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B')).ok;
  });
});






















