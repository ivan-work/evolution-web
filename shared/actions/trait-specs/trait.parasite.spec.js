import {
  gameDeployTraitRequest
} from '../actions';

import {makeGameSelectors} from '../../selectors';

describe('TraitParasite:', () => {
  it('Can be casted to enemy', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
food: 2
phase: deploy
players:
  - hand: Parasite
    continent: $A
  - continent: $B
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(ServerGame().getPlayer(User0).getCard(0).trait1).equal('TraitParasite');
    clientStore0.dispatch(gameDeployTraitRequest(
      ServerGame().getPlayer(User0).getCard(0).id
      , '$B'
    ));
    expect(findAnimal('$B').traits.map(t => t.type).toArray(), 'User1.Animal0 has trait Parasite')
      .eql(['TraitParasite']);
  });

  it('Cannot be casted to self', () => {

  });
});