import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

import * as tt from '../../models/game/evolution/traitTypes';
import {traitAnswerRequest} from "../trait";

describe('TraitViviparous:', () => {
  it('from taking food', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A vivi fat graz
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectAnimal(User0, 1), '$A should give birth').ok;
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectAnimal(User0, 2), '$A should NOT give another birth').not.ok;
    expect(selectGame().deck, 'Deck size').size(9);
  });

  it('from Hibernation', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
phase: feeding
food: 2
players:
  - continent: $A vivi graz hiber +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitHibernation'));

    expect(selectAnimal(User0, 0).isSaturated(), '$A should leave hibernated state').false;
    expect(selectAnimal(User0, 1), '$A should give birth').ok;
    expect(selectGame().deck, 'Deck size').size(0);
  });

  it('from activated Fat', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 2
players:
  - continent: $A vivi graz fat=true +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitFatTissue'));
    expect(selectAnimal(User0, 1), '$A should give birth').ok;
    expect(selectGame().deck, 'Deck size').size(9);
  });

  it('Angler', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 1 angler, 1 camo
phase: feeding
food: 1
players:
  - continent: $A vivi + wait
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectAnimal(User0, 1), '$A should give birth').ok;
    expect(selectGame().deck, 'Deck size').size(1);
    expect(selectGame().deck.first().trait1, 'Deck has camo').equal('TraitCamouflage');

    expect(selectTrait(User0, 1, 0), 'Newborn has trait').ok;
    expect(selectTrait(User0, 1, 0).type).equal('TraitAnglerfish');
    expect(selectTrait0(User0, 1, 0).type).equal('TraitAnglerfish');
    expect(selectTrait1(User0, 1, 0), 'User1 should not know about angler').undefined;
  });

  it(`From paralyse`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 2 camo
phase: feeding
food: 1
players:
  - continent: $A vivi carn +, $W wait
  - continent: $B cnid
`);
    const {selectGame, findPlayerByIndex, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expect(findPlayerByIndex(0).continent).size(3);
    expect(findPlayerByIndex(1).continent).size(0);

    expect(selectGame().deck, 'Deck size').size(1);
  });

  it(`Doesn't feed if not paralysed without enough food`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 2 camo
phase: feeding
food: 1
players:
  - continent: $A vivi carn, $W wait
  - continent: $B cnid
`);
    const {selectGame, findPlayerByIndex, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expect(findPlayerByIndex(0).continent).size(2);
    expect(findPlayerByIndex(1).continent).size(0);

    expect(selectGame().deck, 'Deck size').size(2);
  });

  it(`From tailloss`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 2 camo
phase: feeding
food: 1
players:
  - continent: $A vivi tail para ++, $B carn, $W wait
`);
    const {selectGame, findPlayerByIndex, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$A'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitParasite));

    expect(findPlayerByIndex(0).continent).size(4);

    expect(selectGame().deck, 'Deck size').size(1);
  });

  it(`From tremathode`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 2 camo
phase: feeding
food: 1
players:
  - continent: $A vivi trem$B ++, $B, $C carn, $W wait
`);
    const {selectGame, findPlayerByIndex, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$B'));

    expect(findPlayerByIndex(0).continent).size(4);

    expect(selectGame().deck, 'Deck size').size(1);
  });

  it(`[BUG] tremathode death triggers vivi`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 5 camo
phase: feeding
food: 0
players:
  - continent: $A vivi trem$B +++, $B, $W wait +
`);
    const {selectGame, findPlayerByIndex, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn, 'Turn 1').equal(1);

    expect(findPlayerByIndex(0).continent).size(2);
  });
});















