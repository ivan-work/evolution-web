import {Map, List} from 'immutable';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';
import {makeGameSelectors} from '../../selectors';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import {replaceGetRandom, replaceGetRandomAsync} from '../../utils/randomGenerator';

describe('TraitCarnivorous:', function () {
  it('Simple', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
food: 10
phase: feeding
players:
  - continent: $A Carnivorous graz, $B Carnivorous
`);
    const {selectGame, selectAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1)).undefined;
    expect(selectPlayer(User0).acted, 'acted').true;
  });

  it('Hunting with fat', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
food: 10
phase: feeding
players:
  - continent: $A Carnivorous ++ fat fat fat graz, $B
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectPlayer(User0).continent).size(1);
    expect(selectAnimal(User0, 0).getFood(), '$A.getFoodAndFat()').equal(2);
    expect(selectAnimal(User0, 0).getFoodAndFat(), '$A.getFoodAndFat()').equal(4);
    expect(selectAnimal(User0, 0).getFat(), '$A.getFoodAndFat()').equal(2);
  });

  it('Cooldowns', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
food: 1
phase: feeding
players:
  - continent: $Q carn fat graz, $W carn fat=true fat=true, $E carn fat=true fat=true
  - continent: $A +, $S +, $D +, $F +
`);
    const {selectGame, selectAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));

    expect(selectPlayer(User1).continent).size(3);
    expect(selectAnimal(User0, 0).getFood()).equal(2);

    expect(selectGame().status.turn, 'turn').equal(0);
    expect(selectGame().status.round, 'round').equal(0);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(User0.id);

    expectUnchanged('User0 has cooldown on hunt', () => {
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$S'));
      clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    }, serverStore, clientStore0, clientStore1);
    expectUnchanged('User0 has cooldown on food', () => {
      clientStore0.dispatch(traitTakeFoodRequest('$Q'));
      clientStore0.dispatch(traitTakeFoodRequest('$W'));
    }, serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    expect(selectPlayer(User1).continent).size(2);

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1).getFood()).equal(2);

    clientStore0.dispatch(gameEndTurnRequest()); // Ending turn after a hunt
    clientStore0.dispatch(gameEndTurnRequest()); // Automatically take the food
    clientStore0.dispatch(gameEndTurnRequest()); // Skipping turn;
    expect(selectGame().status.turn, 'turn').equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn, 'turn').equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn, 'turn').equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.round, 'round').equal(0);
    expect(selectGame().status.currentPlayer).equal(User0.id);

    expectUnchanged('User0 still has cooldown on $Q and $W', () => {
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$S'));
      clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    }, serverStore, clientStore0, clientStore1);

    expectChanged('$E', () => {
      clientStore0.dispatch(traitActivateRequest('$E', 'TraitCarnivorous', '$D'))
    }, serverStore, clientStore0, clientStore1);
  });

  it('traits null bug', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
players: 
  - continent: $A cnid carn comm$B wait, $B cnid carn comm$C wait, $C cnid carn wait
`);
    const {selectGame, selectAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$C'));
  });

  it('Asking for running', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players: 
  - continent: $A wait run tail fat para, $B carn, $C carn, $D carn, $E carn, $G
settings:
  timeTraitResponse: 10
`);
    const {selectGame, selectAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    // B attacks A and gets parasite
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$A'));
    expect(selectGame().question).ok;
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitParasite));

    clientStore0.dispatch(gameEndTurnRequest());

    // C attacks A and A runs out manually
    replaceGetRandomAsync(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$A'));
      expect(selectGame().question).ok;
      clientStore0.dispatch(traitAnswerRequest(tt.TraitRunning));
    });

    clientStore0.dispatch(gameEndTurnRequest());

    // D attacks A and A runs out automatically
    await replaceGetRandomAsync(() => 1, (resolve) => {
      clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCarnivorous, '$A'));
      expect(selectGame().question).ok;
      setTimeout(() => {
        expect(selectGame().question).not.ok;
        resolve();
      }, 20);
    });

    clientStore0.dispatch(gameEndTurnRequest());

    // E attacks A and A runs out automatically, fails and tailloss question pops up
    await replaceGetRandomAsync(() => 0, (resolve) => {
      clientStore0.dispatch(traitActivateRequest('$E', tt.TraitCarnivorous, '$A'));
      expect(selectGame().question).ok;

      setTimeout(() => {
        expect(selectGame().question).ok;
        resolve();
      }, 20);
    });

    expect(selectGame().question).ok;
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(selectGame().question).not.ok;

    clientStore0.dispatch(gameEndTurnRequest());
  });

  it.skip('Order or attack', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players: 
  - continent: $A carn wait, $B mimi tail ink, $C mimi, $D
settings:
  timeTraitResponse: 5
`);
    const {selectGame, selectAnimal, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$C'));
    await new Promise(resolve => setTimeout(resolve, 20));
    await new Promise(resolve => setTimeout(resolve, 100));
  })
});