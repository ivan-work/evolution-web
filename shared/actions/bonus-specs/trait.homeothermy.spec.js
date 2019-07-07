import {
  gameEndTurnRequest
  , traitActivateRequest
  , gameDeployTraitRequest, traitTakeFoodRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
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
    expectError(`Can't use Homeothermy simple`, 'answering', () => {
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitHomeothermy));
    });
    expectError(`Can't use Homeothermy as defense`, ERRORS.TRAIT_ACTION_DEFENSE, () => {
      clientStore0.dispatch(traitAnswerRequest(tt.TraitHomeothermy));
    });
  });
});















