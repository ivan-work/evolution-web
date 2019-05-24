import logger from '../../../shared/utils/logger';

import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";

describe('[PLANTARIUM] PlantTraitTree:', function () {
  it(`getErrorOfFoodIntake`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantEphemeral $eph tree +++++
players:
  - continent: $A wait, $B flight, $C mass
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged(`$A can't take food from aquatic`, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$eph'));
    }, serverStore, clientStore0);
    expect(findPlant('$eph').getFood(), '$eph.food').equals(5);
    clientStore0.dispatch(traitTakeFoodRequest('$B', '$eph'));
    clientStore0.dispatch(gameEndTurnRequest());
    expect(findPlant('$eph').getFood(), '$eph.food').equals(4);
    clientStore0.dispatch(traitTakeFoodRequest('$C', '$eph'));
    expect(findAnimal('$A').getFood(), '$A.food').equals(0);
    expect(findAnimal('$B').getFood(), '$B.food').equals(1);
    expect(findAnimal('$C').getFood(), '$B.food').equals(1);
    expect(findPlant('$eph').getFood(), '$eph.food').equals(3);
  });

  it(`getCoverSlots`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: succ $suc tree +++
players:
  - continent: $A wait, $B flight, $C mass
`);
    const {selectGame, findPlantTrait, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    expect(findPlant('$suc').getFood(), '$suc.food').equals(3);
    expect(findPlantTrait('$suc', ptt.PlantTraitTree).getCovers(), '$suc.trait.covers').equals(1);
  });
});
















