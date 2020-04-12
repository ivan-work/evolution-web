import logger from '../../../shared/utils/logger';

import * as tt from '../../models/game/evolution/traitTypes';
import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {server$autoFoodSharing, traitActivateRequest, traitTakeFoodRequest} from "../trait";
import {gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import ERRORS from "../errors";

describe('[PLANTARIUM] Trait changes:', function () {
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

  it('[PLANTARIUM] TraitGrazing:', function () {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: succ $suc tree ++++++
  players:
    - continent: $A mass coop$B coop$C plantgraz, $B plantgraz, $C mass plantgraz, $W wait +
  `);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));

    expectError(`Too early to graze`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    });

    expect(selectGame().status.round, 'round 0').equal(0);
    expect(findPlant('$suc').getFood(), '$suc.food').equals(4);
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(0);
    expect(findAnimal('$C').getFood(), '$C.getFood()').equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPlantGrazing));

    expectError(`Too early to graze`, ERRORS.TRAIT_ACTION_NO_VALUE, () => {
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitPlantGrazing))
    });

    clientStore0.dispatch(traitActivateRequest('$C', tt.TraitPlantGrazing));

    expect(findPlant('$suc').getFood(), '$suc.food').equals(2);
  });

  it('[PLANTARIUM] #bug TraitGrazing with communication', function () {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: succ $suc ++++
  players:
    - continent: $A graz comm$B plantgraz, $B plantgraz wait
  `);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));


    expect(selectGame().status.round, 'round 0').equal(0);
    expect(findPlant('$suc').getFood(), '$suc.food').equals(3);
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(0);

    expectError(`Too early to graze`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    });

    expect(selectGame().status.round, 'round 0').equal(0);
    expect(findPlant('$suc').getFood(), '$suc.food').equals(3);
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPlantGrazing));

    expect(findPlant('$suc').getFood(), '$suc.food').equals(2);
  });

  it('[PLANTARIUM] TraitPlantHomeothermy:', function () {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
  settings:
    addon_plantarium: true
  phase: feeding
  plants: succ $suc +++++
  players:
    - continent: $A mass fat fat planthomeo, $B mass, $W wait +
  `);
    const {selectGame, findAnimal, findPlant, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));

    expectError(`Too early to eat`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    });

    expect(selectGame().status.round, 'round 0').equal(0);
    expect(findPlant('$suc').getFood(), '$suc.food').equals(4);
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(0);
    expect(findAnimal('$W').getFood(), '$W.getFood()').equal(1);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPlantHomeothermy, '$suc'));

    expect(selectGame().status.round, 'round 0').equal(0);
    expect(findPlant('$suc').getFood(), '$suc.food').equals(3);
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(2);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(0);
    expect(findAnimal('$W').getFood(), '$W.getFood()').equal(1);
  });

  it('[PLANTARIUM] TraitSpecialization', function () {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: deploy
plants: carn $carn + aqua tree, eph $eph +++ 
players:
  - continent: $A fat fat, $W wait +
    hand: special
    `);
    const {selectGame, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A', false, '$carn'));

    expectError(`Cannot eat from $eph`, tt.TraitSpecialization, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$eph'));
    });

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$carn'));

    expect(findAnimal('$A'), '$A is OK').ok;
    expect(findAnimal('$A').getFood(), '$A got food').equal(1);
  });
});
















