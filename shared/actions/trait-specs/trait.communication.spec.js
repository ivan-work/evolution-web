import {
  gameDeployTraitRequest
  , gameEndTurnRequest
} from '../actions';

const selectAnimal = (ServerGame, User, a) => ServerGame().getPlayer(User).getAnimal(a);
const selectTrait = (ServerGame, User, a, t) => ServerGame().getPlayer(User).getAnimal(a).traits.get(t);

describe.only('Trait:', () => {
  describe('Communication:', () => {
    describe('Deploy:', () => {
      it('friend > friend', () => {
        const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
        ParseGame(`
phase: 1
players:
  - hand: CardCommunication
    continent: $, $
`);
        expect(ServerGame().getPlayer(User0).getCard(0).trait1.type).equal('TraitCommunication');

        clientStore0.dispatch(gameDeployTraitRequest(
          ServerGame().getPlayer(User0).getCard(0).id
          , ServerGame().getPlayer(User0).getAnimal(0).id
          , false
          , ServerGame().getPlayer(User0).getAnimal(1).id
        ));
        expect(ServerGame().getPlayer(User0).getAnimal(0).traits).size(1);
        expect(ServerGame().getPlayer(User0).getAnimal(1).traits).size(1);
        expect(selectTrait(ServerGame, User0, 0, 0).ownerId).equal(User0.id);
        expect(selectTrait(ServerGame, User0, 0, 0).hostAnimalId, '0 0 hostAnimalId').equal(selectAnimal(ServerGame, User0, 0).id);
        expect(selectTrait(ServerGame, User0, 0, 0).linkAnimalId, '0 0 linkAnimalId').equal(selectAnimal(ServerGame, User0, 1).id);
        expect(selectTrait(ServerGame, User0, 1, 0).ownerId).equal(User0.id);
        expect(selectTrait(ServerGame, User0, 1, 0).hostAnimalId, '1 0 hostAnimalId').equal(selectAnimal(ServerGame, User0, 1).id);
        expect(selectTrait(ServerGame, User0, 1, 0).linkAnimalId, '1 0 linkAnimalId').equal(selectAnimal(ServerGame, User0, 0).id);
      });

      it('friend0 > friend1, friend1 > friend2, friend0 > friend2, fail:friend1 > friend2, fail: friend2 > friend0 ', () => {
        const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
        ParseGame(`
phase: 1
players:
  -
  - hand: 8 CardCommunication
    continent: $, $, $
`);
        expect(ServerGame().getPlayer(User1).getCard(7).trait1.type).equal('TraitCommunication');
        clientStore0.dispatch(gameEndTurnRequest());

        const deployTrait = (a1, a2) => clientStore1.dispatch(gameDeployTraitRequest(
          ServerGame().getPlayer(User1).getCard(0).id
          , selectAnimal(ServerGame, User1, a1).id
          , false
          , selectAnimal(ServerGame, User1, a2).id
        ));

        expectChanged(() => deployTrait(0, 1), serverStore, clientStore0, clientStore1);
        expect(selectAnimal(ServerGame, User1, 0).traits).size(1);
        expect(selectAnimal(ServerGame, User1, 1).traits).size(1);
        expect(selectAnimal(ServerGame, User1, 2).traits).size(0);

        expectChanged(() => deployTrait(1, 2), serverStore, clientStore0, clientStore1);
        expect(selectAnimal(ServerGame, User1, 0).traits).size(1);
        expect(selectAnimal(ServerGame, User1, 1).traits).size(2);
        expect(selectAnimal(ServerGame, User1, 2).traits).size(1);

        expectChanged(() => deployTrait(0, 2), serverStore, clientStore0, clientStore1);
        expect(selectAnimal(ServerGame, User1, 0).traits).size(2);
        expect(selectAnimal(ServerGame, User1, 1).traits).size(2);
        expect(selectAnimal(ServerGame, User1, 2).traits).size(2);

        expectUnchanged(() => deployTrait(1, 2), serverStore, clientStore0, clientStore1);
        expectUnchanged(() => deployTrait(2, 0), serverStore, clientStore0, clientStore1);
        expectUnchanged(() => deployTrait(1, 2), serverStore, clientStore0, clientStore1);
      });

      it('fail friend0 > enemy0, fail friend0 > friend0, fail enemy0 > enemy0', () => {
        const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
        ParseGame(`
phase: 1
players:
  - continent: $, $, $
  - hand: 8 CardCommunication
    continent: $, $, $
`);
        expect(ServerGame().getPlayer(User1).getCard(7).trait1.type).equal('TraitCommunication');
        clientStore0.dispatch(gameEndTurnRequest());

        expectUnchanged(() => clientStore1.dispatch(gameDeployTraitRequest(
          ServerGame().getPlayer(User1).getCard(0).id
          , selectAnimal(ServerGame, User1, 0).id
          , false
          , selectAnimal(ServerGame, User0, 0).id
        )), serverStore, clientStore0, clientStore1);

        expectUnchanged(() => clientStore1.dispatch(gameDeployTraitRequest(
          ServerGame().getPlayer(User1).getCard(0).id
          , selectAnimal(ServerGame, User1, 0).id
          , false
          , selectAnimal(ServerGame, User1, 0).id
        )), serverStore, clientStore0, clientStore1);

        expectUnchanged(() => clientStore1.dispatch(gameDeployTraitRequest(
          ServerGame().getPlayer(User1).getCard(0).id
          , selectAnimal(ServerGame, User0, 0).id
          , false
          , selectAnimal(ServerGame, User0, 0).id
        )), serverStore, clientStore0, clientStore1);

        expectChanged(() => clientStore1.dispatch(gameDeployTraitRequest(
          ServerGame().getPlayer(User1).getCard(0).id
          , selectAnimal(ServerGame, User1, 0).id
          , false
          , selectAnimal(ServerGame, User1, 1).id
        )), serverStore, clientStore0, clientStore1);
      });
    });
  });
});