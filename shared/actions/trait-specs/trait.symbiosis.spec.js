import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';
import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';
import {replaceGetRandom} from '../../utils/randomGenerator';

describe('TraitSymbiosis:', () => {
  describe('Deploy:', () => {
    it('friend > friend', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: CardSymbiosis
    continent: $A fat fat, $B fat fat
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User0, 0).trait1).equal('TraitSymbiosis');

      clientStore0.dispatch(gameDeployTraitRequest(
        selectCard(User0, 0).id, '$A', false, '$B'));
      expect(selectAnimal(User0, 0).traits).size(3);
      expect(selectAnimal(User0, 1).traits).size(3);
      expect(selectTrait(User0, 0, 2).ownerId).equal(User0.id);
      expect(selectTrait(User0, 0, 2).hostAnimalId, '0 0 hostAnimalId').equal('$A');
      expect(selectTrait(User0, 0, 2).linkAnimalId, '0 0 linkAnimalId').equal('$B');
      expect(selectTrait(User0, 1, 2).ownerId).equal(User0.id);
      expect(selectTrait(User0, 1, 2).hostAnimalId, '1 0 hostAnimalId').equal('$B');
      expect(selectTrait(User0, 1, 2).linkAnimalId, '1 0 linkAnimalId').equal('$A');
    });

    it('A > B, B > C, C > D, A > D, C > A, fail B > A, fail B > B, fail B > C, B > D', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  -
  - hand: 8 CardSymbiosis
    continent: $A, $B, $C, $D
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User1, 7).trait1).equal('TraitSymbiosis');
      clientStore0.dispatch(gameEndTurnRequest());
      // A > B
      expectChanged('A > B', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$A', false, '$B')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(1);
      expect(selectAnimal(User1, 1).traits).size(1);
      expect(selectAnimal(User1, 2).traits).size(0);
      expect(selectAnimal(User1, 3).traits).size(0);

      // B > C
      expectChanged('B > C', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$C')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(1);
      expect(selectAnimal(User1, 1).traits).size(2);
      expect(selectAnimal(User1, 2).traits).size(1);
      expect(selectAnimal(User1, 3).traits).size(0);

      // C > D
      expectChanged('C > D', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$C', false, '$D')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(1);
      expect(selectAnimal(User1, 1).traits).size(2);
      expect(selectAnimal(User1, 2).traits).size(2);
      expect(selectAnimal(User1, 3).traits).size(1);

      // A > D
      expectChanged('A > D', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$A', false, '$D')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(2);
      expect(selectAnimal(User1, 1).traits).size(2);
      expect(selectAnimal(User1, 2).traits).size(2);
      expect(selectAnimal(User1, 3).traits).size(2);

      // C > A
      expectChanged('C > A', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$C', false, '$A')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(3);
      expect(selectAnimal(User1, 1).traits).size(2);
      expect(selectAnimal(User1, 2).traits).size(3);
      expect(selectAnimal(User1, 3).traits).size(2);

      // fail B > A
      expectUnchanged('B > A', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$A')
      ), serverStore, clientStore0, clientStore1);

      // fail B > B
      expectUnchanged('B > B', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$B')
      ), serverStore, clientStore0, clientStore1);

      // fail B > C
      expectUnchanged('B > C', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$C')
      ), serverStore, clientStore0, clientStore1);

      // B > D
      expectChanged('B > D', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$D')
      ), serverStore, clientStore0, clientStore1);
      expect(selectAnimal(User1, 0).traits).size(3);
      expect(selectAnimal(User1, 1).traits).size(3);
      expect(selectAnimal(User1, 2).traits).size(3);
      expect(selectAnimal(User1, 3).traits).size(3);
    });

    it('fail A > B; fail B > A', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: 8 CardSymbiosis
    continent: $A
  - continent: $A1
`);
      const {selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectCard(User0, 7).trait1).equal('TraitSymbiosis');

      expectUnchanged('A > A1', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User0, 0).id
          , '$A', false, '$A1'
        )), serverStore, clientStore0, clientStore1);

      expectUnchanged('A1 > A', () => clientStore1.dispatch(
        gameDeployTraitRequest(selectCard(User0, 0).id
          , '$A1', false, '$A'
        )), serverStore, clientStore0, clientStore1);
    });
  });

  describe('Feedng:', () => {
    it(`Can't get food when not full`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: feeding
food: 8
players:
  - continent: $A carn symb$B symb$C wait, $B carn fat fat symb$C, $C carn, $D
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectAnimal(User0, 0).traits, 'Animal $A.traits').size(4);
      expect(selectAnimal(User0, 1).traits, 'Animal $B.traits').size(5);
      expect(selectAnimal(User0, 2).traits, 'Animal $C.traits').size(3);

      expectUnchanged(`$A can't take food`, () => clientStore0.dispatch(
        traitTakeFoodRequest('$A')
      ), serverStore);

      expectUnchanged(`$B can't take food`, () => clientStore0.dispatch(
        traitTakeFoodRequest('$B')
      ), serverStore);

      expectChanged(`$C can take food`, () => clientStore0.dispatch(
        traitTakeFoodRequest('$C')
      ), serverStore);

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(1);
      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged(`$A can't take food`, () =>
          clientStore0.dispatch(traitTakeFoodRequest('$A'))
        , serverStore);

      expectUnchanged(`$B can't take food`, () =>
          clientStore0.dispatch(traitTakeFoodRequest('$B'))
        , serverStore);

      expectChanged(`$C can take food`, () =>
          clientStore0.dispatch(traitTakeFoodRequest('$C'))
        , serverStore);

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(2);
      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged(`$A can't take food`, () => clientStore0.dispatch(
        traitTakeFoodRequest('$A')
      ), serverStore);

      expectChanged(`$B can take food`, () => clientStore0.dispatch(
        traitTakeFoodRequest('$B')
      ), serverStore);

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(2);
      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged(`$A can't hunt`, () => clientStore0.dispatch(
        traitActivateRequest('$A', 'TraitCarnivorous', '$D')
      ), serverStore);

      expectChanged(`$B can take food`, () => clientStore0.dispatch(
        traitTakeFoodRequest('$B')
      ), serverStore);

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(0);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(2);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(2);
      clientStore0.dispatch(gameEndTurnRequest());

      expectChanged(`$A can take food`, () => clientStore0.dispatch(
        traitTakeFoodRequest('$A')
      ), serverStore);

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal#1.getFoodAndFat()').equal(2);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal#2.getFoodAndFat()').equal(2);
      clientStore0.dispatch(gameEndTurnRequest());

      expectChanged(`$B can hunt`, () => clientStore0.dispatch(
        traitActivateRequest('$B', 'TraitCarnivorous', '$D')
      ), serverStore);

      expect(selectAnimal(User0, 0).getFoodAndFat(), 'Animal $A.getFoodAndFat()').equal(1);
      expect(selectAnimal(User0, 1).getFoodAndFat(), 'Animal $B.getFoodAndFat()').equal(4);
      expect(selectAnimal(User0, 2).getFoodAndFat(), 'Animal $C.getFoodAndFat()').equal(2);
      expect(selectAnimal(User0, 3)).undefined;
    });
  });

  describe('Death:', () => {
    it(`Can't hunt on symbiotics`, () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: 2 CardSymbiosis
    continent: $A, $B, $C
  - continent: $H carn fat
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameDeployTraitRequest(
        selectCard(User0, 0).id, '$A', false, '$B'
      ));
      clientStore1.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(gameDeployTraitRequest(
        selectCard(User0, 0).id, '$B', false, '$C'
      ));

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectAnimal(User0, 0).traits, 'Animal $A.traits').size(1);
      expect(selectAnimal(User0, 1).traits, 'Animal $B.traits').size(2);
      expect(selectAnimal(User0, 2).traits, 'Animal $C.traits').size(1);

      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged(`$H can't hunt $A`, () => clientStore1.dispatch(
        traitActivateRequest('$H', 'TraitCarnivorous', '$A')
      ), serverStore);

      expectUnchanged(`$H can't take $B`, () => clientStore1.dispatch(
        traitActivateRequest('$H', 'TraitCarnivorous', '$B')
      ), serverStore);

      expectChanged(`$H can hunt $C`, () => clientStore1.dispatch(
        traitActivateRequest('$H', 'TraitCarnivorous', '$C')
      ), serverStore);

      expect(selectAnimal(User0, 0).traits, 'Animal#0.traits').size(1);
      expect(selectAnimal(User0, 1).traits, 'Animal#1.traits').size(1);
      expect(selectAnimal(User0, 2)).undefined;

      expect(selectAnimal(User1, 0).getFoodAndFat(), 'Animal#0.getFoodAndFat()').equal(2);
    });
//    it('Dies from carnivore', () => {
//      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
//      const gameId = ParseGame(`
//phase: deploy
//players:
//  - continent: $D carn
//  - hand: 2 CardCommunication
//    continent: $A carn, $B carn, $C carn
//`);
//      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
//      clientStore0.dispatch(gameEndTurnRequest());
//      clientStore1.dispatch(gameDeployTraitRequest(
//        selectCard(User1, 0).id
//        , '$A', false, '$B'
//      ));
//      clientStore1.dispatch(gameDeployTraitRequest(
//        selectCard(User1, 0).id
//        , '$B', false, '$C'
//      ));
//
//      expect(selectGame().status.phase).equal(PHASE.FEEDING);
//      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(2);
//      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(3);
//      expect(selectAnimal(User1, 2).traits, 'Animal#2.traits').size(2);
//
//      clientStore0.dispatch(traitActivateRequest(
//        '$D', 'TraitCarnivorous', '$B'
//      ));
//
//      expect(selectGame().getPlayer(User1).continent).size(2);
//      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(1);
//      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(1);
//    });
//
//    it('Dies from starving', () => {
//      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
//      const gameId = ParseGame(`
//phase: deploy
//players:
//  -
//  - hand: 2 CardCommunication
//    continent: $A, $B carn, $C
//`);
//      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
//      clientStore0.dispatch(gameEndTurnRequest());
//      clientStore1.dispatch(gameDeployTraitRequest(
//        selectCard(User1, 0).id
//        , '$A', false, '$B'
//      ));
//      clientStore1.dispatch(gameDeployTraitRequest(
//        selectCard(User1, 0).id
//        , '$B', false, '$C'
//      ));
//
//      expect(selectGame().status.phase).equal(PHASE.FEEDING);
//      expect(selectGame().food).above(1);
//      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(1);
//      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(3);
//      expect(selectAnimal(User1, 2).traits, 'Animal#2.traits').size(1);
//
//      clientStore0.dispatch(gameEndTurnRequest());
//
//      clientStore1.dispatch(traitTakeFoodRequest('$A'));
//      clientStore1.dispatch(gameEndTurnRequest());
//      clientStore1.dispatch(gameEndTurnRequest());
//
//      expect(selectGame().getPlayer(User1).continent).size(2);
//      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(0);
//      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(0);
//    });
  });
});