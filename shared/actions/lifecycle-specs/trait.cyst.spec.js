import * as tt from '../../models/game/evolution/traitTypes';
import {makeClientGameSelectors, makeGameSelectors} from "../../selectors";
import {traitActivateRequest, traitTakeFoodRequest} from "../trait";
import {gameDeployAnimalRequest, gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import ERRORS from "../errors";
import {gamePlantAttackRequest} from "../game.plantarium";

//     TraitCyst: >-
//       Можно сыграть только как $A.
//       Когда хищник съедает такое $A, он получает свойство $TraitCyst.
//       Когда хищник съедает $A с $TraitCyst, он переместите свойство на хищника.
//       Когда $A с цистой вымирает, положите свойство как новое $A.

describe(`${tt.TraitCyst}:`, () => {
  it(`Can play only as animal`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 1 camo
phase: deploy
players:
  - hand: cystinit
    continent: $A
`);
    const {selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectAnimal0, selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectAnimal1, selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    expectError(`Cannot deploy as a trait`, ERRORS.TRAIT_PLACEMENT_HIDDEN, () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));
    }, serverStore, clientStore0)

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id), 0);
    expect(selectAnimal(User0, 0).id).not.equal('$A');
    expect(selectAnimal(User0, 0).traits, `Server can see ${tt.TraitCyst}`).size(1);
    expect(selectAnimal0(User0, 0).traits, `User0 can see ${tt.TraitCyst}`).size(1);
    expect(selectAnimal1(User0, 0).traits, `User1 can't see ${tt.TraitCyst}`).size(0);
  })

  it('Cannot deploy as a trait', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
phase: deploy
players:
  - hand: cyst
    continent: $A
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

  });

  it(`${tt.TraitCarnivorous} eat cyst`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 3
players:
  - continent: $A carn, $Ac cystinit, $B carn, $Bc cystinit, $W wait
`);
    const {findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$Ac'));
    clientStore0.dispatch(gameEndTurnRequest())
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$Bc'));
    expect(findTrait('$A', tt.TraitCyst)).ok;
    expect(findTrait('$B', tt.TraitCyst)).ok;
  })

  it(`${tt.TraitCarnivorous} plant is not affected`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantCarn $carA ++
players:
  - continent: $A cyst, $W wait
`);
    const {findAnimal, findPlant} = makeGameSelectors(serverStore.getState, gameId);

    expect(findPlant('$carA').traits.size).equal(2);
    clientStore0.dispatch(gamePlantAttackRequest('$carA', '$A'));
    expect(findAnimal('$A')).null;
    expect(findPlant('$carA').traits.size).equal(2);
  })

  it(`Extinction`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A cyst, $B cystinitial, $W wait +
`);
    const {findAnimal, selectAnimal, selectGame} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameEndTurnRequest());
    expect(findAnimal('$A')).null;
    expect(findAnimal('$B')).null;
    expect(findAnimal('$W')).ok
    expect(selectAnimal(User0.id, 0).id).equal('$W')
    expect(selectAnimal(User0.id, 1)).ok
    expect(selectAnimal(User0.id, 1).traits.toSeq().first().type).equal(tt.TraitCystInitial)
    expect(selectAnimal(User0.id, 2)).undefined
    expect(selectGame().deck.size).equal(10 - 3 /* 1 + $W + new animal */)
  })

})