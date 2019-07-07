import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {traitActivateRequest, traitAmbushActivateRequest, traitAnswerRequest, traitTakeFoodRequest} from "../trait";
import * as tt from "../../models/game/evolution/traitTypes";
import {gameEndTurnRequest} from "../game";
import {TRAIT_ANIMAL_FLAG} from "../../models/game/evolution/constants";

describe('Game (HUNT):', function () {
  describe('Straight attack:', function () {
    it('Att', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
deck: 10 camo
players:
  - continent: $A0 carn, $W0 wait
  - continent: $A1 carn, $W1 wait
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);
      clientStore0.dispatch(traitActivateRequest('$A0', tt.TraitCarnivorous, '$A1'));
      expect(selectPlayer0().acted, 'User0 acted').true;
      expect(findAnimal('$A0').getFood(), '$A0.getFood()').equal(2);
      expect(findAnimal('$A1'), '$A1 dead').null;

      expect(selectGame().hunts.size, 'No hunts left').equal(0);
    });

    it('Att > Def', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
deck: 10 camo
players:
  - continent: $A0 carn, $B0 carn, $C0 carn, $W0 wait
  - continent: $A1 shell, $B1 mimi, $B1m, $C1 tail fat
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      clientStore0.dispatch(traitActivateRequest('$A0', tt.TraitCarnivorous, '$A1'));
      expect(selectPlayer0().acted, 'User0 acted').false;
      expect(selectGame().question, 'question for shell').ok;

      clientStore1.dispatch(traitAnswerRequest(tt.TraitShell));
      expect(selectPlayer0().acted, 'User0 acted').true;
      expect(selectGame().hunts.size, 'No hunts left').equal(0);
      expect(findAnimal('$A0').getFood(), '$A0.getFood()').equal(0);
      expect(findAnimal('$A1'), '$A1 alive').ok;

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.round, 'round 1').equal(1);

      clientStore0.dispatch(traitActivateRequest('$B0', tt.TraitCarnivorous, '$B1'));
      expect(selectPlayer0().acted, 'User0 acted').false;
      expect(selectGame().question, 'question for mimi').ok;

      clientStore1.dispatch(traitAnswerRequest(tt.TraitMimicry, '$B1m'));
      expect(selectPlayer0().acted, 'User0 acted').true;
      expect(selectGame().hunts.size, 'No hunts left').equal(0);
      expect(findAnimal('$B0').getFood(), '$B0.getFood()').equal(2);
      expect(findAnimal('$B1'), '$B1 alive').ok;
      expect(findAnimal('$B1m'), '$B1m dead').null;

      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectGame().status.round, 'round 2').equal(2);

      clientStore0.dispatch(traitActivateRequest('$C0', tt.TraitCarnivorous, '$C1'));
      expect(selectPlayer0().acted, 'User0 acted').false;
      expect(selectGame().question, 'question for tailloss').ok;
      clientStore1.dispatch(traitAnswerRequest(true));
      expect(selectGame().question, 'question for tailloss').ok;
      clientStore1.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss));
      expect(selectGame().question, 'question for tailloss').not.ok;
      expect(selectGame().hunts.size, 'No hunts left').equal(0);
      expect(selectPlayer0().acted, 'User0 acted').true;
      // clientStore1.dispatch(traitAnswerRequest(tt.TraitTailLoss, '$B1m'));

      expect(findAnimal('$C0').getFood(), '$C0.getFood()').equal(1);
      expect(findAnimal('$C1'), '$C1 alive').ok;
    });

    it('Att > Int > Def', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
deck: 10 camo
players:
  - continent: $A0 carn int, $W0 wait
  - continent: $A1 cnid tail shell
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      clientStore0.dispatch(traitActivateRequest('$A0', tt.TraitCarnivorous, '$A1'));
      expect(selectPlayer0().acted, 'User0 acted').false;
      expect(selectGame().question, 'question intellect').ok;

      clientStore0.dispatch(traitAnswerRequest(tt.TraitIntellect, tt.TraitTailLoss));

      expect(selectPlayer0().acted, 'User0 acted').false;
      expect(selectGame().question, 'question defense').ok;

      clientStore1.dispatch(traitAnswerRequest(tt.TraitCnidocytes));

      expect(selectPlayer0().acted, 'User0 acted').false;
      expect(selectGame().question, 'question defense').ok;

      clientStore1.dispatch(traitAnswerRequest(tt.TraitShell));

      expect(selectGame().hunts.size, 'No hunts left').equal(0);
      expect(selectPlayer0().acted, 'User0 acted').true;
      expect(selectGame().question, 'question is not ok').not.ok;

      expect(findAnimal('$A0').getFood()).equal(0);
      expect(findAnimal('$A0').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).equal(true);
      expect(findAnimal('$A1')).ok;
    });
  });

  describe('Anglerfish attack:', function () {
    it('Att > Angler > Def', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
  phase: feeding
  deck: 10 camo
  players:
    - continent: $A0 carn int cnid tail shell, $W0 wait
    - continent: $A1 angler
  `);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      clientStore0.dispatch(traitActivateRequest('$A0', tt.TraitCarnivorous, '$A1'));
      expect(selectGame().hunts.size, 'Game hunts').equal(2);
      expect(selectPlayer0().acted, 'User0 acted').false;
      expect(selectGame().question, 'question intellect').ok;

      clientStore1.dispatch(traitAnswerRequest(tt.TraitIntellect, tt.TraitTailLoss));
      expect(selectGame().hunts.size, 'Game hunts').equal(2);
      expect(selectPlayer0().acted, 'User0 acted').false;

      clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
      expect(selectGame().hunts.size, 'Game hunts').equal(2);
      expect(selectPlayer0().acted, 'User0 acted').false;

      clientStore0.dispatch(traitAnswerRequest(tt.TraitShell));
      expect(selectGame().hunts.size, 'Game hunts').equal(0);
      expect(selectPlayer0().acted, 'User0 acted').true;

      expect(findAnimal('$A0')).ok;
      expect(findAnimal('$A1')).ok;

      expect(findAnimal('$A0').getFood()).equal(0);
      expect(findAnimal('$A1').getFood()).equal(0);

      expect(findAnimal('$A1').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).equal(true);
    });
  });

  describe('Ambush attack:', function () {
    it('Att > Amb2x > Def', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
  phase: feeding
  deck: 10 camo
  food: 1
  players:
    - continent: $A0 mimi, $B0, $C0, $W0 wait
    - continent: $B1 carn amb, $C1 carn amb
  `);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      clientStore0.dispatch(traitTakeFoodRequest('$A0'));

      clientStore1.dispatch(traitAmbushActivateRequest('$B1'));
      clientStore1.dispatch(traitAmbushActivateRequest('$C1'));


      clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$B0'));
      clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$C0'));

      expect(selectGame().hunts.size, 'Game hunts').equal(0);
      expect(selectPlayer0().acted, 'User0 acted').true;

      expect(findAnimal('$A0')).ok;
      expect(findAnimal('$B0')).null;
      expect(findAnimal('$C0')).null;
      expect(findAnimal('$B1')).ok;
      expect(findAnimal('$C1')).ok;

      expect(findAnimal('$A0').getFood()).equal(1);
      expect(findAnimal('$B1').getFood()).equal(2);
      expect(findAnimal('$C1').getFood()).equal(2);
    });
  });

  describe('Ambush+anglerfish attack:', function () {
    it('Att > Amb1x > Angler', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
deck: 10 camo
food: 1
players:
  - continent: $A0 angler, $W0 wait
  - continent: $B1 carn amb
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      clientStore0.dispatch(traitTakeFoodRequest('$A0'));

      clientStore1.dispatch(traitAmbushActivateRequest('$B1'));

      expect(selectGame().hunts.size, 'Game hunts').equal(0);
      expect(selectPlayer0().acted, 'User0 acted').true;

      expect(findAnimal('$A0')).ok;
      expect(findAnimal('$B1')).null;

      expect(selectGame().getFood()).equal(1);
      expect(findAnimal('$A0').getFood()).equal(2);
    });

    it('Att > Amb1x > Angler (tail)', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
deck: 10 camo
food: 1
players:
  - continent: $A0 angler, $W0 wait
  - continent: $B1 carn amb camo tail
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      clientStore0.dispatch(traitTakeFoodRequest('$A0'));

      clientStore1.dispatch(traitAmbushActivateRequest('$B1'));

      clientStore1.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss));

      expect(selectGame().hunts.size, 'Game hunts').equal(0);
      expect(selectPlayer0().acted, 'User0 acted').true;

      expect(findAnimal('$A0')).ok;
      expect(findAnimal('$B1')).ok;

      expect(selectGame().getFood()).equal(0);
      expect(findAnimal('$A0').getFood()).equal(2);
      expect(findAnimal('$B1').getFood()).equal(0);
    });

    it('Att > Amb2x > Angler', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
deck: 10 camo
food: 1
players:
  - continent: $A0, $B0 angler=true, $W0 wait
  - continent: $B1 carn amb, $C1 carn amb
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, selectPlayer1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      clientStore0.dispatch(traitTakeFoodRequest('$A0'));

      clientStore1.dispatch(traitAmbushActivateRequest('$B1'));
      clientStore1.dispatch(traitAmbushActivateRequest('$C1'));
      expect(selectGame().hunts.size, 'Game hunts').equal(0);
      expect(selectPlayer0().acted, 'User0 acted').true;

      expect(findAnimal('$A0')).null;
      expect(findAnimal('$B0')).ok;
      expect(findAnimal('$C0')).null;
      expect(findAnimal('$B1')).null;
      expect(findAnimal('$C1')).ok;

      expect(selectGame().getFood()).equal(1);
      expect(findAnimal('$B0').getFood()).equal(2);
      expect(findAnimal('$C1').getFood()).equal(2);
    });
  });
});