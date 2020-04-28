import {PHASE} from '../../models/game/GameModel';
import * as tt from "../../models/game/evolution/traitTypes";

import {
  traitTakeFoodRequest,
  gameEndTurnRequest
} from '../actions';
import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';
import ERRORS from "../errors";
import {traitActivateRequest} from "../trait";

describe('[PLANTARIUM] !food.spec.js:', function () {
  it('PHASE.PREPARE', () => {
    const [{ServerGame, ParseGame}, {ClientGame0}, {ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: prepare
deckPlants: fung, 2 eph
deck: 20 camo
`);
    expect(ServerGame().status.turn, 'turn').equal(0);
    expect(ServerGame().status.round, 'round').equal(0);
    expect(ServerGame().status.phase, 'phase').equal(PHASE.DEPLOY);
    expect(ClientGame0().getPlayer().hand).size(8);
    expect(ClientGame1().getPlayer().hand).size(8);

    expect(ServerGame().plants).size(3);
    expect(ServerGame().plants.valueSeq().get(0).getFood(), 'plant food (fun)').equal(1);
    expect(ServerGame().plants.valueSeq().get(1).getFood(), 'plant food (eph)').equal(2);
    expect(ServerGame().plants.valueSeq().get(2).getFood(), 'plant food (eph)').equal(2);
  });

  describe('PHASE.FEEDING', () => {
    it('Eating normally', () => {
      const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: fung $a +, fung $b ++
players:
  - continent: $A para, $B wait
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, findAnimal0, findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const {selectGame1, findAnimal1, findPlant1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

      expect(selectGame().getFood(), 'ServerGame().getFood()').equal(0);
      expect(selectGame().plants.get('$a'), 'ServerGame().plants[$a]').ok;
      expect(findPlant('$a').getFood(), '$a food before').equal(1);

      expectUnchanged(`Can't take food without plantId`, () => {
        clientStore0.dispatch(traitTakeFoodRequest('$A'));
      }, serverStore, clientStore0, clientStore1);

      clientStore0.dispatch(traitTakeFoodRequest('$A', '$a'));
      expect(selectGame().getFood(), 'ServerGame().getFood()').equal(0);

      expect(findAnimal('$A').getFood(), '$A food').equal(1);
      expect(findAnimal0('$A').getFood(), '$A food').equal(1);
      expect(findAnimal1('$A').getFood(), '$A food').equal(1);

      expect(findPlant('$a').getFood(), '$a food').equal(0);
      expect(findPlant0('$a').getFood(), '$a food').equal(0);
      expect(findPlant1('$a').getFood(), '$a food').equal(0);

      clientStore0.dispatch(gameEndTurnRequest());

      expectUnchanged(`Can't take food from empty plant`, () => {
        clientStore0.dispatch(traitTakeFoodRequest('$A', '$a'));
      }, serverStore, clientStore0, clientStore1);

      // clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    });

    it('Eating by skipping', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: fung $fun ++++
players:
  - continent: $A para wait
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, findAnimal0, findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);

      expect(selectGame().status.round, 'round 0').equal(0);
      expect(findPlant('$fun').getFood()).equal(4);
      expect(findAnimal('$A').getFood()).equal(0);
      clientStore0.dispatch(gameEndTurnRequest());
      expect(findPlant('$fun').getFood()).equal(3);
      expect(findAnimal('$A').getFood()).equal(1);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.round, 'round 1').equal(1);
    });

    it(`Carnivorous can't eat from grasslike plant`, () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: peren $per ++
players:
  - continent: $A carn wait
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      expectError(`Carnivorous can't eat from grasslike plant`, ERRORS.PLANT_FOOD_FRUIT, () => {
        clientStore0.dispatch(traitTakeFoodRequest('$A', '$per'));
      });
      expect(selectGame().status.round, 'round 0').equal(0);
      expect(findAnimal('$A').getFood()).equal(0);
    });

    it('Fungi eat dead regeneration', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: fung $fun +
players:
  - continent: $A carn, $B regen, $W wait
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'))
      expect(findPlant('$fun').getFood(), '$fun ate dead regen').equal(2);
    });
  });
});
















