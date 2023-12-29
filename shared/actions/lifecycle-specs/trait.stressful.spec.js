import * as tt from '../../models/game/evolution/traitTypes';
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {traitActivateRequest, traitAnswerRequest, traitTakeFoodRequest} from "../trait";
import {gameDeployAnimalRequest, gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import ERRORS from "../errors";
import {gamePlantAttackRequest} from "../game.plantarium";

//     TraitStressful: Когда $A атаковано хищником, оно получает $F.

describe(`${tt.TraitStressful}:`, () => {
  it(`works with ${tt.TraitBurrowing}`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $B burr stress, $W wait +
`);
    const {findAnimal, selectAnimal, selectGame} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(findAnimal('$B').getFood(1));
    expect(findAnimal('$W')).ok
  })

  it(`works with ${tt.TraitTailLoss}`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $B tail stress, $W wait +
`);
    const {findAnimal, selectAnimal, selectGame} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitStressful));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss));

    expect(findAnimal('$B').getFood(1));
  })

})