import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
} from '../actions';
import {makeGameSelectors} from '../../selectors';

import {PHASE} from '../../models/game/GameModel';

describe('Game (Hunting):', function () {
  it('Simple', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
food: 10
phase: 2
players:
  - continent: $A Carnivorous graz, $B Carnivorous
`);
    const {selectGame, selectAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    expectChanged('$A > $B', () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'))
    }, serverStore, clientStore0, clientStore1);


    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1)).undefined;
    expect(selectPlayer(User0).acted, 'acted').true;
  });

  it('Hunting with fat', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
food: 10
phase: 2
players:
  - continent: $A Carnivorous ++ fat fat fat graz, $B
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectPlayer(User0).continent).size(1);
    expect(selectAnimal(User0, 0).getFoodAndFat(), '$A.getFood()').equal(4);
  });

  it('Cooldowns', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
food: 10
phase: 2
players:
  - continent: $Q carn graz fat, $W carn fat, $E carn fat ++, $R ++
  - continent: $A, $S, $D +, $F +
`);
    const {selectGame, selectAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    expectChanged('$0A > $1A', () => {
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'))
    }, serverStore, clientStore0, clientStore1);

    expect(selectPlayer(User1).continent).size(3);
    expect(selectAnimal(User1, 0).id).equal('$S');

    expect(selectAnimal(User0, 0).getFood()).equal(2);

    expect(selectGame().status.turn).equal(0);
    expect(selectGame().status.round).equal(0);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(selectPlayer(User0).index);

    expectUnchanged('User0 has cooldown on hunt', () => {
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$S'));
      clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    }, serverStore, clientStore0, clientStore1);
    expectUnchanged('User0 has cooldown on food', () => {
      clientStore0.dispatch(traitTakeFoodRequest('$W'));
    }, serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    expect(selectPlayer(User1).continent).size(2);

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1).getFood()).equal(2);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.round).equal(0);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(selectPlayer(User0).index);

    expectUnchanged('User0 still has cooldown on $Q and $W', () => {
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$S'));
      clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    }, serverStore, clientStore0, clientStore1);

    expectChanged('$E', () => {
      clientStore0.dispatch(traitActivateRequest('$E', 'TraitCarnivorous', '$D'))
    }, serverStore, clientStore0, clientStore1);
  });
});