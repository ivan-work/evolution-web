import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';
import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitCommunication:', () => {
  describe('Deploy:', () => {
    it('friend > friend', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 1
players:
  - hand: CardCommunication
    continent: $A, $B
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User0, 0).trait1).equal('TraitCommunication');

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
phase: 1
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
phase: 1
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
    it('Generates food from taking', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: 2
food: 2
players:
  - hand: 3 CardCommunication
    continent: $A carn comm$B, $B carn comm$C comm$D, $C carn, $D carn, $E
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitTakeFoodRequest('$A'));

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
phase: 2
food: 1
players:
  - continent: $A piracy comm$A1 , $A1, $B hiber comm$B1, $B1, $C carn comm$C1, $C1, $TurnWaiter
  - continent: $X + carn
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$X'));
      clientStore0.dispatch(traitActivateRequest('$B', 'TraitHibernation'));
      clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$X'));

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal $A.getFoodAndFat() ').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal $A1.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal $B.getFoodAndFat() ').equal(0);
      expect(selectAnimal(User0, 3).getFoodAndFat(), 'Animal $B1.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 4).getFoodAndFat(), 'Animal $C.getFoodAndFat() ').equal(2);
      expect(selectAnimal(User0, 5).getFoodAndFat(), 'Animal $C1.getFoodAndFat()').equal(1);
    });

    it('Has cooldown (carn + piracy)', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 1
players:
  - continent: $A carn mass piracy comm$B fat fat, $B fat fat, $TurnWaiter
  - continent: $X + carn, $Y + carn, $Z +
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$X'));
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$Y'));

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(3);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(1);

      clientStore1.dispatch(gameEndTurnRequest());
      // 0-1-0
      clientStore0.dispatch(gameEndTurnRequest());
      // 0-1-1
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectGame().getIn(['status', 'turn'])).equal(1);
      expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
      clientStore1.dispatch(gameEndTurnRequest());

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(0);
      clientStore0.dispatch(traitTakeFoodRequest('$A'));
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(1);
    });

    it(`Works with symbiosis`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: 2
food: 10
players:
  - continent: $A comm$B symb$B, $B, $Waiter graz
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$B'));

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
    });
  });

  describe('Death:', () => {
    it('Dies from carnivore', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 2
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
phase: 2
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