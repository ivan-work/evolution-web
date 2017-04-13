import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {makeGameSelectors} from '../../selectors';

describe('TraitGrazing:', () => {
  it('Grazes', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 12 camo
phase: 2
food: 7
players:
  - continent: $A grazing carn, $B + grazing, $C + grazing
`); // full to survive 1 turn
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    // 0-0-0

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitGrazing'));
    expect(selectGame().food).equal(6);
    expect(selectPlayer(User0).acted, 'User acted').equal(true);
    expectUnchanged('Grazing on cooldown', () =>
        clientStore0.dispatch(traitActivateRequest('$A', 'TraitGrazing'))
      , serverStore, clientStore0);
    clientStore0.dispatch(traitActivateRequest('$B', 'TraitGrazing'));
    expect(selectPlayer(User0).acted).equal(true);
    expect(selectGame().food).equal(5);
    clientStore0.dispatch(traitActivateRequest('$C', 'TraitGrazing'));
    expect(selectPlayer(User0).acted).equal(true);
    expect(selectGame().food).equal(4);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    // Turn1, deploy
    expect(selectGame().status.turn, 'PHASE.DEPLOY').equal(1);
    expect(selectGame().status.phase, 'PHASE.DEPLOY').equal(PHASE.DEPLOY);
    clientStore0.dispatch(gameEndTurnRequest());

    // Turn1, action
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitGrazing'));
    expect(selectGame().food).equal(9);
    clientStore0.dispatch(traitActivateRequest('$B', 'TraitGrazing'));
    expect(selectGame().food).equal(8);
    clientStore0.dispatch(traitActivateRequest('$C', 'TraitGrazing'));
    expect(selectGame().food).equal(7);
  });
});