
import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
  , traitAnswerRequest
  , makeTurnTimeoutId
} from '../actions';
import {makeGameSelectors} from '../../selectors';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import {replaceGetRandom} from '../../utils/randomGenerator';
import {testShiftTime} from '../../utils/reduxTimeout'


describe('TraitCarnivorous:', function () {
  it('Simple', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
food: 10
phase: feeding
players:
  - continent: $A Carnivorous wait, $B Carnivorous
settings:
  timeTurn: 100
  timeTraitResponse: 100
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    serverStore.dispatch(testShiftTime(50));
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining).equal(50);

    expect(findAnimal('$A').getFood()).equal(2);
    expect(findAnimal('$B')).null;
    expect(selectPlayer(User0).acted, 'acted').true;
  });

  it('Hunting with fat', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
food: 10
phase: feeding
players:
  - continent: $A Carnivorous ++ fat fat fat wait, $B
`);
    const {selectGame, selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(selectPlayer(User0).continent).size(1);
    expect(findAnimal('$A').getFood(), '$A.getFoodAndFat()').equal(2);
    expect(findAnimal('$A').getFoodAndFat(), '$A.getFoodAndFat()').equal(4);
    expect(findAnimal('$A').getFat(), '$A.getFoodAndFat()').equal(2);
    expect(findTrait('$A', tt.TraitFatTissue, 0).value).equal(false);
    expect(findTrait('$A', tt.TraitFatTissue, 1).value).equal(true);
    expect(findTrait('$A', tt.TraitFatTissue, 2).value).equal(true);
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

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$A'));

    expect(selectPlayer(User1).continent).size(3);
    expect(selectAnimal(User0, 0).getFood()).equal(2);

    expect(selectGame().status.turn, 'turn').equal(0);
    expect(selectGame().status.round, 'round').equal(0);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(User0.id);

    expectUnchanged('User0 has cooldown on hunt', () => {
      clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$S'));
      clientStore0.dispatch(traitActivateRequest('$W', tt.TraitCarnivorous, '$S'));
    }, serverStore, clientStore0, clientStore1);
    expectUnchanged('User0 has cooldown on food', () => {
      clientStore0.dispatch(traitTakeFoodRequest('$Q'));
      clientStore0.dispatch(traitTakeFoodRequest('$W'));
    }, serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$W', tt.TraitCarnivorous, '$S'));
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
      clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$S'));
      clientStore0.dispatch(traitActivateRequest('$W', tt.TraitCarnivorous, '$S'));
    }, serverStore, clientStore0, clientStore1);

    expectChanged('$E', () => {
      clientStore0.dispatch(traitActivateRequest('$E', tt.TraitCarnivorous, '$D'))
    }, serverStore, clientStore0, clientStore1);
  });

  it.skip('Order of attack', () => {
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
  })
});