import * as tt from "../../models/game/evolution/traitTypes";
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import {traitActivateRequest} from "../trait";
import Errors from "../errors";
import {PHASE} from "../../models/game/GameModel";

describe(tt.TraitAmphibious, () => {
  it(`Deploying test`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: deploy
players:
  - hand: 2 Swimming
    continent: $A humus
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectCard0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    expectError(`Can't deploy Swimming`, tt.TraitHumus, () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard0(0).id, '$A'));
    })
  });

  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 10 camo
players:
  - continent: $A Amphibious Swimming camo massive ++, $B Amphibious camo Humus massive ++, $C + Amphibious, $W + waiter
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {findAnimal0, selectPlayer0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    expect(findAnimal('$A').getFood()).equal(2)
    expect(findAnimal('$A').traits.toArray()[1].type, `$A should have ${tt.TraitSwimming}`).equal(tt.TraitSwimming);
    expect(findAnimal('$B').traits.toArray()[2].type, `$B should have ${tt.TraitHumus}`).equal(tt.TraitHumus);
    expect(findAnimal0('$A').traits.toArray()[1].type, `$A should have ${tt.TraitSwimming}`).equal(tt.TraitSwimming);
    expect(findAnimal0('$B').traits.toArray()[2].type, `$B should have ${tt.TraitHumus}`).equal(tt.TraitHumus);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitAmphibious))
    expect(findAnimal('$A').traits.toArray()[1].type, `$A should have ${tt.TraitHumus}`).equal(tt.TraitHumus);
    expect(findAnimal0('$A').traits.toArray()[1].type, `$A should have ${tt.TraitHumus}`).equal(tt.TraitHumus);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitAmphibious))
    expect(findAnimal('$B').traits.toArray()[2].type, `$B should have ${tt.TraitSwimming}`).equal(tt.TraitSwimming);
    expect(findAnimal0('$B').traits.toArray()[2].type, `$B should have ${tt.TraitSwimming}`).equal(tt.TraitSwimming);
    clientStore0.dispatch(gameEndTurnRequest());
    expectError('Has no trait error', Errors.TRAIT_ACTION_NO_TRAIT, () =>
      clientStore0.dispatch(traitActivateRequest('$C', tt.TraitAmphibious))
    )
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(findAnimal('$A').traits.toArray()[1].type, `$A should have ${tt.TraitHumus}`).equal(tt.TraitHumus);
    expect(findAnimal0('$A').traits.toArray()[1].type, `$A should have ${tt.TraitHumus}`).equal(tt.TraitHumus);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitAmphibious))

    expect(findAnimal('$A').traits.toArray()[1].type, `SERVER: $A should have ${tt.TraitSwimming}`).equal(tt.TraitSwimming);
    expect(findAnimal0('$A').traits.toArray()[1].type, `CLIENT: $A should have ${tt.TraitSwimming}`).equal(tt.TraitSwimming);

    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitAmphibious))
  });
});