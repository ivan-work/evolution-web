import * as tt from '../../models/game/evolution/traitTypes';
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {traitActivateRequest, traitTakeFoodRequest} from "../trait";
import {gameDeployAnimalRequest, gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import ERRORS from "../errors";
import {gamePlantAttackRequest} from "../game.plantarium";

// TraitSpores: >-
//       Если в фазу вымирания $A осталось ненакормленным, выложите все его свойства как новых накормленных $A.
//       Эти $A не приносят новых карт в конце этого хода.
//       $TraitSpores не действуют в последний ход игры.

describe(`${tt.TraitSpores}:`, () => {
  it(`works`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A cystinitial angler coop$B camo tail spores, $B, $W wait +
`);
    const {findAnimal, selectAnimal, selectGame} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameEndTurnRequest());
    expect(findAnimal('$A')).null;
    expect(findAnimal('$B')).null;
    expect(findAnimal('$W')).ok
    expect(selectAnimal(User0.id, 0).id).equal('$W')
    expect(selectAnimal(User0.id, 1)).ok // camo
    expect(selectAnimal(User0.id, 2)).ok // tail
    expect(selectAnimal(User0.id, 3)).ok // spores
    expect(selectAnimal(User0.id, 4)).undefined
    expect(selectGame().deck.size).equal(10 - 2 /* 1 + $W */)
  })

})