import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , gameDeployTraitRequest
  , gameDeployRegeneratedAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';

describe('TraitAedificator:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: prepare
players:
  - continent: aedif, aedif
`);
    const {selectGame, selectPlayer, findCard, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().food).equal(14);
  });
});