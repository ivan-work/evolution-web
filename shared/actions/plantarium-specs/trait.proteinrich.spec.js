import logger from '../../../shared/utils/logger';

import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";

describe('[PLANTARIUM] PlantTraitProteinRich:', function () {
  it(`Allows to take 2 food`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantGrass $gra protein ++
players:
  - continent: $A carn mass para, $W wait
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$gra'));

    expect(findAnimal('$A').getFood()).equal(2);
  });
});
















