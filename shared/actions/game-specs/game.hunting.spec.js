import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

describe('Game (Hunting):', function () {
  const shortcutHunt = (sourceGame, sourceIndex, targetGame, targetIndex) => traitActivateRequest(
    sourceGame().getPlayer().continent.get(sourceIndex).id
    , 'TraitCarnivorous'
    , targetGame().getPlayer().continent.get(targetIndex).id
  );

  it('Hunting', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
food: 10
phase: 2
players:
  - continent: Carnivorous, Carnivorous, Carnivorous
  - continent: Carnivorous, Carnivorous, Carnivorous
`);

    const getAnimalIds = (user) => ServerGame().getIn(['players', user.id, 'continent'])
      .toArray().map(animal => animal.id);
    const User0Animals = ServerGame().players.get(User0.id).continent
      .toArray().map(animal => animal.id);
    const User1Animals = ServerGame().players.get(User1.id).continent
      .toArray().map(animal => animal.id);

    clientStore0.dispatch(shortcutHunt(ClientGame0, 0, ClientGame1, 0));

    expect(getAnimalIds(User0)).eql([User0Animals[0], User0Animals[1], User0Animals[2]]);
    expect(getAnimalIds(User1)).eql([User1Animals[1], User1Animals[2]]);

    expect(ServerGame().food).equal(10);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);

    expectUnchanged(() =>
      clientStore0.dispatch(shortcutHunt(ClientGame0, 1, ClientGame1, 0))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged(() =>
      clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged(() =>
      clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 0).id))
      , serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged(() => clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 1).id)), serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());

    expectUnchanged(() =>
        clientStore1.dispatch(shortcutHunt(ClientGame1, 1, ClientGame0, 0))
      , serverStore, clientStore0, clientStore1);

    expectUnchanged(() =>
      clientStore0.dispatch(shortcutHunt(ClientGame0, 0, ClientGame0, 0))
      , serverStore, clientStore0, clientStore1);

    expectChanged(() =>
      clientStore0.dispatch(shortcutHunt(ClientGame0, 1, ClientGame1, 0))
      , serverStore, clientStore0, clientStore1);

    expect(getAnimalIds(User0)).eql([User0Animals[0], User0Animals[1], User0Animals[2]]);
    expect(getAnimalIds(User1)).eql([User1Animals[2]]);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged(() =>
      clientStore1.dispatch(shortcutHunt(ClientGame1, 0, ClientGame0, 2))
      , serverStore, clientStore0, clientStore1);

    expect(ServerGame().food).equal(9);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);
    expect(ServerGame().getPlayerAnimal(User0, 1).food).equal(2);
    expect(ServerGame().getPlayerAnimal(User1, 0).food).equal(2);
    expect(getAnimalIds(User0)).eql([User0Animals[0], User0Animals[1]]);
    expect(getAnimalIds(User1)).eql([User1Animals[2]]);
  });

  it('Hunting after phase', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
deck: 10 camo
food: 10
phase: 2
players:
  - continent: Carnivorous, Carnivorous, $, $
  - continent: Carnivorous, Carnivorous, $, $
`);

    clientStore0.dispatch(shortcutHunt(ClientGame0, 0, ClientGame1, 2));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(shortcutHunt(ClientGame1, 0, ClientGame0, 2));
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(shortcutHunt(ClientGame0, 1, ClientGame1, 2));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(shortcutHunt(ClientGame1, 1, ClientGame0, 2));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['players', User0.id, 'continent'])).size(2);
    expect(ServerGame().getIn(['players', User1.id, 'continent'])).size(2);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);


    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);

    expect(ClientGame1().getPlayer(User1).getAnimal(0).getFood(), 'food pre-hunt').equal(0);

    clientStore1.dispatch(shortcutHunt(ClientGame1, 0, ClientGame0, 0));

    expect(ClientGame1().getPlayer(User1).getAnimal(0).getFood(), 'food after-hunt').equal(2);
  });
});