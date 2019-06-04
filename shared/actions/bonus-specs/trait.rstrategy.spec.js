import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe(tt.TraitRstrategy, () => {
  it('Deploy', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: deploy
players:
  - continent: $A +
    hand: 4 rstr
  - continent: $B +
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B'));
    expect(findAnimal('$A').traits, '$A traits').size(1);
    expect(findAnimal('$B').traits, '$B traits').size(1);
  });

  it('At the end', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
deck: 11 camo
phase: feeding
players:
  - continent: $ +, rstr +, rstr +
  - continent: $ +, rstr +, rstr +
  - continent: $ +, $ +, $ +, $ +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(selectPlayer(User0).hand, '(User0).hand').size(2);
    expect(selectPlayer(User0).continent, '(User0).continent').size(3 + 1);
    expect(selectPlayer(User1).hand, '(User1).hand').size(2);
    expect(selectPlayer(User1).continent, '(User1).continent').size(3 + 1);
    expect(selectPlayer(User2).hand, '(User2).hand').size(5);
    expect(selectPlayer(User2).continent, '(User2).continent').size(4);
    expect(selectAnimal(User0, 2).getFood(), 'Newborn should be without food').equal(0);
  });

  it('Dead at the end with regen', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 11 camo
phase: feeding
players:
  - continent: $A carn, $B rstr regen, $W wait
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(findAnimal('$A')).ok;
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(2);
    expect(findAnimal('$B')).ok;
    expect(findAnimal('$W')).ok;
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(findAnimal('$A'), '$A still alive').ok;
    expect(findAnimal('$B'), '$B still alive').ok;
    expect(findAnimal('$W'), '$W still alive').null;
    expect(selectPlayer(User0).hand, '(User0).hand').size(2);
    expect(selectPlayer(User0).continent, '(User0).continent').size(2);
  });
});















