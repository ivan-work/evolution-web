import logger from '../../../shared/utils/logger';
import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';

import {gameEndTurnRequest, traitActivateRequest} from '../actions';
import {makeGameSelectors} from '../../selectors'
import {gameDeployPlantTraitRequest} from "../game";
import ERRORS from "../errors";
import {traitTakeCoverRequest, traitTakeFoodRequest} from "../trait";

describe('[PLANTARIUM] Covers:', function () {
  it('Players can take covers', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 5 spiky
phase: feeding
plants: Succ $suc * +++, Succ $suc2 *** +++
players:
  - continent: $A carn, $B, $C, $W wait +
`);
    const {selectGame, findPlant, findCard, findPlayerByIndex} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitTakeCoverRequest('$B', '$suc'));

    expectError(`$B can't take more this turn`, ERRORS.PLANT_COVERS_ZERO, () => {
      clientStore0.dispatch(traitTakeCoverRequest('$B', '$suc'));
    });

    expectError(`$C can't take more because cooldown`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitTakeCoverRequest('$C', '$suc2'));
    });

    clientStore0.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn, 'turn 0').equal(0);
    expect(selectGame().status.round, 'round 1').equal(1);

    expectError(`Can't take more next turn`, ERRORS.PLANT_COVERS_ZERO, () => {
      clientStore0.dispatch(traitTakeCoverRequest('$B', '$suc'));
    });

    expectError(`Can't take more next turn`, ERRORS.ANIMAL_IN_COVER, () => {
      clientStore0.dispatch(traitTakeCoverRequest('$B', '$suc2'));
    });

    expectError(`Can't take more next turn`, ERRORS.PLANT_COVERS_ZERO, () => {
      clientStore0.dispatch(traitTakeCoverRequest('$C', '$suc'));
    });

    expectError(`Can't take more next turn`, 'checkTarget', () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    });

    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A', '$suc2'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$B', '$suc2'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$C', '$suc2'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn, 'turn 1').equal(1);

    expect(findPlant('$suc2'), '$suc2 dead').not.ok;
    expect(findPlant('$suc'), '$suc alive').ok;
    expect(findPlant('$suc').covers, 'succ covers').equal(1);

    const User0 = findPlayerByIndex(0);
    clientStore0.dispatch(gameDeployPlantTraitRequest(findCard(User0, ptt.PlantTraitSpiky), '$suc'));

    expect(findPlant('$suc').covers, 'deploy covers').equal(1);
    expect(findPlant('$suc').coverSlots, 'deploy cover slots').equal(4);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(findPlant('$suc').coverSlots, 'Spiky cover slots').equal(4);
    expect(findPlant('$suc').covers, 'Spiky covers').equal(4);
  });
});
















