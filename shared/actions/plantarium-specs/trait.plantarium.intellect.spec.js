import logger from '../../../shared/utils/logger';

import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";
import ERRORS from "../errors";
import {TRAIT_ANIMAL_FLAG} from "../../models/game/evolution/constants";

describe('[PLANTARIUM] TraitIntellect:', function () {
  it(`TraitIntellect`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: succ $suc tree +++, succ aqua $aqua +++
players:
  - continent: $A int para, $W wait
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    expect(findAnimal('$A').getFood(), '$A.food').equals(0);
    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    expect(findAnimal('$A').getFood(), '$A.food').equals(1);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(findAnimal('$A').getFood(), '$A.food').equals(1);

    expectError(`Can't reuse intellect`, ERRORS.PLANT_FOOD_NO_ACCESS, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$aqua'));
    });
    expect(findAnimal('$A').getFood(), '$A.food after error').equals(1);
    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    expect(findAnimal('$A').getFood(), '$A.food').equals(2);
  });

  it(`TraitIntellect + Officinalis`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: succ $suc offic +++, succ aqua $aqua +++
players:
  - continent: $A int para, $W wait
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    expect(findAnimal('$A').getFood(), '$A.food').equals(1);
    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED), '$A is not paralyzed').equals(false);
  });

  it(`TraitIntellect vs Defence + Officinalis`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: succ $suc tree offic +++, succ aqua $aqua +++
players:
  - continent: $A int para, $W wait
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    expect(findAnimal('$A').getFood(), '$A.food').equals(1);
    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED), '$A is paralyzed').equals(true);
  });
});
















