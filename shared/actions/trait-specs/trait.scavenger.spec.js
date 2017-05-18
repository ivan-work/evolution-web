import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitScavenger:', () => {
  it('Carnivore <> Scavenger', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: deploy
players:
  - hand: 1 carn, 1 scavenger
    continent: $A carn, $B scavenger
`);
    const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectCard(User0, 0).trait1).equal('TraitCarnivorous');
    expect(selectCard(User0, 1).trait1).equal('TraitScavenger');
    expectUnchanged('CHANGEIT', () => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 0).id, '$A')
    ), serverStore, clientStore0, clientStore1);
    expectUnchanged('CHANGEIT', () => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 0).id, '$B')
    ), serverStore, clientStore0, clientStore1);
    expectUnchanged('CHANGEIT', () => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 1).id, '$A')
    ), serverStore, clientStore0, clientStore1);
    expectUnchanged('CHANGEIT', () => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 1).id, '$B')
    ), serverStore, clientStore0, clientStore1);
  });

  it('A > B1 D+; B > E A1+; C > B2 A2+', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}, {User2, clientStore2}] = mockGame(3);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn waiter, $B carn, $C carn, $D scavenger, $E
  - continent: $A1 scavenger, $B1
  - continent: $A2 scavenger, $B2
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitScavenger');
    expect(selectTrait(User2, 0, 0).type).equal('TraitScavenger');

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B1'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User0, 1).getFoodAndFat()).equal(0);
    expect(selectAnimal(User0, 2).getFoodAndFat()).equal(0);
    expect(selectAnimal(User0, 3).id).equal('$D');
    expect(selectAnimal(User0, 3).getFoodAndFat(), '$D gets food').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$A1 doesnt get food').equal(0);
    expect(selectAnimal(User2, 0).getFoodAndFat(), '$A2 doesnt get food').equal(0);

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$E'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User0, 1).getFoodAndFat()).equal(2);
    expect(selectAnimal(User0, 2).getFoodAndFat()).equal(0);
    expect(selectAnimal(User0, 3).getFoodAndFat(), '$D gets food').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$A1 gets food').equal(1);
    expect(selectAnimal(User2, 0).getFoodAndFat(), '$A2 doesnt get food').equal(0);

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$B2'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User0, 1).getFoodAndFat()).equal(2);
    expect(selectAnimal(User0, 2).getFoodAndFat()).equal(2);
    expect(selectAnimal(User0, 3).getFoodAndFat(), '$D gets food').equal(1);
    expect(selectAnimal(User1, 0).getFoodAndFat(), '$A1 gets food').equal(1);
    expect(selectAnimal(User2, 0).getFoodAndFat(), '$A2 gets food').equal(1);
  });

  it('killing scavenger', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}, {User2, clientStore2}] = mockGame(3);
    const gameId = ParseGame(`
phase: feeding
food: 1
players:
  - continent: $A carn, $B scavenger
  - continent: $C scavenger fat
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).getFood(), 'Scavenger should receive food').equal(1);
  });
});






















