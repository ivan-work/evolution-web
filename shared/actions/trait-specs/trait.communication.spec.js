import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import * as ERR from '../../errors/ERR';
import * as tt from '../../models/game/evolution/traitTypes';
import {testShiftTime} from '../../utils/reduxTimeout'

import {makeGameSelectors} from '../../selectors';

describe('TraitCommunication:', () => {
  describe('Deploy:', () => {
    it('friend > friend', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: CardCommunication
    continent: $A, $B
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User0, 0).trait1).equal('TraitCommunication');

      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A', false, '$B'));
      expect(selectAnimal(User0, 0).traits).size(1);
      expect(selectAnimal(User0, 1).traits).size(1);
      expect(selectTrait(User0, 0, 0).ownerId).equal(User0.id);
      expect(selectTrait(User0, 0, 0).hostAnimalId, '0 0 hostAnimalId').equal('$A');
      expect(selectTrait(User0, 0, 0).linkAnimalId, '0 0 linkAnimalId').equal('$B');
      expect(selectTrait(User0, 1, 0).ownerId).equal(User0.id);
      expect(selectTrait(User0, 1, 0).hostAnimalId, '1 0 hostAnimalId').equal('$B');
      expect(selectTrait(User0, 1, 0).linkAnimalId, '1 0 linkAnimalId').equal('$A');
    });

    it('friend0 > friend1, friend1 > friend2, friend0 > friend2, fail:friend1 > friend2, fail: friend2 > friend0 ', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  -
  - hand: 8 CardCommunication
    continent: $A, $B, $C
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User1, 7).trait1).equal('TraitCommunication');
      clientStore0.dispatch(gameEndTurnRequest());

      expectChanged('CHANGEIT', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$A', false, '$B')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(1);
      expect(selectAnimal(User1, 1).traits).size(1);
      expect(selectAnimal(User1, 2).traits).size(0);

      expectChanged('CHANGEIT', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$C')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(1);
      expect(selectAnimal(User1, 1).traits).size(2);
      expect(selectAnimal(User1, 2).traits).size(1);

      expectChanged('CHANGEIT', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$C', false, '$A')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(2);
      expect(selectAnimal(User1, 1).traits).size(2);
      expect(selectAnimal(User1, 2).traits).size(2);

      expectUnchanged('CHANGEIT', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$C')
      ), serverStore, clientStore0, clientStore1);
      expectUnchanged('CHANGEIT', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$C', false, '$A')
      ), serverStore, clientStore0, clientStore1);
      expectUnchanged('CHANGEIT', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$C', false, '$B')
      ), serverStore, clientStore0, clientStore1);
    });

    it('fail friend0 > enemy0, fail friend0 > friend0, fail enemy0 > enemy0', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - continent: $A, $B, $C
  - hand: 8 CardCommunication
    continent: $D, $E, $F
`);
      const {selectGame, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User1, 7).trait1).equal('TraitCommunication');
      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged('CHANGEIT', () => clientStore1.dispatch(gameDeployTraitRequest(
        selectCard(User1, 0).id
        , '$D', false, '$A'
      )), serverStore, clientStore0, clientStore1);

      expectUnchanged('CHANGEIT', () => clientStore1.dispatch(gameDeployTraitRequest(
        selectCard(User1, 0).id
        , '$D', false, '$D'
      )), serverStore, clientStore0, clientStore1);

      expectUnchanged('CHANGEIT', () => clientStore1.dispatch(gameDeployTraitRequest(
        selectCard(User1, 0).id
        , '$A', false, '$A'
      )), serverStore, clientStore0, clientStore1);

      expectChanged('CHANGEIT', () => clientStore1.dispatch(gameDeployTraitRequest(
        selectCard(User1, 0).id
        , '$D', false, '$E'
      )), serverStore, clientStore0, clientStore1);
    });
  });

  describe('Feeding:', () => {
    it('Generates food from taking AUTO', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 2
players:
  - continent: $A carn comm$B wait, $B carn comm$C comm$D, $C carn, $D carn wait
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      expectUnchanged(`Values`, () => {
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCommunication));
      }, serverStore, clientStore0);

      clientStore0.dispatch(traitTakeFoodRequest('$A'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));

      expectUnchanged(`Cooldowns`, () => {
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCommunication));
      }, serverStore, clientStore0);

      expect(selectGame().food).equal(1);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 3).getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(1);
    });

    it('Generates food from traits', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 1
players:
  - continent: $A piracy comm$A1 wait , $A1, $B hiber comm$B1, $B1, $C carn comm$C1, $C1 wait
  - continent: $X + carn
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPiracy, '$X'));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitHibernation));
      clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$X'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));

      expect(findAnimal('$A').getFoodAndFat(), 'Animal $A.getFoodAndFat() ').equal(1);
      expect(findAnimal('$A1').getFoodAndFat(), 'Animal $A1.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal $B.getFoodAndFat() ').equal(0);
      expect(findAnimal('$B1').getFoodAndFat(), 'Animal $B1.getFoodAndFat()').equal(0);
      expect(findAnimal('$C').getFoodAndFat(), 'Animal $C.getFoodAndFat() ').equal(2);
      expect(findAnimal('$C1').getFoodAndFat(), 'Animal $C1.getFoodAndFat()').equal(1);
    });

    it('Has cooldown (carn + piracy)', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 0
players:
  - continent: $A carn mass piracy comm$B wait para, $B wait para
  - continent: $X, $Y + mass
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$X'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPiracy, '$Y'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));

      expect(findAnimal('$A').getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(3);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(1);
    });

    it('No cooldown (carn + piracy) (over two round)', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 0
players:
  - continent: $A carn mass piracy comm$B wait, $B wait
  - continent: $X, $Y + mass
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$X'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));
      expect(findAnimal('$A').getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(2);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(1);
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectGame().status.round, 'Round').equal(1);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPiracy, '$Y'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));
      expect(findAnimal('$A').getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(3);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(1);
    });

    it('Piracy waits for autofood', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 5
players:
  - continent: $A mass comm$B wait +, $B wait mass piracy 
  - continent: $X, $Y + mass
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      expectError(`Error since communication prevents from eating`, ERR.GAME_TRAIT_TARGET_ERROR, () => {
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitPiracy, '$A'));
      });
      expect(findAnimal('$A').getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(2);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(1);
    });

    it(`Works with symbiosis`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A comm$B symb$B wait, $B, $Waiter graz
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitWaiter));

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
    });

    it(`Works with cooperation`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A mass comm$B coop$B wait, $B mass wait
`);
      const {selectGame, selectPlayer, findAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCooperation));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCommunication));

      expectUnchanged(`Cooldowns`, () => {
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCooperation));
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCooperation));
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCommunication));
      }, serverStore, clientStore0);

      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged(`Values`, () => {
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCooperation));
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCommunication));
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCooperation));
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCommunication));
      }, serverStore, clientStore0);

      expect(findAnimal('$A').getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(2);
    });

    it(`Works at autoturn`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A comm$B, $B
  - continent: $C
`);
      const {selectGame, selectPlayer, findAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest('$A'));
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#B.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#B.getFoodAndFat()').equal(1);
    });

    it(`Works in afk player`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A comm$B wait, $B wait
  - continent: $C
`);
      const {selectGame, selectPlayer, findAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      serverStore.dispatch(testShiftTime(selectGame().settings.timeTurn)); // Waiting for auto turn
      // serverStore.dispatch(testShiftTime(5e3)); // Should not wait
      expect(findAnimal('$A').getFoodAndFat(), 'Animal#B.getFoodAndFat()').equal(1);
      expect(findAnimal('$B').getFoodAndFat(), 'Animal#B.getFoodAndFat()').equal(1);
    });
  });

  describe('Death:', () => {
    it('Dies from carnivore', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
food: 1
players:
  - continent: $A carn, $WaitTurn
  - continent: $X carn comm$Y comm$Z, $Y, $Z
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$X'));

      expect(selectGame().getPlayer(User1).continent).size(2);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(0);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(0);
    });

    it('Dies from starving', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A +, $B carn comm$A comm$C, $C +
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().getPlayer(User0).continent).size(2);
      expect(selectAnimal(User0, 0).traits, 'Animal#0.traits').size(0);
      expect(selectAnimal(User0, 1).traits, 'Animal#1.traits').size(0);
    });
  });
});