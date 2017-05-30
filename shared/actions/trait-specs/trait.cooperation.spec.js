import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';
import {replaceGetRandom} from '../../utils/randomGenerator';

describe('TraitCooperation:', () => {
  describe('Deploy:', () => {
    it('friend > friend', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: CardCooperation
    continent: $A, $B
`);
      const {selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User0, 0).trait1).equal('TraitCooperation');

      clientStore0.dispatch(gameDeployTraitRequest(
        selectCard(User0, 0).id, '$A', false, '$B'));
      expect(findAnimal('$A').traits).size(1);
      expect(findAnimal('$B').traits).size(1);
      expect(findAnimal('$A').traits.first().ownerId).equal(User0.id);
      expect(findAnimal('$A').traits.first().hostAnimalId, '0 0 hostAnimalId').equal('$A');
      expect(findAnimal('$A').traits.first().linkAnimalId, '0 0 linkAnimalId').equal('$B');
      expect(findAnimal('$B').traits.first().ownerId).equal(User0.id);
      expect(findAnimal('$B').traits.first().hostAnimalId, '1 0 hostAnimalId').equal('$B');
      expect(findAnimal('$B').traits.first().linkAnimalId, '1 0 linkAnimalId').equal('$A');
    });

    it('friend0 > friend1, friend1 > friend2, friend0 > friend2, fail:friend1 > friend2, fail: friend2 > friend0 ', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: 8 CardCooperation
    continent: $A, $B, $C
`);
      const {selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User0, 7).trait1).equal('TraitCooperation');

      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A', false, '$B'));
      expect(findAnimal('$A').traits).size(1);
      expect(findAnimal('$B').traits).size(1);
      expect(findAnimal('$C').traits).size(0);

      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B', false, '$C'));
      expect(findAnimal('$A').traits).size(1);
      expect(findAnimal('$B').traits).size(2);
      expect(findAnimal('$C').traits).size(1);

      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$C', false, '$A'));
      expect(findAnimal('$A').traits).size(2);
      expect(findAnimal('$B').traits).size(2);
      expect(findAnimal('$C').traits).size(2);

      expectUnchanged('No duplicates', () => {
        clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B', false, '$C'));
        clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$C', false, '$A'));
        clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$C', false, '$B'));
      }, serverStore, clientStore0);
    });

    it('fail friend0 > enemy0, fail friend0 > friend0, fail enemy0 > enemy0', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - continent: $A, $B, $C
  - hand: 8 CardCooperation
    continent: $D, $E, $F
`);
      const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User1, 7).trait1).equal('TraitCooperation');
      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged('CHANGEIT', () => {
        clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$D', false, '$A'));
        clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$D', false, '$D'));
        clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$A', false, '$A'));
      }, serverStore, clientStore0, clientStore1);

      expectChanged('CHANGEIT', () => {
        clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$D', false, '$E'))
      }, serverStore, clientStore0, clientStore1);
    });
  });

  describe('Feeding:', () => {
    it('$A-$B-$C-$D take food MANUAL', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn coop$B, $B carn coop$C, $C carn coop$D, $D carn wait
`);
      const {selectGame, selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 0).id));

      expectUnchanged(`Checks for value`, () => {
        clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 0).id));
      }, serverStore, clientStore0);

      clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 1).id));

      expectUnchanged(`Checks for value`, () => {
        clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 1).id));
      }, serverStore, clientStore0);

      clientStore0.dispatch(traitActivateRequest('$C', findTrait('$C', tt.TraitCooperation, 1).id));

      expectUnchanged(`Checks for value`, () => {
        clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 0).id));
        clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 1).id));
        clientStore0.dispatch(traitActivateRequest('$C', findTrait('$C', tt.TraitCooperation, 1).id));
      }, serverStore, clientStore0);

      expect(selectGame().food, 'Game Food').equal(6);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(findAnimal('$C').getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
      expect(findAnimal('$D').getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(1);
    });

    it('$A-$B-$C-$D take food AUTO', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A para coop$B, $B para coop$C wait, $C para coop$D, $D para wait
`);
      const {selectGame, selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitWaiter));
      expect(selectGame().food, 'Game Food').equal(6);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(findAnimal('$C').getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
      expect(findAnimal('$D').getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(1);
    });

    it(`Doesn't generates food from traits`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 12 camo
phase: feeding
food: 10
players:
  - continent: $A piracy coop$A1, $A1, $B carn + coop$B1, $B1, $C
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPiracy, '$B'));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$C'));

      expect(selectGame().food, 'Game Food').equal(10);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(1);
      expect(findAnimal('$A1').getFoodAndFat(), 'Animal $A1.getFoodAndFat()').equal(0);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(2);
      expect(findAnimal('$B1').getFoodAndFat(), 'Animal $B1.getFoodAndFat()').equal(0);
    });

    it('Cant take more food than exists', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 2
players:
  - continent: $A carn coop$B, $B carn coop$C, $C carn coop$D, $D carn
`);
      const {selectGame, selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 0).id));
      expectUnchanged(`Can't take more food`, () => {
        clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 1).id));
      }, serverStore, clientStore0);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(findAnimal('$C').getFoodAndFat(), 'Animal#2 should not get food').equal(0);
      expect(findAnimal('$D').getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(0);
      expect(selectGame().food, 'Game Food').equal(0);
    });

    it('Cant take more food than need', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A + coop$B, $B coop$C, $C +
`);
      const {selectGame, selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

      expectUnchanged(`$A can't take food`, () =>
          clientStore0.dispatch(traitTakeFoodRequest('$A'))
        , serverStore, clientStore0);

      clientStore0.dispatch(traitTakeFoodRequest('$B'));

      expectUnchanged(`Can't take more food`, () => {
        clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 0).id));
        clientStore0.dispatch(traitActivateRequest('$B', findTrait('$B', tt.TraitCooperation, 1).id));
      }, serverStore, clientStore0);

      expect(selectGame().food).equal(9);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(findAnimal('$C').getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
    });

    it(`Can't be used with Communication $A`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A coop$B comm$B para wait, $B comm$C para, $C comm$D coop$D para, $D comm$A para wait
`);
      const {selectGame, selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$A'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));

      console.log(selectPlayer(User0).continent.toArray())
      expect(selectGame().food).equal(8);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(2);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(2);
      expect(findAnimal('$C').getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
      expect(findAnimal('$D').getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(1);
    });

    it(`Can't be used with Communication $D`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A coop$B comm$B para wait, $B comm$C para, $C comm$D coop$D para, $D comm$A para wait
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$D'));
      clientStore0.dispatch(traitActivateRequest('$D', tt.TraitWaiter));

      expect(selectGame().food).equal(8);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(findAnimal('$C').getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(2);
      expect(findAnimal('$D').getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(2);
    });

    it(`Works with symbiosis`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A coop$B symb$B wait, $B wait
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitWaiter));

      expect(selectGame().food).equal(8);
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
    });
  });

  describe('Death:', () => {
    it('Dies from carnivore', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
players:
  - continent: $D carn
  - continent: $A carn coop$B, $B carn coop$C, $C carn
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCarnivorous, '$B'));

      expect(selectGame().getPlayer(User1).continent).size(2);
      expect(findAnimal('$A').traits, 'Animal#A.traits').size(1);
      expect(findAnimal('$C').traits, 'Animal#C.traits').size(1);
    });

    it('Dies from starving', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - continent: $A coop$B, $B carn coop$C, $C
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(findAnimal('$A').traits, 'Animal#0.traits').size(1);
      expect(findAnimal('$B').traits, 'Animal#1.traits').size(3);
      expect(findAnimal('$C').traits, 'Animal#2.traits').size(1);

      // FEEDING 0
      expect(selectGame().food).equal(3);

      clientStore0.dispatch(traitTakeFoodRequest('$A'));

      clientStore0.dispatch(gameEndTurnRequest())
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectPlayer(User0).continent).size(2);
      expect(findAnimal('$A').traits, 'Animal#0.traits').size(0);
      expect(findAnimal('$B')).null;
      expect(findAnimal('$C').traits, 'Animal#1.traits').size(0);
    });
  });
});