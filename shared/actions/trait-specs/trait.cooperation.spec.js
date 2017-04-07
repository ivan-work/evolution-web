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
phase: 1
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
phase: 1
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
phase: 1
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
    it('$A-$B-$C-$D takes food', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 1
players:
  -
  - hand: 3 CardCooperation
    continent: $A carn, $B carn, $C carn, $D carn
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
      clientStore1.dispatch(gameDeployTraitRequest(
        selectCard(User1, 0).id
        , '$B', false, '$D'
      ));

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectGame().food).above(1);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(2);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(4);
      expect(selectAnimal(User1, 2).traits, 'Animal#2.traits').size(2);
      expect(selectAnimal(User1, 3).traits, 'Animal#3.traits').size(2);

      clientStore0.dispatch(gameEndTurnRequest());

      clientStore1.dispatch(traitTakeFoodRequest('$A'));

      expect(selectAnimal(User1, 0).getFood(), 'Animal#0.getFood()').equal(1);
      expect(selectAnimal(User1, 1).getFood(), 'Animal#1.getFood()').equal(1);
      expect(selectAnimal(User1, 2).getFood(), 'Animal#2.getFood()').equal(1);
      expect(selectAnimal(User1, 3).getFood(), 'Animal#3.getFood()').equal(1);
    });

    it('Doesnt generates food from traits', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 12 camo
phase: 1
players:
  - continent: $X + carn
  - hand: 3 CardCooperation
    continent: $A piracy, $Acoop, $B hiber, $Bcoop, $C carn, $Ccoop
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$A', false, '$Acoop'));
      clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$B', false, '$Bcoop'));
      clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$C', false, '$Ccoop'));

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(2);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(1);
      expect(selectAnimal(User1, 2).traits, 'Animal#2.traits').size(2);
      expect(selectAnimal(User1, 3).traits, 'Animal#3.traits').size(1);
      expect(selectAnimal(User1, 4).traits, 'Animal#3.traits').size(2);
      expect(selectAnimal(User1, 5).traits, 'Animal#3.traits').size(1);

      clientStore0.dispatch(gameEndTurnRequest());

      clientStore1.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$X'));
      clientStore1.dispatch(traitActivateRequest('$B', 'TraitHibernation'));
      clientStore1.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$X'));

      expect(selectAnimal(User1, 0).getFood(), 'Animal $A.getFood()    ').equal(1);
      expect(selectAnimal(User1, 1).getFood(), 'Animal $Acoop.getFood()').equal(0);
      expect(selectAnimal(User1, 2).getFood(), 'Animal $B.getFood()    ').equal(0);
      expect(selectAnimal(User1, 3).getFood(), 'Animal $Bcoop.getFood()').equal(0);
      expect(selectAnimal(User1, 4).getFood(), 'Animal $C.getFood()    ').equal(2);
      expect(selectAnimal(User1, 5).getFood(), 'Animal $Ccoop.getFood()').equal(0);
    });

    it('Cant take more food than exists', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 1
players:
  -
  - hand: 2 CardCooperation
    continent: $A, $B, $C
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      replaceGetRandom(() => 0, () => {
        clientStore0.dispatch(gameEndTurnRequest());
        clientStore1.dispatch(gameDeployTraitRequest(
          selectCard(User1, 0).id
          , '$A', false, '$B'
        ));
        clientStore1.dispatch(gameDeployTraitRequest(
          selectCard(User1, 0).id
          , '$B', false, '$C'
        ));
      });

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(1);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(2);
      expect(selectAnimal(User1, 2).traits, 'Animal#2.traits').size(1);

      clientStore0.dispatch(gameEndTurnRequest());

      // FEEDING 0
      expect(selectGame().food).equal(2);

      clientStore1.dispatch(traitTakeFoodRequest('$A'));

      expect(selectGame().food).equal(0);
      expect(selectAnimal(User1, 0).getFood(), 'Animal#0.traits').equal(1);
      expect(selectAnimal(User1, 1).getFood(), 'Animal#0.traits').equal(1);
      expect(selectAnimal(User1, 2).getFood(), 'Animal#0.traits').equal(0);
    });
  });

  describe('Death:', () => {
    it('Dies from carnivore', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 1
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
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 1
players:
  -
  - hand: 2 CardCooperation
    continent: $A, $B carn, $C
`);
      const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      replaceGetRandom(() => 2, () => {
        clientStore0.dispatch(gameEndTurnRequest());
        clientStore1.dispatch(gameDeployTraitRequest(
          selectCard(User1, 0).id
          , '$A', false, '$B'
        ));
        clientStore1.dispatch(gameDeployTraitRequest(
          selectCard(User1, 0).id
          , '$B', false, '$C'
        ));
      });

      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(1);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(3);
      expect(selectAnimal(User1, 2).traits, 'Animal#2.traits').size(1);

      clientStore0.dispatch(gameEndTurnRequest())

      // FEEDING 0
      expect(selectGame().food).equal(4);

      clientStore1.dispatch(traitTakeFoodRequest('$A'));

      expect(selectGame().food).equal(1);
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(gameEndTurnRequest());

      expect(selectGame().getPlayer(User1).continent).size(2);
      expect(selectAnimal(User1, 0).traits, 'Animal#0.traits').size(0);
      expect(selectAnimal(User1, 1).traits, 'Animal#1.traits').size(0);
    });
  });
});