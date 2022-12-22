import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , gameDeployTraitRequest
  , gameDeployRegeneratedAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import {TRAIT_ANIMAL_FLAG} from '../../models/game/evolution/constants';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors} from '../../selectors';

describe('TraitCnidocytes:', () => {
  it('Works with running', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $C run cnid wait
`);

    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
      clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
    });
    expect(selectGame().question, `Game shouldn't have question`).null
    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    expect(findAnimal('$A')).ok;
    expect(findAnimal('$C')).ok;
  });

  it('Works with ink', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $C ink cnid wait
`);

    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
      clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
      clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));
      expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    });
  });

  it('Works with flight', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int para, $B flight cnid, $C wait
`);

    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
  });

  it('Works with mimicry', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $B mimi cnid, $C, $D, $W wait
`);

    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$C'));

    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    expect(findAnimal('$B')).ok;
    expect(findAnimal('$C')).null;
    expect(findAnimal('$D')).ok;
  });

  it('Symbiosis', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $A symb$B, $B carn, $C ink cnid wait, $D carn
`);

    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$C'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));
    expect(findAnimal('$B').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(findAnimal('$A').getFood()).equal(1);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCarnivorous, '$A'));
    expect(findAnimal('$A')).null;
  });

  it('Trematode', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $A trem$B tail, $B carn, $C ink cnid wait +, $D carn +
`);

    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(findAnimal('$A').getNeededFood()).equal(2);
    expect(findAnimal('$B').getNeededFood()).equal(3);
    // console.log(findAnimal('$A').traits.toArray())
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$C'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));
    expect(findAnimal('$B').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    // console.log(findAnimal('$A').recalculateFood().getNeededFood())
    expect(findAnimal('$A').getNeededFood(), '$A').equal(1);
    expect(findAnimal('$B').getNeededFood(), '$B').equal(1);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCarnivorous, '$A'));
    expect(findAnimal('$A').getNeededFood()).equal(1);
    expect(findAnimal('$B').getNeededFood()).equal(1);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$B'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn, 'turn').equal(1);
    expect(selectGame().status.phase, 'phase').equal(PHASE.FEEDING);
    // console.log(findAnimal('$A').traits.toArray())
    expect(findAnimal('$A').getNeededFood()).equal(2);
    expect(findAnimal('$B').getNeededFood()).equal(3);
    expect(findAnimal('$B').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).false;
  });

  it('Viviparous', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $A vivi carn ++, $B ink cnid tail wait +
`);

    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(findAnimal('$A').getNeededFood()).equal(1);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss));
    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    expect(selectPlayer(User0).continent).size(2);
  });

  it(`#BUG +${tt.TraitRstrategy}: Should not disable r-strategy`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $A rstrat carn +, $B ink cnid wait +
`);

    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(findAnimal('$A').getNeededFood()).equal(1);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitCnidocytes));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));
    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    expect(selectPlayer(User0).continent).size(2);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectPlayer(User0).continent).size(4);
  });

  it(`#ANOMALY: Should corretly work after death`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $B cnid, $W wait +
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));

    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    expect(selectPlayer(User0).continent).size(2);
  });
});