import {
  gameEndTurnRequest
  , traitActivateRequest
  , gameDeployTraitRequest, traitTakeFoodRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as ERR from '../../errors/ERR';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';
import {traitAnswerRequest} from "../trait";
import ERRORS from "../errors";

describe(tt.TraitHomeothermy, () => {
  it(`BUG: Doesn't allow defense with Homeothermy`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $A carn, $B shell homeo, $W wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(selectGame().question, `Game has the question`).ok;
    expectError(`Can't use Homeothermy simple`, ERR.GAME_PLAYER_ACT_ON_QUESTION, () => {
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitHomeothermy));
    });
    expectError(`Can't use Homeothermy as defense`, ERR.GAME_TRAIT_ACTION_DEFENSE, () => {
      clientStore0.dispatch(traitAnswerRequest(tt.TraitHomeothermy));
    });
  });

  it(`BUG: Homeothermy with cooperation with 1 food`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 1
players:
  - continent: $A para homeo coop$B, $B, $W wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expectError(`Can't use Homeothermy simple`, ERRORS.GAME_FOOD, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitHomeothermy));
    });
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(0);
  });

  it(`BUG: Homeothermy with cooperation with 2 food`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 2
players:
  - continent: $A para homeo coop$B, $B, $W wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expectError(`Can't use Homeothermy simple`, ERRORS.GAME_FOOD, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitHomeothermy));
    });
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B').getFood()).equal(1);
  });
});















