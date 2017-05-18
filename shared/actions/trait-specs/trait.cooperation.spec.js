import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';
import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';
import {replaceGetRandom} from '../../utils/randomGenerator';

describe('TraitCooperation:', () => {
  describe('Deploy:', () => {
    it('friend > friend', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: CardCooperation
    continent: $A, $B
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User0, 0).trait1).equal('TraitCooperation');

      clientStore0.dispatch(gameDeployTraitRequest(
        selectCard(User0, 0).id, '$A', false, '$B'));
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
  - hand: 8 CardCooperation
    continent: $A, $B, $C
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User1, 7).trait1).equal('TraitCooperation');
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
  - hand: 8 CardCooperation
    continent: $D, $E, $F
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User1, 7).trait1).equal('TraitCooperation');
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
    it('$A+-$B-$C-$D takes food', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn coop$B, $B carn coop$C, $C carn coop$D, $D carn
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      expect(selectGame().food, 'Game Food').equal(6);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 3).getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(1);
    });

    it('Doesnt generates food from traits', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 12 camo
phase: feeding
food: 10
players:
  - continent: $A piracy coop$A1, $A1, $B carn + coop$B1, $B1, $C
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$B'));
      clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$C'));

      expect(selectGame().food, 'Game Food').equal(10);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal $A.getFoodAndFat()    ').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal $Acoop.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal $B.getFoodAndFat()    ').equal(2);
      expect(selectAnimal(User0, 3).getFoodAndFat(), 'Animal $Bcoop.getFoodAndFat()').equal(0);
    });

    it('Cant take more food than exists', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 2
players:
  - continent: $A carn coop$B, $B carn coop$C, $C carn coop$D, $D carn
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2 should not get food').equal(0);
      expect(selectAnimal(User0, 3).getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(0);
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
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      expectUnchanged(`$A can't take food`, () =>
          clientStore0.dispatch(traitTakeFoodRequest('$A'))
        , serverStore, clientStore0);

      clientStore0.dispatch(traitTakeFoodRequest('$B'));

      expect(selectGame().food).equal(9);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
    });

    it(`Can't be used with Communication $A`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A coop$B comm$B para, $B comm$C para, $C comm$D coop$D para, $D comm$A para, $Waiter graz
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$A'));

      expect(selectGame().food).equal(8);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(2);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(2);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 3).getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(1);
    });

    it(`Can't be used with Communication $D`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A coop$B comm$B para, $B comm$C para, $C comm$D coop$D para, $D comm$A para, $Waiter graz
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$D'));

      expect(selectGame().food).equal(8);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(2);
      expect(selectAnimal(User0, 3).getFoodAndFat(), 'Animal#3.getFoodAndFat()').equal(2);
    });

    it(`Works with symbiosis`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A coop$B symb$B, $B, $Waiter graz
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));

      expect(selectGame().food).equal(8);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
    });
  });

  describe('Death:', () => {
    it('Dies from carnivore', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - continent: $D carn
  - hand: 2 CardCooperation
    continent: $A carn, $B carn, $C carn
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(gameDeployTraitRequest(
        selectCard(User1, 0).id
        , '$A', false, '$B'
      ));
      clientStore1.dispatch(gameDeployTraitRequest(
        selectCard(User1, 0).id
        , '$B', false, '$C'
      ));

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(2);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(3);
      expect(selectAnimal(User1, 2).traits, 'Animal#2.traits').size(2);

      clientStore0.dispatch(traitActivateRequest(
        '$D', 'TraitCarnivorous', '$B'
      ));

      expect(selectGame().getPlayer(User1).continent).size(2);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(1);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(1);
    });

    it('Dies from starving', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - hand: 2 CardCooperation
    continent: $A coop$B, $B carn coop$C, $C
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectAnimal(User0, 0).traits, 'Animal#0.traits').size(1);
      expect(selectAnimal(User0, 1).traits, 'Animal#1.traits').size(3);
      expect(selectAnimal(User0, 2).traits, 'Animal#2.traits').size(1);

      // FEEDING 0
      expect(selectGame().food).equal(3);

      clientStore0.dispatch(traitTakeFoodRequest('$A'));

      expect(selectGame().food).equal(0);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().getPlayer(User0).continent).size(2);
      expect(selectAnimal(User0, 0).traits, 'Animal#0.traits').size(0);
      expect(selectAnimal(User0, 1).traits, 'Animal#1.traits').size(0);
    });
  });
});