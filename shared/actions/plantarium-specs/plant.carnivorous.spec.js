import logger from '../../../shared/utils/logger';

import {makeGameSelectors} from '../../selectors'
import {
  traitActivateRequest,
  traitAmbushActivateRequest,
  traitAmbushContinueRequest,
  traitTakeFoodRequest
} from "../trait";
import {gameEndTurnRequest} from "../game";
import * as tt from "../../models/game/evolution/traitTypes";
import {TRAIT_ANIMAL_FLAG} from "../../models/game/evolution/constants";
import {PHASE} from "../../models/game/GameModel";
import {gamePlantAttackRequest} from "../game.plantarium";

describe('[PLANTARIUM] PlantCarnivorous:', function () {
  describe('Deploy:', function () {
    it(`parse`, () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: deploy
plants: PlantCarn $car ++
`);
      const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      expect(findPlant('$car').getTraits()).size(0);
      expect(findPlant('$car').traits).size(2);
    });
  });

  describe('takeFoodRequest:', function () {
    it(`simple`, () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A, $B, $W wait
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
      expect(findAnimal('$A'), '$A dead').null;
      clientStore0.dispatch(gameEndTurnRequest());
      expect(findAnimal('$B'), '$B alive').ok;
      expect(findAnimal('$B').getFood(), '$B.food').equals(0);
      expect(findPlant('$car').getFood(), '$car.food').equals(4);
      clientStore0.dispatch(traitTakeFoodRequest('$B', '$car'));
      expect(findAnimal('$B'), '$B is ok').ok;
      expect(findAnimal('$B').getFood(), '$B.food').equals(1);
      expect(findPlant('$car').getFood(), '$car.food').equals(3);
    });

    describe('Anglerfish:', function () {
      it(`Anglerfish takes food by itself`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A angler, $W wait
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        expect(findAnimal('$A'), '$A alive').ok;
        expect(findAnimal('$A').getFood(), '$A.food').equals(1);
        expect(findPlant('$car').getFood(), '$car.food').equals(1);
        expect(selectGame().hunts, 'no hunts leftover').size(0)
      });

      it(`Anglerfish defends animal who takes food`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A, $B angler=true, $W wait
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        expect(findAnimal('$A'), '$A alive').ok;
        expect(findAnimal('$B'), '$B alive').ok;
        expect(findAnimal('$A').getFood(), '$A.food').equals(1);
        expect(findAnimal('$B').getFood(), '$B.food').equals(1);
        expect(findPlant('$car').getFood(), '$car.food').equals(0);
        expect(selectGame().hunts, 'Game.hunts').size(0)
      });

      it(`Anglerfish denies animal of getting the food`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car +
players:
  - continent: $A, $B angler=true, $W wait
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        expect(findAnimal('$A'), '$A alive').ok;
        expect(findAnimal('$B'), '$B alive').ok;
        expect(findAnimal('$A').getFood(), '$A.food').equals(1);
        expect(findAnimal('$B').getFood(), '$B.food').equals(0);
        expect(findPlant('$car').getFood(), '$car.food').equals(0);
        expect(selectGame().hunts, 'Game.hunts').size(0)
      });
    });

    describe('Ambush:', function () {
      it(`Simple ambush`, () => {
        const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A, $W wait
  - continent: $B amb carn
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));

        // clientStore1.dispatch(traitAmbushActivateRequest('$B'));

        expect(findAnimal('$A'), '$A dead').null;
        expect(findAnimal('$B'), '$B alive').ok;
        expect(selectGame().status.phase).equal(PHASE.FEEDING);
        expect(selectGame().hunts, 'Game.hunts').size(0)
      });

      it(`Defence ambush`, () => {
        const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A swim camo, $W wait
  - continent: $B amb carn swim sharp
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        clientStore1.dispatch(traitAmbushActivateRequest('$B'));
        expect(findAnimal('$A'), '$A dead').null;
        expect(findAnimal('$B'), '$B alive').ok;
        expect(findAnimal('$B').getFood(), '$B.food').equals(2);
        expect(findPlant('$car').getFood(), '$car.food').equals(2);
        expect(selectGame().hunts, 'Game.hunts').size(0)
      });

      it(`ambush of anglerfish`, () => {
        const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $Ax angler, $W wait
  - continent: $B amb carn
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$Ax', '$car'));
        clientStore1.dispatch(traitAmbushActivateRequest('$B'));
        expect(findAnimal('$Ax'), '$Ax dead').null;
        expect(findAnimal('$B'), '$B alive').ok;
        expect(findAnimal('$B').getFood(), '$B.food').equals(2);
        expect(findPlant('$car').getFood(), '$car.food').equals(2);
        expect(selectGame().hunts, 'Game.hunts').size(0)
      });

      it(`ambush of defense anglerfish`, () => {
        const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A, $B angler=true, $W wait
  - continent: $C amb carn
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        clientStore1.dispatch(traitAmbushContinueRequest());
        clientStore1.dispatch(traitAmbushActivateRequest('$C'));
        expect(selectGame().hunts, 'Game.hunts').size(0);
        expect(findAnimal('$A'), '$A alive').ok;
        expect(findAnimal('$B'), '$B dead').null;
        expect(findAnimal('$C'), '$C alive').ok;
        expect(findAnimal('$A').getFood(), '$A.food').equals(1);
        expect(findAnimal('$C').getFood(), '$C.food').equals(2);
        expect(findPlant('$car').getFood(), '$car.food').equals(1);
      });

      it(`skipping ambush of defense anglerfish`, () => {
        const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
        const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A, $B angler=true, $W wait
  - continent: $C amb carn
`);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        clientStore1.dispatch(traitAmbushContinueRequest());
        clientStore1.dispatch(traitAmbushContinueRequest());
        expect(selectGame().hunts, 'Game.hunts').size(0)
        expect(findAnimal('$A'), '$A alive').ok;
        expect(findAnimal('$B'), '$B alive').ok;
        expect(findAnimal('$C'), '$C alive').ok;
        expect(findAnimal('$A').getFood(), '$A.food').equals(1);
        expect(findAnimal('$B').getFood(), '$B.food').equals(1);
        expect(findAnimal('$C').getFood(), '$C.food').equals(0);
        expect(findPlant('$car').getFood(), '$car.food').equals(0);
      });
    });

    describe('Counterattack Intellect:', function () {
      it(`Static defense`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: PlantCarn $car ++
  players:
    - continent: $A camo, $W wait
  `);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        expect(findAnimal('$A'), '$A dead').null;
      });

      it(`Cnidocytes`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: PlantCarn $car ++
  players:
    - continent: $A camo cnid, $W wait
  `);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
        expect(findAnimal('$A'), '$A dead').null;
        expect(findPlant('$car').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).false
      });

      it(`Counterattack ignores 1 property`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: PlantCarn $car ++
  players:
    - continent: $A shell cnid , $W wait
  `);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));

        expect(selectGame().question, 'question').null;
        expect(findAnimal('$A'), '$A dead').null;
      });

      it(`Counterattack ignores several properties`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: PlantCarn $car ++
  players:
    - continent: $A shell mimi, $B, $W camo wait
  `);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));

        expect(selectGame().question, 'question').null;
        expect(findAnimal('$A'), '$A alive').ok;
        expect(findAnimal('$B'), '$B dead').null;

        expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
        expect(findPlant('$car').getFood(), '$car.getFood()').equal(3);
      });
    });
  });

  describe('gamePlantAttackRequest', function () {
    it(`orders attack`, () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $carA ++, PlantCarn $carB
players:
  - continent: $A, $C, $E, $0w wait
  - continent: $B, $D, $camo camo, $1w wait
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      expectUnchanged(``, () => {
        clientStore0.dispatch(gamePlantAttackRequest('$carA', '$camo'));
        clientStore0.dispatch(gamePlantAttackRequest('$carB', '$camo'));
      }, serverStore, clientStore0, clientStore1);

      clientStore0.dispatch(traitActivateRequest('$0w', tt.TraitWaiter));
      clientStore0.dispatch(gamePlantAttackRequest('$carA', '$A'));
      expect(findAnimal('$A'), '$A dead').null;
      expect(findAnimal('$B'), '$B alive').ok;
      expect(findPlant('$carA').getFood(), '$carA.getFood()').equal(4);
      expect(selectGame().status.round, 'round 0').equal(0);
      expectUnchanged(``, () => {
        clientStore0.dispatch(gamePlantAttackRequest('$carA', '$B'));
        clientStore0.dispatch(gamePlantAttackRequest('$carB', '$A'));
        clientStore0.dispatch(gamePlantAttackRequest('$carB', '$B'));
      }, serverStore, clientStore0, clientStore1);
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore1.dispatch(traitActivateRequest('$1w', tt.TraitWaiter));
      expectUnchanged(``, () => {
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$A'));
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$B'));
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$C'));
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$D'));
      }, serverStore, clientStore0, clientStore1);

      clientStore1.dispatch(gamePlantAttackRequest('$carB', '$C'));

      expectUnchanged(``, () => {
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$A'));
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$B'));
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$C'));
        clientStore1.dispatch(gamePlantAttackRequest('$carA', '$D'));
        clientStore1.dispatch(gamePlantAttackRequest('$carB', '$A'));
        clientStore1.dispatch(gamePlantAttackRequest('$carB', '$B'));
        clientStore1.dispatch(gamePlantAttackRequest('$carB', '$C'));
        clientStore1.dispatch(gamePlantAttackRequest('$carB', '$D'));
        clientStore1.dispatch(traitTakeFoodRequest('$B', '$carA'));
        clientStore1.dispatch(traitTakeFoodRequest('$B', '$carB'));
      }, serverStore, clientStore0, clientStore1);
      expect(findAnimal('$A'), '$A dead').null;
      expect(findAnimal('$C'), '$B dead').null;
      expect(findPlant('$carB').getFood(), '$carB.getFood()').equal(2);
      clientStore1.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(traitTakeFoodRequest('$E', '$carA'));
      expect(findAnimal('$E'), '$E alive').ok;
      expect(findAnimal('$E').getFood(), '$E.getFood()').equal(1);
      expect(findPlant('$carA').getFood(), '$carA.getFood()').equal(3);
      expect(findPlant('$carB').getFood(), '$carB.getFood()').equal(2);
      expectUnchanged(``, () => {
        clientStore0.dispatch(gamePlantAttackRequest('$carA', '$A'));
        clientStore0.dispatch(gamePlantAttackRequest('$carA', '$B'));
        clientStore0.dispatch(gamePlantAttackRequest('$carA', '$C'));
        clientStore0.dispatch(gamePlantAttackRequest('$carA', '$D'));
        clientStore0.dispatch(gamePlantAttackRequest('$carB', '$A'));
        clientStore0.dispatch(gamePlantAttackRequest('$carB', '$B'));
        clientStore0.dispatch(gamePlantAttackRequest('$carB', '$C'));
        clientStore0.dispatch(gamePlantAttackRequest('$carB', '$D'));
        clientStore0.dispatch(traitTakeFoodRequest('$e', '$carA'));
        clientStore0.dispatch(traitTakeFoodRequest('$e', '$carB'));
      }, serverStore, clientStore0, clientStore1);
    });

    it(`can eat flight`, () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $carA ++, PlantCarn $carB
players:
  - continent: $A flight, $0w wait
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(gamePlantAttackRequest('$carA', '$A'));

      expect(findAnimal('$A'), '$A dead').null;
      expect(findPlant('$carA').getFood(), '$carA.getFood()').equal(4);
    });

    it(`Dies from poisonous`, () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 1 camo
deckPlants: 4 eph
phase: feeding
plants: PlantCarn $carA ++, PlantCarn $carB
players:
  - continent: $A pois +, $0w wait +
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(gamePlantAttackRequest('$carA', '$A'));

      expect(findPlant('$carA').hasFlag(TRAIT_ANIMAL_FLAG.POISONED)).true;

      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(gameEndTurnRequest());

      expect(findPlant('$carA'), '$carA should be dead').undefined;
    });
  });
});
