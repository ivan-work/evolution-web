import {
  gameEndTurnRequest
  , traitAnswerRequest
  , traitActivateRequest, gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';
import * as tt from "../../models/game/evolution/traitTypes";

describe('TraitTrematode:', () => {
  it('Cannot be dropped by TailLoss', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A carn wait, $B tail trema$A
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Defense Question0').not.ok;
    expect(findAnimal('$B').hasTrait(tt.TraitTrematode));
  });

  it('Cannot be dropped by TailLoss2', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A carn wait, $B tail fat trema$A
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Defense Question0').ok;

    expectUnchanged('Cannot pick trematode', () => {
      clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTrematode));
    }, serverStore, clientStore0);

    expect(findAnimal('$B').hasTrait(tt.TraitTrematode)).ok;
  });
});