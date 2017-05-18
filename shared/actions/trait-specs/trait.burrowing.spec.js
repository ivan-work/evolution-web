import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitBurrowing:', () => {
  it('Carnivore can attack burrowing with fat', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 5 camo
phase: feeding
food: 1
players:
  - continent: $A carn ++, $B burr fat +, $Waiter graz +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$B'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(selectAnimal(User0, 0).getFood(), '$A food').equal(0);
    expect(selectAnimal(User0, 1).getFood(), '$B food').equal(0);
    expect(selectAnimal(User0, 1).getFat(), '$B fat').equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectAnimal(User0, 0).getFood(), '$A killed $B').equal(2);
    expect(selectAnimal(User0, 1).id).equal('$Waiter');
  });
});






















