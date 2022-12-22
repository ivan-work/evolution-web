import * as tt from "../../models/game/evolution/traitTypes";
import {makeGameSelectors} from "../../selectors";
import {traitActivateRequest} from "../trait";

describe(tt.TraitOviparous, () => {
  it(`Works`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A TraitOviparous, $W + waiter
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitOviparous))
    expect(selectGame().getFood()).equal(1)
  });

  it(`Works with plantarium`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
settings:
  addon_plantarium: true
plants: PlantEphemeral $eph\
  , PlantPerennial $per\
  , PlantLegume $leg
players:
  - continent: $A TraitPlantOviparous, $W + waiter
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPlantOviparous, '$eph'))
    expect(selectGame().getFood()).equal(0)
    expect(findPlant('$eph').getFood()).equal(1)
  });

  it(`Works with plantarium perennial`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
settings:
  addon_plantarium: true
plants: PlantEphemeral $eph\
  , PlantPerennial $per +++\
  , PlantLegume $leg
players:
  - continent: $A TraitPlantOviparous, $W + waiter
`);
    const {selectGame, findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPlantOviparous, '$per'))
    expect(selectGame().getFood()).equal(0)
    expect(findPlant('$per').getFood()).equal(4)
  });
});