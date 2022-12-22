import * as tt from "../../models/game/evolution/traitTypes";
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {traitActivateRequest} from "../trait";
import {gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import {replaceGetRandom} from "../../utils/randomGenerator";
import {PHASE} from "../../models/game/GameModel";

describe(tt.TraitPest, () => {
  it(`Works`, () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: deploy
players:
  - continent: $A TraitPest, $B TraitPest, $W + waiter
    hand: Pest
  - continent: $C
`);
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    const {selectCard0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$C'));
    replaceGetRandom(() => 8, () => {
      clientStore1.dispatch(gameEndTurnRequest())
    })
    expect(selectGame().getFood()).equal(7)
  });

  it(`Works with plantarium`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
settings:
  addon_plantarium: true
plants: PlantEphemeral $eph ++\
  , PlantPerennial $per ++\
  , PlantLegume $leg ++
deck: 10 camo
players:
  - continent: $A TraitPest +, $W + waiter
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(gameEndTurnRequest())
      clientStore0.dispatch(gameEndTurnRequest())
    })
    expect(findPlant('$eph').getFood()).equal(3)
    expect(findPlant('$per').getFood()).equal(2)
    expect(findPlant('$leg').getFood()).equal(4)
    expect(selectGame().status.toJS()).include({turn: 1, phase: PHASE.FEEDING})
  });
});