import logger from '../../../shared/utils/logger';

import * as tt from '../../models/game/evolution/traitTypes';
import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";
import {replaceGetRandom} from "../../utils/randomGenerator";
import {TRAIT_ANIMAL_FLAG} from "../../models/game/evolution/constants";

describe('[PLANTARIUM] PlantTraitOfficinalis:', function () {
  it(`Paralyzes`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantFungus $fun offic +++
players:
  - continent: $A carn, $W wait
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(findPlant('$fun').getFood(), 'Food before intake').equal(3);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$fun'));

    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    expect(findTrait('$A', tt.TraitCarnivorous).disabled, '$A.TraitCarnivorous is disabled').true;
    expect(findAnimal('$A').getWantedFood(), `$A is full and disabled`).equal(0);
    expect(findPlant('$fun').getFood(), 'Food after intake').equal(2);
  });
});
















