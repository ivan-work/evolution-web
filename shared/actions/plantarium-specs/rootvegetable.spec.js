import logger from '../../../shared/utils/logger';

import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";

describe('[PLANTARIUM] PlantTraitRootVegetable:', function () {
  it(`getErrorOfFoodIntake`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantEphemeral $eph rootv +++
players:
  - continent: $A wait, $B burr
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged(`$A can't take food from aquatic`, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$eph'));
    }, serverStore, clientStore0);
    clientStore0.dispatch(traitTakeFoodRequest('$B', '$eph'));
    expect(findAnimal('$A').getFood(), '$A.food').equals(0);
    expect(findAnimal('$B').getFood(), '$B.food').equals(1);
    expect(findPlant('$eph').getFood(), '$eph.food').equals(2);
  });
});
















