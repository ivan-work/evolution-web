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
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 12 camo
phase: 2
food: 7
players:
  - continent: $A grazing, $B + grazing, $C + grazing
`); // full to survive 1 turn
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    // 0-0-0

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitGrazing'));
    expect(selectGame().food).equal(6);
    expect(selectPlayer(User0).acted).equal(true);
    expectUnchanged('Grazing on cooldown', () =>
        clientStore0.dispatch(traitActivateRequest('$A', 'TraitGrazing'))
      , serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(traitActivateRequest('$B', 'TraitGrazing'));
    expect(selectPlayer(User0).acted).equal(true);
    expect(selectGame().food).equal(5);
    clientStore0.dispatch(traitActivateRequest('$C', 'TraitGrazing'));
    expect(selectPlayer(User0).acted).equal(true);
    expect(selectGame().food).equal(4);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectPlayer(User0).acted).equal(true);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    // Turn1, deploy
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    // Turn1, action
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    clientStore1.dispatch(gameEndTurnRequest());

    let gameFood = selectGame().food;
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitGrazing'));
    expect(selectGame().food).equal(--gameFood);
    clientStore0.dispatch(traitActivateRequest('$B', 'TraitGrazing'));
    expect(selectGame().food).equal(--gameFood);
    clientStore0.dispatch(traitActivateRequest('$C', 'TraitGrazing'));
    expect(selectGame().food).equal(--gameFood);
  });
});