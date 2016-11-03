import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
} from '../actions';
import {makeGameActionHelpers} from '../generic';
import {makeGameSelectors} from '../../selectors';

import {PHASE} from '../../models/game/GameModel';

describe('Game (Hunting):', function () {
  it('Hunting', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
food: 10
phase: 2
players:
  - continent: Carnivorous, Carnivorous, Carnivorous
  - continent: Carnivorous, Carnivorous, Carnivorous
`);
    const {selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);
    const getAnimalIds = (user) => ServerGame().getIn(['players', user.id, 'continent']).toArray().map(animal => animal.id);

    const User0Animals = getAnimalIds(User0);
    const User1Animals = getAnimalIds(User1);

    clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));

    expect(getAnimalIds(User0)).eql([User0Animals[0], User0Animals[1], User0Animals[2]]);
    expect(getAnimalIds(User1)).eql([User1Animals[1], User1Animals[2]]);

    expect(ServerGame().food).equal(10);
    expect(selectAnimal(User0, 0).food).equal(2);

    expectUnchanged('CHANGEIT', () =>
      clientStore0.dispatch(activateTrait(User0, 1, 'TraitCarnivorous', User1, 0))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged('CHANGEIT', () =>
      clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id))
      , serverStore, clientStore0, clientStore1);
    expectUnchanged('CHANGEIT', () =>
      clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 0).id))
      , serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged('CHANGEIT', () => clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 1).id)), serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());

    expectUnchanged('CHANGEIT', () =>
        clientStore1.dispatch(activateTrait(User1, 1, 'TraitCarnivorous', User0, 0))
      , serverStore, clientStore0, clientStore1);

    expectUnchanged('CHANGEIT', () =>
      clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User0, 0))
      , serverStore, clientStore0, clientStore1);

    expectChanged('CHANGEIT', () =>
      clientStore0.dispatch(activateTrait(User0, 1, 'TraitCarnivorous', User1, 0))
      , serverStore, clientStore0, clientStore1);

    expect(getAnimalIds(User0)).eql([User0Animals[0], User0Animals[1], User0Animals[2]]);
    expect(getAnimalIds(User1)).eql([User1Animals[2]]);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged('CHANGEIT', () =>
      clientStore1.dispatch(activateTrait(User1, 0, 'TraitCarnivorous', User0, 2))
      , serverStore, clientStore0, clientStore1);

    expect(ServerGame().food).equal(9);
    expect(selectAnimal(User0, 0).food).equal(2);
    expect(selectAnimal(User0, 1).food).equal(2);
    expect(selectAnimal(User1, 0).food).equal(2);
    expect(getAnimalIds(User0)).eql([User0Animals[0], User0Animals[1]]);
    expect(getAnimalIds(User1)).eql([User1Animals[2]]);
  });

  it('Hunting after phase', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
food: 10
phase: 2
players:
  - continent: Carnivorous, Carnivorous, $, $
  - continent: Carnivorous, Carnivorous, $, $
`);
    const {selectPlayer} = makeGameSelectors(serverStore.getState, gameId);
    const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);

    clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 2));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(activateTrait(User1, 0, 'TraitCarnivorous', User0, 2));
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(activateTrait(User0, 1, 'TraitCarnivorous', User1, 2));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(activateTrait(User1, 1, 'TraitCarnivorous', User0, 2));
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectPlayer(User0).continent).size(2);
    expect(selectPlayer(User1).continent).size(2);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);


    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getIn(['status', 'turn'])).equal(1);
    expect(ServerGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(ServerGame().getIn(['status', 'currentPlayer'])).equal(1);

    expect(ClientGame1().getPlayer(User1).getAnimal(0).getFood(), 'food pre-hunt').equal(0);

    clientStore1.dispatch(activateTrait(User1, 0, 'TraitCarnivorous', User0, 0));

    expect(ClientGame1().getPlayer(User1).getAnimal(0).getFood(), 'food after-hunt').equal(2);
  });
});