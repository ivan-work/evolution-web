import logger from '../../../shared/utils/logger';

import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";
import {PHASE} from "../../models/game/GameModel";

describe('[PLANTARIUM] PlantTraitMycorrhiza:', function () {
  it(`Saves 2 plants`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 5 camo
phase: feeding
plants: peren $per0 myco$per1, peren $per1 +
players:
  - continent: $0W wait +
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(findPlant('$per0'), '$per0 alive').ok;
    expect(findPlant('$per1'), '$per1 alive').ok;
    expect(findPlant('$per0').getFood(), '$per0.getFood()').equal(1);
    expect(findPlant('$per1').getFood(), '$per1.getFood()').equal(2);
  });

  it(`Saves 3 plants in chain + 2 plants`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 5 camo
phase: feeding
plants: PlantLiana $lia myco$per, PlantGrass $gra0, PlantPerennial $per + myco$leg, PlantGrass $gra1, PlantLegume $leg myco$lia
players:
  - continent: $0W wait +
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(findPlant('$lia'), '$lia alive').ok;
    expect(findPlant('$per'), '$per alive').ok;
    expect(findPlant('$leg'), '$leg alive').ok;
    expect(findPlant('$gra0'), '$gra0 dead').not.ok;
    expect(findPlant('$gra1'), '$gra1 dead').not.ok;
    expect(findPlant('$lia').getFood(), '$lia.getFood()').equal(1);
    expect(findPlant('$per').getFood(), '$per.getFood()').equal(2);
    expect(findPlant('$leg').getFood(), '$leg.getFood()').equal(1);
  });

  it(`Dies with 3 plants in chain + 2 plants`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 5 camo
phase: feeding
plants: PlantLiana $lia myco$per, PlantGrass $gra0, PlantPerennial $per myco$leg, PlantGrass $gra1, PlantLegume $leg myco$lia
players:
  - continent: $0W wait +
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(findPlant('$lia'), '$lia alive').not.ok;
    expect(findPlant('$per'), '$per alive').not.ok;
    expect(findPlant('$leg'), '$leg alive').not.ok;
    expect(findPlant('$gra0'), '$gra0 dead').not.ok;
    expect(findPlant('$gra1'), '$gra1 dead').not.ok;
  });

  it(`3 chains + 3 plants`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 5 camo
phase: feeding
plants: 
  PlantLiana $0lia\
, PlantLiana $1lia myco$1gra\
, PlantLiana $2lia myco$2gra\
, PlantLiana $3lia myco$3gra\
, PlantGrass $0gra\
, PlantGrass $1gra myco$1per\
, PlantGrass $2gra myco$2per +\
, PlantGrass $3gra myco$3per\
, PlantPerennial $0per\
, PlantPerennial $1per myco$1leg\
, PlantPerennial $2per myco$2leg\
, PlantPerennial $3per myco$3leg\
, PlantLegume $0leg\
, PlantLegume $1leg myco$1lia\
, PlantLegume $2leg myco$2lia\
, PlantLegume $3leg +
players:
  - continent: $0W wait +
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    expect(findPlant('$0lia'), '$0lia dead').not.ok;
    expect(findPlant('$0gra'), '$0gra dead').not.ok;
    expect(findPlant('$0per'), '$0per dead').not.ok;
    expect(findPlant('$0leg'), '$0leg dead').not.ok;
    expect(findPlant('$1lia'), '$1lia dead').not.ok;
    expect(findPlant('$1gra'), '$1gra dead').not.ok;
    expect(findPlant('$1per'), '$1per dead').not.ok;
    expect(findPlant('$1leg'), '$1leg dead').not.ok;
    expect(findPlant('$2lia'), '$2lia alive').ok;
    expect(findPlant('$2gra'), '$2gra alive').ok;
    expect(findPlant('$2per'), '$2per alive').ok;
    expect(findPlant('$2leg'), '$2leg alive').ok;
    expect(findPlant('$3lia'), '$3lia alive').ok;
    expect(findPlant('$3gra'), '$3gra alive').ok;
    expect(findPlant('$3per'), '$3per alive').ok;
    expect(findPlant('$3leg'), '$3leg alive').ok;
  });
});
















