import logger from '../../../shared/utils/logger';

import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";

describe.skip('[PLANTARIUM] TraitIntellect:', function () {
  it(`TraitCooperation`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: succ $suc tree +++
players:
  - continent: $A mass coop$B coop$C, $B , $C mass, $W wait +
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.round, 'round 1').equal(1);
    expect(findPlant('$suc').getFood(), '$suc.food').equals(1);
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(0);
    expect(findAnimal('$C').getFood(), '$C.getFood()').equal(1);
  });

  describe('[PLANTARIUM] Base changes:', function () {
  });
});
















