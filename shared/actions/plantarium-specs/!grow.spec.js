import logger from '../../../shared/utils/logger';
import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';

import {
  traitTakeFoodRequest,
  gameEndTurnRequest, traitActivateRequest, gamePlantAttackRequest
} from '../actions';
import {makeGameSelectors, makeClientGameSelectors} from '../../selectors'

describe('[PLANTARIUM] Grow Phase:', function () {
  describe('Base grow', function () {
    it('food = 0', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
plants: PlantEphemeral $eph\
  , PlantPerennial $per\
  , PlantLegume $leg\
  , PlantGrass $gra\
  , PlantFruits $fru\
  , PlantSucculent $suc\
  , PlantLiana $lia\
  , PlantFungus $fun\
  , PlantCarnivorous $car
phase: feeding
deck: 5 camo
players:
  - hand: 1 camo
  - hand: 1 camo
`);
      const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      const {findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().plants).size(9);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(1);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);
      expect(findPlant('$eph'), '$eph').ok;
      expect(findPlant('$eph').getFood(), '$eph.getFood()').equal(1);
      expect(findPlant('$per'), '$per').not.ok;
      expect(findPlant('$leg'), '$leg').not.ok;
      expect(findPlant('$gra'), '$gra').not.ok;
      expect(findPlant('$fru'), '$fru').not.ok;
      expect(findPlant('$suc'), '$suc').not.ok;
      expect(findPlant('$lia'), '$lia').not.ok;
      expect(findPlant('$fun'), '$fun').not.ok;
      expect(findPlant('$car'), '$car').not.ok;
      expect(findPlant0('$eph'), '$eph').ok;
      expect(findPlant0('$eph').getFood(), '$eph.getFood()').equal(1);
      expect(findPlant0('$per'), '$per').not.ok;
      expect(findPlant0('$leg'), '$leg').not.ok;
      expect(findPlant0('$gra'), '$gra').not.ok;
      expect(findPlant0('$fru'), '$fru').not.ok;
      expect(findPlant0('$suc'), '$suc').not.ok;
      expect(findPlant0('$lia'), '$lia').not.ok;
      expect(findPlant0('$fun'), '$fun').not.ok;
      expect(findPlant0('$car'), '$car').not.ok;
    });

    it('food = 1', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const {findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
plants: PlantEphemeral $eph +\
  , PlantPerennial $per +\
  , PlantLegume $leg +\
  , PlantGrass $gra +\
  , PlantFruits $fru +\
  , PlantSucculent $suc +\
  , PlantLiana $lia +\
  , PlantFungus $fun +\
  , PlantCarnivorous $car +
phase: feeding
deck: 5 camo
players:
  - hand: 1 camo
  - hand: 1 camo
`);
      const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().plants).size(9);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(1);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);
      expect(findPlant('$eph'), '$eph').ok;
      expect(findPlant('$eph').getFood(), '$eph.getFood()').equal(2);
      expect(findPlant('$per'), '$per').ok;
      expect(findPlant('$per').getFood(), '$per.getFood()').equal(2);
      expect(findPlant('$leg'), '$leg').ok;
      expect(findPlant('$leg').getFood(), '$leg.getFood()').equal(3);
      expect(findPlant('$gra'), '$gra').ok;
      expect(findPlant('$gra').getFood(), '$gra.getFood()').equal(2);
      expect(findPlant('$fru'), '$fru').ok;
      expect(findPlant('$fru').getFood(), '$fru.getFood()').equal(5);
      expect(findPlant('$suc'), '$suc').ok;
      expect(findPlant('$suc').getFood(), '$suc.getFood()').equal(2);
      expect(findPlant('$lia'), '$lia').ok;
      expect(findPlant('$lia').getFood(), '$lia.getFood()').equal(6);
      expect(findPlant('$fun'), '$fun').ok;
      expect(findPlant('$fun').getFood(), '$fun.getFood()').equal(1);
      expect(findPlant('$car'), '$car').ok;
      expect(findPlant('$car').getFood(), '$car.getFood()').equal(1);

      expect(findPlant0('$eph'), '$eph').ok;
      expect(findPlant0('$eph').getFood(), '$eph.getFood()').equal(2);
      expect(findPlant0('$per'), '$per').ok;
      expect(findPlant0('$per').getFood(), '$per.getFood()').equal(2);
      expect(findPlant0('$leg'), '$leg').ok;
      expect(findPlant0('$leg').getFood(), '$leg.getFood()').equal(3);
      expect(findPlant0('$gra'), '$gra').ok;
      expect(findPlant0('$gra').getFood(), '$gra.getFood()').equal(2);
      expect(findPlant0('$fru'), '$fru').ok;
      expect(findPlant0('$fru').getFood(), '$fru.getFood()').equal(5);
      expect(findPlant0('$suc'), '$suc').ok;
      expect(findPlant0('$suc').getFood(), '$suc.getFood()').equal(2);
      expect(findPlant0('$lia'), '$lia').ok;
      expect(findPlant0('$lia').getFood(), '$lia.getFood()').equal(6);
      expect(findPlant0('$fun'), '$fun').ok;
      expect(findPlant0('$fun').getFood(), '$fun.getFood()').equal(1);
      expect(findPlant0('$car'), '$car').ok;
      expect(findPlant0('$car').getFood(), '$car.getFood()').equal(1);
    });

    it('food = 2', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
plants: PlantEphemeral $eph ++\
  , PlantPerennial $per ++\
  , PlantLegume $leg ++\
  , PlantGrass $gra ++\
  , PlantFruits $fru ++\
  , PlantSucculent $suc ++\
  , PlantLiana $lia ++\
  , PlantFungus $fun ++\
  , PlantCarnivorous $car ++
phase: feeding
deck: 5 camo
players:
  - hand: 1 camo
  - hand: 1 camo
`);
      const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      const {findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().plants).size(9);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(1);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);
      expect(findPlant('$eph'), '$eph').ok;
      expect(findPlant('$eph').getFood(), '$eph.getFood()').equal(3);
      expect(findPlant('$per'), '$per').ok;
      expect(findPlant('$per').getFood(), '$per.getFood()').equal(3);
      expect(findPlant('$leg'), '$leg').ok;
      expect(findPlant('$leg').getFood(), '$leg.getFood()').equal(4);
      expect(findPlant('$gra'), '$gra').ok;
      expect(findPlant('$gra').getFood(), '$gra.getFood()').equal(3);
      expect(findPlant('$fru'), '$fru').ok;
      expect(findPlant('$fru').getFood(), '$fru.getFood()').equal(4);
      expect(findPlant('$suc'), '$suc').ok;
      expect(findPlant('$suc').getFood(), '$suc.getFood()').equal(3);
      expect(findPlant('$lia'), '$lia').ok;
      expect(findPlant('$lia').getFood(), '$lia.getFood()').equal(6);
      expect(findPlant('$fun'), '$fun').ok;
      expect(findPlant('$fun').getFood(), '$fun.getFood()').equal(2);
      expect(findPlant('$car'), '$car').ok;
      expect(findPlant('$car').getFood(), '$car.getFood()').equal(2);

      expect(findPlant0('$eph'), '$eph').ok;
      expect(findPlant0('$eph').getFood(), '$eph.getFood()').equal(3);
      expect(findPlant0('$per'), '$per').ok;
      expect(findPlant0('$per').getFood(), '$per.getFood()').equal(3);
      expect(findPlant0('$leg'), '$leg').ok;
      expect(findPlant0('$leg').getFood(), '$leg.getFood()').equal(4);
      expect(findPlant0('$gra'), '$gra').ok;
      expect(findPlant0('$gra').getFood(), '$gra.getFood()').equal(3);
      expect(findPlant0('$fru'), '$fru').ok;
      expect(findPlant0('$fru').getFood(), '$fru.getFood()').equal(4);
      expect(findPlant0('$suc'), '$suc').ok;
      expect(findPlant0('$suc').getFood(), '$suc.getFood()').equal(3);
      expect(findPlant0('$lia'), '$lia').ok;
      expect(findPlant0('$lia').getFood(), '$lia.getFood()').equal(6);
      expect(findPlant0('$fun'), '$fun').ok;
      expect(findPlant0('$fun').getFood(), '$fun.getFood()').equal(2);
      expect(findPlant0('$car'), '$car').ok;
      expect(findPlant0('$car').getFood(), '$car.getFood()').equal(2);
    });
  });

  describe('Advanced grow', function () {
    it('Fungus grow', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
plants: PlantFungus $fun
phase: feeding
deck: 5 camo
players:
  - hand: 1 camo
    continent: $A carn, $B pois, $C para, $D wait +
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectGame().status.turn, 'turn').equal(0);

      expect(selectGame().status.round, 'round 0').equal(0);
      expect(findPlant('$fun').getFood(), '$fun.getFood() at start').equals(0);
      expect(findAnimal('$A').getFood(), '$A.getFood() at start').equals(0);
      expect(findAnimal('$C').getFood(), '$C.getFood() at start').equals(0);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
      expect(findPlant('$fun').getFood(), '$fun.getFood() after attack').equals(1);
      expect(findAnimal('$A').getFood(), '$A.getFood() after attack').equals(2);
      expect(findAnimal('$C').getFood(), '$C.getFood() after attack').equals(0);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.round, 'round 1').equal(1);
      expect(findAnimal('$A').getFood(), '$A.getFood() after default turn').equals(2);
      expect(findAnimal('$C').getFood(), '$C.getFood() after default turn').equals(0);
      expect(findPlant('$fun').getFood(), '$fun.getFood() at the start of round 1').equals(1);
      clientStore0.dispatch(gameEndTurnRequest());
      expect(findAnimal('$A').getFood(), '$A.getFood() after default turn').equals(2);
      expect(findAnimal('$C').getFood(), '$C.getFood() after default turn').equals(1);
      expect(findPlant('$fun').getFood(), '$fun.getFood() after default turn').equals(0);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.round, 'round 2').equal(2);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn 1').equal(1);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);

      expect(findPlant('$fun')).ok;
      expect(findPlant('$fun').getFood(), '$fun.getFood() at the start of turn 1').equals(2);
    });
  });

  describe('After turn grow', function() {
    it('Spawns new plants after turn', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: prepare
deckPlants: PlantEphemeral, PlantPerennial, PlantLegume, PlantGrass,\
PlantFruits, PlantSucculent, PlantLiana, PlantFungus, PlantCarnivorous
deck: camo, pois
players:
  - hand: 1 camo
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);

      expect(selectGame().plants, 'plants').size(3);
      expect(selectGame().deckPlants, 'deckPlants').size(6);

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.FEEDING);

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(1);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);

      expect(selectGame().plants, 'plants').size(4);
      expect(selectGame().deckPlants, 'deckPlants').size(5);
    });

    it(`Doesn't throw error if the deck is too small`, () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: prepare
deckPlants: PlantEphemeral, PlantPerennial
deck: camo, pois
players:
  - hand: 1 camo
`);
      const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);

      expect(selectGame().plants, 'plants').size(2);
      expect(selectGame().deckPlants, 'deckPlants').size(0);

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.FEEDING);

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(1);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);

      expect(selectGame().plants, 'plants').size(2);
      expect(selectGame().deckPlants, 'deckPlants').size(0);
    });

    it(`Reuses discard pile`, () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: prepare
deckPlants: 3 PlantCarn
plants: PlantPer $per
deck: camo, pois, camo, pois, camo, pois, camo, pois, camo, pois, camo, pois, camo, pois, camo, pois, camo, pois
players:
  - hand: 1 camo
    continent: $A pois, $B pois, $C pois, $D pois +
`);
      const {selectGame, findAnimal, findPlant, findPlayerByIndex} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);

      expect(selectGame().plants, 'plants').size(4);
      expect(selectGame().deckPlants, 'deckPlants').size(0);

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.turn, 'turn').equal(0);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.FEEDING);

      const [plantPer, plantCarn1, plantCarn2, plantCarn3] = selectGame().plants.keySeq().toJS();

      logger.verbose(`Plants are: ${[plantPer, plantCarn1, plantCarn2, plantCarn3]}`);

      clientStore0.dispatch(gamePlantAttackRequest(plantCarn1, '$A'));

      expect(findAnimal('$A')).null;


      // console.log(findPlant(plantCarn1))
      clientStore0.dispatch(gamePlantAttackRequest(plantCarn2, '$B'));
      expect(findAnimal('$B')).null;

      clientStore0.dispatch(traitTakeFoodRequest('$C', plantCarn3));
      expect(findAnimal('$C')).null;

      expect(selectGame().status.turn, 'turn 1').equal(1);
      expect(selectGame().status.round, 'round').equal(0);
      expect(selectGame().status.phase, 'phase').equal(PHASE.DEPLOY);

      expect(selectGame().plants, 'plants').size(4);
      // expect(selectGame().deckPlants, 'deckPlants').size(5);
    });
  })
});
















