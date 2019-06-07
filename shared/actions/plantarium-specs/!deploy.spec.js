import logger from '../../../shared/utils/logger';
import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';

import {
  gameDeployAnimalRequest
} from '../actions';
import {makeGameSelectors, makeClientGameSelectors} from '../../selectors'
import {gameDeployPlantTraitRequest, gameDeployTraitRequest} from "../game";

describe('[PLANTARIUM] Deploy:', function () {
  it('Players can deploy plant traits', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: deploy
plants: PlantEphemeral $eph ++\
  , PlantPerennial $per ++
deck: 5 camo
players:
  - hand: 4 aqua
    continent: $A
`);
    const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectPlayer0, findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const cardIds = selectPlayer0().hand.map(({id}) => id).toArray();

    // Deploy PlantTraitAquatic as normal animal
    clientStore0.dispatch(gameDeployAnimalRequest(cardIds[0], 0));
    expect(selectPlayer0().continent.first()).ok;

    expectUnchanged(`Can't deploy PlantTraitAquatic to animal`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(cardIds[1], '$A'))
    }, serverStore, clientStore0);

    // Deploy PlantTraitAquatic to a plant
    clientStore0.dispatch(gameDeployPlantTraitRequest(cardIds[1], '$eph'));

    expect(findPlant('$eph').traits).size(1);
    expect(findPlant('$eph').traits.first().type).equal(ptt.PlantTraitAquatic);

    expectUnchanged(`Can't deploy another PlantTraitAquatic to plant`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(cardIds[2], '$A'))
    }, serverStore, clientStore0);
  });

  it('Player can deploy linked PlantTrait', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: deploy
plants: PlantEphemeral $eph ++\
  , PlantPerennial $per ++
deck: 5 camo
players:
  - hand: 4 Mycorrhiza
    continent: $A
`);
    const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectPlayer0, findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const cardIds = selectPlayer0().hand.map(({id}) => id).toArray();

    expectUnchanged(`Can't deploy PlantTraitMycorrhiza to animal`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(cardIds[0], '$A'))
    }, serverStore, clientStore0);
    expectUnchanged(`Can't deploy PlantTraitMycorrhiza to single plant`, () => {
      clientStore0.dispatch(gameDeployPlantTraitRequest(cardIds[0], '$eph'))
    }, serverStore, clientStore0);

    clientStore0.dispatch(gameDeployPlantTraitRequest(cardIds[0], '$eph', false, '$per'));

    expect(findPlant('$eph').traits).size(1);
    expect(findPlant('$eph').traits.first().type).equal(ptt.PlantTraitMycorrhiza);
    expect(findPlant('$per').traits).size(1);
    expect(findPlant('$per').traits.first().type).equal(ptt.PlantTraitMycorrhiza);
  });
});
















