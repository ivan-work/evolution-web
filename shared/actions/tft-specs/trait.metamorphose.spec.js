import {
  gameEndTurnRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitMetamorphose:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: 2
food: 2
players:
  - continent: $A meta comm$B, $B, $C meta carn, $Waiter graz
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().status.round).equal(0);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitMetamorphose', selectTraitId(User0, 0, 1)));
    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'Animal#C.getFood()').equal(0);

    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('$C cannot drop carnivorous', () =>
        clientStore0.dispatch(traitActivateRequest('$C', selectTraitId(User0, 2, 0), selectTraitId(User0, 2, 1)))
      , serverStore, clientStore0);

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitMetamorphose', selectTraitId(User0, 2, 0)));
    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'Animal#C.getFood()').equal(1);
  });
});