import logger from '../../../shared/utils/logger';

import {makeGameSelectors} from '../../selectors'
import {traitAmbushActivateRequest, traitAnswerRequest, traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";
import * as tt from "../../models/game/evolution/traitTypes";
import {TRAIT_ANIMAL_FLAG} from "../../models/game/evolution/constants";

describe('[PLANTARIUM] PlantCarnivorous:', function () {
  describe('[PLANTARIUM] Deploy:', function () {
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
      clientStore0.dispatch(traitTakeFoodRequest('$B', '$car'));
      expect(findAnimal('$B'), '$B is ok').ok;
      expect(findAnimal('$B').getFood(), '$B.food').equals(1);
      expect(findPlant('$car').getFood(), '$car.food').equals(1);
    });

    describe.skip('Anglerfish:', function () {
      it(`Anglerfish simple`, () => {
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
      });
    });


    it.skip(`ambush of anglerfish`, () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $car ++
players:
  - continent: $A angler, $W wait
  - continent: $B amb carn
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));
      clientStore1.dispatch(traitAmbushActivateRequest('$B'));
      expect(findAnimal('$A'), '$A dead').null;
      clientStore0.dispatch(gameEndTurnRequest());
      expect(findAnimal('$B'), '$B alive').ok;
      expect(findAnimal('$B').getFood(), '$B.food').equals(0);
      clientStore0.dispatch(traitTakeFoodRequest('$B', '$car'));
      expect(findAnimal('$B'), '$B is ok').ok;
      expect(findAnimal('$B').getFood(), '$B.food').equals(1);
      expect(findPlant('$car').getFood(), '$car.food').equals(1);
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

      it(`Dynamic defense`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: PlantCarn $car ++
  players:
    - continent: $A run cnid , $W wait
  `);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));

        expect(selectGame().question, 'question').null;
        expect(findAnimal('$A'), '$A dead').null;
      });

      it(`Dynamic defense with intellect`, () => {
        const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
        const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: PlantCarn $car ++
  players:
    - continent: $A run mimi, $B, $W camo wait
  `);
        const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

        clientStore0.dispatch(traitTakeFoodRequest('$A', '$car'));

        expect(selectGame().question, 'question').null;
        expect(findAnimal('$A'), '$A alive').ok;
        expect(findAnimal('$B'), '$B dead').null;

        expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
        expect(findPlant('$car').getFood(), '$car.getFood()').equal(1);
      });
    });
  });

  describe('attackWithPlantRequest', function () {
//     it(`simple`, () => {
//       const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
//       const gameId = ParseGame(`
// settings:
//   addon_plantarium: true
// phase: feeding
// plants: PlantCarn $car ++
// players:
//   - continent: $A, $B, $W wait
// `);
//       const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
  });
});
