import * as tt from "../../models/game/evolution/traitTypes";
import {makeGameSelectors} from "../../selectors";
import {traitActivateRequest} from "../trait";
import {GAME_TRAIT_TARGET_ERROR} from "../../errors/ERR";
import {gameEndTurnRequest} from "../game";
import {PHASE} from "../../models/game/GameModel";

describe(tt.TraitParalysis, () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A photo thermo paralysis carn, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectError(`Can't use any traits`, tt.TraitParalysis, () => clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPhotosynthesis)))
    expectError(`Can't use any traits`, tt.TraitParalysis, () => clientStore0.dispatch(traitActivateRequest('$A', tt.TraitThermosynthesis)))
    expectError(`Can't use any traits`, tt.TraitParalysis, () => clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$W')))
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitParalysis))
    clientStore0.dispatch(gameEndTurnRequest())
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPhotosynthesis))
    expect(findAnimal('$A').getFood()).equal(1);
  })

  it('Works with recombination', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 10 camo
food: 10
players:
  - continent: $A photo thermo paralysis carn recomb$B coop$B, $B mass carn swim camo, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectError(`Can't use any traits`, tt.TraitParalysis, () =>
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitRecombination, tt.TraitSwimming, tt.TraitPhotosynthesis))
    )
  });

  it('Works on second turn', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 10 camo
food: 10
players:
  - continent: $A photo thermo paralysis flea +, $W + waiter
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectError(`Can't use any traits`, tt.TraitParalysis, () =>
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPhotosynthesis))
    )
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitParalysis))
    clientStore0.dispatch(gameEndTurnRequest())
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitPhotosynthesis))
    clientStore0.dispatch(gameEndTurnRequest())
    clientStore0.dispatch(gameEndTurnRequest())
    clientStore0.dispatch(gameEndTurnRequest())
    expect(selectGame().status.toJS()).include({turn: 1, phase: PHASE.FEEDING})
    expectError(`Can't use any traits`, tt.TraitParalysis, () =>
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitThermosynthesis))
    )
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitParalysis))
    clientStore0.dispatch(gameEndTurnRequest())
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitThermosynthesis))
    expect(findAnimal('$A').getFood()).equal(1)
  });
});