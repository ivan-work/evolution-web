import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
} from '../actions';
import {makeGameSelectors} from '../../selectors';

describe('Game (EAT PHASE):', function () {
  it('Simple eating', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
food: 2
phase: 2
players:
  - continent: $A,$B
  - continent: $A1,$B1
`);
    const {selectGame, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectUnchanged(`User1 can't take food $A when it's User0's turn`, () =>
        clientStore1.dispatch(traitTakeFoodRequest('$A'))
      , serverStore, clientStore1);
    expectUnchanged(`User1 can't take food $A1 when it's User0's turn`, () =>
        clientStore1.dispatch(traitTakeFoodRequest('$C'))
      , serverStore, clientStore1);
    expectUnchanged(`User1 can't end turn when it's User0's turn`, () =>
        clientStore1.dispatch(gameEndTurnRequest())
      , serverStore, clientStore1);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));

    expectUnchanged(`User0 can't take food twice`, () =>
      clientStore0.dispatch(traitTakeFoodRequest('$B'))
      , serverStore, clientStore0);

    expect(selectGame().food, 'ServerGame().food').equal(1);
    expect(ClientGame0().food, 'ClientGame0().food').equal(1);
    expect(ClientGame1().food, 'ClientGame1().food').equal(1);
    expect(selectAnimal(User0, 0).food).equal(1);
    expect(ClientGame0().getPlayer(User0).getAnimal(0).food).equal(1);
    expect(ClientGame1().getPlayer(User0).getAnimal(0).food).equal(1);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().food, 'Players dont take food when skip turns').equal(1); //TODO change

    expectUnchanged(`User 0 can't take food on full animal $A`, () =>
      clientStore0.dispatch(traitTakeFoodRequest('$A'))
      , serverStore, clientStore0);

    clientStore0.dispatch(traitTakeFoodRequest('$B'));

    expect(selectGame().food).equal(0);
    expect(selectAnimal(User0, 0).food).equal(1);
    expect(selectAnimal(User0, 1).food).equal(1);
  });

  it('Increased eating', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
food: 10
phase: 2
players:
  - continent: $A TraitCarnivorous
`);
    const {selectGame, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectGame().food).equal(8);
  });
});