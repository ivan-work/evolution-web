import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
} from '../actions/actions';

describe('Game (EAT PHASE):', function () {
  it('Simple eating', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
food: 2
phase: 2
players:
  - continent: $,$
  - continent: $,$
`);
    expectUnchanged(() => clientStore1.dispatch(traitTakeFoodRequest(ClientGame1().getPlayerAnimal(User1, 0).id)), serverStore, clientStore1);
    expectUnchanged(() => clientStore1.dispatch(gameEndTurnRequest()), serverStore, clientStore1);

    //clientStore0.clearActions();
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    //console.log(clientStore0.getActions())

    expectUnchanged(() => clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id)), serverStore, clientStore0);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().food, 'ServerGame().food').equal(1);
    expect(ClientGame0().food, 'ClientGame0().food').equal(1);
    expect(ClientGame1().food, 'ClientGame1().food').equal(1);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(1);
    expect(ClientGame0().getPlayerAnimal(User0, 0).food).equal(1);
    expect(ClientGame1().getPlayerAnimal(User0, 0).food).equal(1);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().food, 'Players dont take food when skip turns //TODO').equal(1);

    expectUnchanged(() => clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id)), serverStore, clientStore0);

    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 1).id));

    expect(ServerGame().food).equal(0);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(1);
    expect(ServerGame().getPlayerAnimal(User0, 1).food).equal(1);
  });

  it('Increased eating', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
food: 10
phase: 2
players:
  - continent: TraitCarnivorous
`);

    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);
    expect(ServerGame().food).equal(8);
  });

  it('Hunting', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
food: 10
phase: 2
players:
  - continent: Carnivorous, Carnivorous, Carnivorous
  - continent: Carnivorous, Carnivorous, Carnivorous
`);

    clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 0).id
      , 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    ));

    expect(ServerGame().food).equal(10);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);
    expect(ServerGame().players.get(User1.id).continent.size).equal(2);


    expectUnchanged(() => clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 1).id, 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    )), serverStore, clientStore0, clientStore1);

    expectUnchanged(() => clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id)), serverStore, clientStore0, clientStore1);
    expectUnchanged(() => clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 0).id)), serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged(() => clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 1).id)), serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());

    expectUnchanged(() => clientStore1.dispatch(traitActivateRequest(
      ClientGame1().getPlayerAnimal(User1, 1).id, 'TraitCarnivorous'
      , ClientGame1().getPlayerAnimal(User0, 0).id
    )), serverStore, clientStore0, clientStore1);

    expectUnchanged(() => clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 0).id
      , 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    )), serverStore, clientStore0, clientStore1);

    expectChanged(() => clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 1).id
      , 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    )), serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged(() => clientStore1.dispatch(traitActivateRequest(
      ServerGame().getPlayerAnimal(User1, 0).id
      , 'TraitCarnivorous'
      , ServerGame().getPlayerAnimal(User0, 2).id
    )), serverStore, clientStore0, clientStore1);

    expect(ServerGame().food).equal(9);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);
    expect(ServerGame().getPlayerAnimal(User0, 1).food).equal(2);
    expect(ServerGame().getPlayerAnimal(User1, 0).food).equal(2);
    expect(ServerGame().players.get(User0.id).continent.size).equal(2);
    expect(ServerGame().players.get(User1.id).continent.size).equal(1);
  });
});