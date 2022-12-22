import {
  gameEndTurnRequest
  , gameDeployTraitRequest, server$gamePhaseEndRegeneration
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';
import {replaceGetRandom} from "../../utils/randomGenerator";

describe(tt.TraitMutation, () => {
  it('Works with single trait', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 5 swimming
players:
  - continent: $A mutation +, $B mutation +, $W +
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest())
    expect(selectGame().deck, 'Deck size').size(0);
    expect(findAnimal('$A').hasTrait(tt.TraitSwimming)).ok;
    expect(findAnimal('$B').hasTrait(tt.TraitSwimming)).not.ok;
  });

  it('Works with single trait', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 5 swimming
players:
  - continent: $A mutation swimming +, $B mutation swimming +, $W +
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest())
    expect(selectGame().deck, 'Deck size').size(0);
    expect(findAnimal('$A').traits.filter(trait => trait.type === tt.TraitSwimming)).size(1);
    expect(findAnimal('$B').traits.filter(trait => trait.type === tt.TraitSwimming)).size(1);
  });

  it('Works with double trait', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 4 CardVomitusAndSwimming
players:
  - continent: $A mutation +, $W +
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(gameEndTurnRequest())
    })
    expect(findAnimal('$A').hasTrait(tt.TraitSwimming)).ok;
    expect(findAnimal('$A').hasTrait(tt.TraitVomitus)).not.ok;
    expect(selectGame().deck, 'Deck size').size(0);
  });

  it('Works with double trait with restrictions', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 4 CardVomitusAndSwimming
players:
  - continent: $A mutation swimming +, $W +
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(gameEndTurnRequest())
    })
    expect(findAnimal('$A').hasTrait(tt.TraitSwimming)).ok;
    expect(findAnimal('$A').hasTrait(tt.TraitVomitus)).ok;
    expect(selectGame().deck, 'Deck size').size(0);
  });

  it(`Doesn't work with parasite`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 4 parasite
players:
  - continent: $A mutation +, $W +
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest())
    expect(selectGame().deck, 'Deck size').size(0);
    expect(findAnimal('$A').traits).size(1)
  });

  it(`Doesn't work with communication`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 4 communication
players:
  - continent: $A mutation +, $W +
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest())
    expect(selectGame().deck, 'Deck size').size(0);
    expect(findAnimal('$A').traits).size(1)
  });

  it(`Doesn't work with plant traits`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
deck: 4 aquatic
players:
  - continent: $A mutation +, $W +
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest())
    console.log(findAnimal('$A').toString())
    expect(selectGame().deck, 'Deck size').size(0);
    expect(findAnimal('$A').traits).size(1)
  });
});















