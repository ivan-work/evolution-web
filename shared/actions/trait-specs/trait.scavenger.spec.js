import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitMimicryAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {getRandom} from '../../utils/RandomGenerator';
import {TraitRunning} from '../../models/game/evolution/traitData';

import {makeGameSelectors} from '../../selectors';

describe('TraitScavenger:', () => {
  it('Carnivore <> Scavenger', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 1
players:
  - hand: 1 carn, 1 scavenger
    continent: $A carn, $B scavenger
`);
    const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectCard(User0, 0).trait1.type).equal('TraitCarnivorous');
    expect(selectCard(User0, 1).trait1.type).equal('TraitScavenger');
    expectUnchanged(() => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 0).id, '$A')
    ), serverStore, clientStore0, clientStore1);
    expectUnchanged(() => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 0).id, '$B')
    ), serverStore, clientStore0, clientStore1);
    expectUnchanged(() => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 1).id, '$A')
    ), serverStore, clientStore0, clientStore1);
    expectUnchanged(() => clientStore0.dispatch(
      gameDeployTraitRequest(selectCard(User0, 1).id, '$B')
    ), serverStore, clientStore0, clientStore1);
  });

  it('A > B1 D+; B > E A1+; C > B2 A2+', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}, {User2, clientStore2}] = mockGame(3);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn, $B carn, $C carn, $D scavenger, $E
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

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1).getFood()).equal(0);
    expect(selectAnimal(User0, 2).getFood()).equal(0);
    expect(selectAnimal(User0, 3).id).equal('$D');
    expect(selectAnimal(User0, 3).getFood(), '$D gets food').equal(1);
    expect(selectAnimal(User1, 0).getFood(), '$A1 doesnt get food').equal(0);
    expect(selectAnimal(User2, 0).getFood(), '$A2 doesnt get food').equal(0);

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$E'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1).getFood()).equal(2);
    expect(selectAnimal(User0, 2).getFood()).equal(0);
    expect(selectAnimal(User0, 3).getFood(), '$D gets food').equal(1);
    expect(selectAnimal(User1, 0).getFood(), '$A1 gets food').equal(1);
    expect(selectAnimal(User2, 0).getFood(), '$A2 doesnt get food').equal(0);

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$B2'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1).getFood()).equal(2);
    expect(selectAnimal(User0, 2).getFood()).equal(2);
    expect(selectAnimal(User0, 3).getFood(), '$D gets food').equal(1);
    expect(selectAnimal(User1, 0).getFood(), '$A1 gets food').equal(1);
    expect(selectAnimal(User2, 0).getFood(), '$A2 gets food').equal(1);
  });
});






















