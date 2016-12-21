import {
  gameDeployTraitRequest
} from '../actions';

describe('TraitParasite:', () => {
  it('Can be casted to enemy', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
food: 2
phase: 1
players:
  - hand: Parasite
    continent: $
  - continent: $
`);
    expect(ServerGame().getPlayer(User0).getCard(0).trait1).equal('TraitParasite');
    clientStore0.dispatch(gameDeployTraitRequest(
      ServerGame().getPlayer(User0).getCard(0).id
      , ServerGame().getPlayer(User1).getAnimal(0).id
    ));
    expect(ServerGame().getPlayer(User1).getAnimal(0).traits, 'User1.Animal0 has trait Parasite').size(1);
    expect(ServerGame().getPlayer(User1).getAnimal(0).traits.get(0).type).equal('TraitParasite');
  });

  it('Cannot be casted to self', () => {

  });
});