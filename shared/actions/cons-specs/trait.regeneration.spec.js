import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
  , gameDeployRegeneratedAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';

describe('TraitRegeneration:', () => {
  it('Placements', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: deploy
players:
  - continent: $A regen, $B regen swim, $C angler regen, $D
    hand: 3 camo, 3 vivi, 3 comm
  - hand: 5 camo, 3 trem
`);
    const {selectGame, selectPlayer, findCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectUnchanged(`Cannot be placed to invalid animal (Viviparous)`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitViviparous), '$A'));
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitViviparous), '$B'));
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitViviparous), '$C'));
    }, serverStore, clientStore0);

    expectUnchanged(`Cannot be placed to invalid animal (Camouflage)`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCamouflage), '$B'));
    }, serverStore, clientStore0);

    expectChanged(`Can be placed to valid animal (Camouflage)`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCamouflage), '$A'));
      clientStore1.dispatch(gameDeployAnimalRequest(findCard(User1, tt.TraitCamouflage), 0));
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCamouflage), '$C'));
    }, serverStore, clientStore0);

    expectUnchanged(`Cannot be placed as pair`, () => {
      clientStore1.dispatch(gameDeployTraitRequest(findCard(User1, tt.TraitTrematode), '$D', false, '$B'));
    }, serverStore, clientStore0);
    clientStore1.dispatch(gameDeployAnimalRequest(findCard(User1, tt.TraitCamouflage), 0));

    expectUnchanged(`Cannot be placed as pair`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCommunication), '$D', false, '$B'));
    }, serverStore, clientStore0);
  });

  it('Survives being eaten', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $B regen, $C regen
`);
    const {selectGame, selectPlayer, findCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expect(selectGame().status.turn, 'TURN 1').equal(1);
    expect(selectGame().status.phase, 'PHASE.DEPLOY').equal(PHASE.DEPLOY);

    expect(findAnimal('$A'), 'find $A').ok;
    expect(findAnimal('$B'), 'find $B').ok;
    expect(findAnimal('$C'), 'find $C').null;

    // 10 - (1 + 1 for $A + 0 for $B + 0 for $C) = 8 and -1 for regeneration
    expect(selectGame().deck.size, 'Deck gave 1 card for regeneration').equal(7);
  });

  it('Regeneration phase', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 5 camo
phase: feeding
players:
  - continent: $A carn, $B regen, $C regen
    hand: 4 angler
`);
    const {selectGame, selectPlayer, findCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expect(selectGame().status.turn, 'TURN 0').equal(0);
    expect(selectGame().status.phase, 'PHASE.REGENERATION').equal(PHASE.REGENERATION);

    expect(findAnimal('$A'), 'find $A').ok;
    expect(findAnimal('$B'), 'find $B').ok;
    expect(findAnimal('$C'), 'find $C').null;

    clientStore0.dispatch(gameDeployRegeneratedAnimalRequest(findCard(User0, tt.TraitAnglerfish), '$B'));

    expect(selectGame().status.turn, 'TURN 1').equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);

    // console.log(selectPlayer(User0).continent.map(a => a.traits.toArray()))
    // console.log(selectPlayer(User0).hand)

    // 5 - (1 + 1 for $A + 0 for $B) = 7. -1 for regeneration
    expect(selectPlayer(User0).hand).size(5);
    expect(selectGame().deck.size, 'Deck check').equal(3);
  });

  it('After turn', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
phase: feeding
players:
  - continent: $A carn, $B regen, $C regen, $D carn
`);
    const {selectGame, selectPlayer, findCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCarnivorous, '$C'));

    expect(selectGame().status.phase).equal(PHASE.FINAL);
    expect(selectGame().status.turn, 'TURN 1').equal(0);

    expect(findAnimal('$A'), 'find $A').ok;
    expect(findAnimal('$B'), 'find $B').ok;
    expect(findAnimal('$C'), 'find $C').ok;
    expect(findAnimal('$D'), 'find $D').ok;
    expect(selectGame().deck.size, 'Deck check').equal(0);
    expect(findAnimal('$A').countScore(), 'score $A').equal(4);
    expect(findAnimal('$B').countScore(), 'score $B').equal(3);
    expect(findAnimal('$C').countScore(), 'score $C').equal(1);
    expect(findAnimal('$D').countScore(), 'score $D').equal(4);
  });

  it(`Can't defend symbiont`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
food: 10
phase: feeding
players:
  - continent: $A regen, $B symb$A, $C carn, $D carn wait
`);
    const {selectGame, selectPlayer, findCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged(`Can't take food when $A alive`, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
    }, serverStore, clientStore0);

    clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$A'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitTakeFoodRequest('$B'));
    expect(findAnimal('$B').getFood(), 'find $B').equal(1);
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCarnivorous, '$B'));
    expect(findAnimal('$B'), 'find $B').null;
  });
});