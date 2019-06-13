import logger from '../../../shared/utils/logger';

import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {traitTakeFoodRequest} from "../trait";
import {gameEndTurnRequest} from "../game";
import {replaceGetRandom} from "../../utils/randomGenerator";

describe('[PLANTARIUM] PlantTraitHoney:', function () {
  it(`Doesn't take card from self with max cards`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantFungus $fun hon +++
players:
  - continent: $A wait
    hand: 3 camo
  - hand: 1 camo
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$A', '$fun'));
    expect(findPlayerByIndex(0).hand, 'User0.hand').size(3);
    expect(findPlayerByIndex(1).hand, 'User1.hand').size(1);
  });

  it(`Takes card from player with max cards`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(2);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantFungus $fun hon +++
players:
  - continent: $A wait
    hand: 1 camo
  - hand: 3 camo
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$A', '$fun'));
    expect(findPlayerByIndex(0).hand, 'User0.hand').size(2);
    expect(findPlayerByIndex(1).hand, 'User1.hand').size(2);
  });

  it(`Takes card from player 2 with max cards`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(3);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantFungus $fun hon +++
players:
  - continent: $A wait
    hand: 1 camo
  - hand: 3 camo
  - hand: 5 camo
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$A', '$fun'));
    expect(findPlayerByIndex(0).hand, 'User0.hand').size(2);
    expect(findPlayerByIndex(1).hand, 'User1.hand').size(3);
    expect(findPlayerByIndex(2).hand, 'User1.hand').size(4);
  });

  it(`Takes card from random player 1 with max cards`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(3);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantFungus $fun hon +++
players:
  - continent: $A wait
    hand: 1 camo
  - hand: 3 camo
  - hand: 3 camo
`);
    const {selectGame, findPlayerByIndex, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A', '$fun'));
    });
    expect(findPlayerByIndex(0).hand, 'User0.hand').size(2);
    expect(findPlayerByIndex(1).hand, 'User1.hand').size(2);
    expect(findPlayerByIndex(2).hand, 'User1.hand').size(3);
  });
});
















