import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';

describe('TraitNeoplasm:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 15 camo
phase: deploy
players:
  - continent: $A neoplasm coop$B mass trem$B fat=true para, $B wait
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(findAnimal('$A').getWantedFood(), `Neoplasm is waiting`).equal(5);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(findAnimal('$A').getWantedFood(), `Neoplasm disabled massive`).equal(4);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCooperation));
    expect(findAnimal('$B').getFood(), `Neoplasm doesn't disable Cooperation`).equal(1);
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(findAnimal('$A').getWantedFood(), `Neoplasm disabled fat`).equal(4);
    expect(findAnimal('$A').getFat(), `Neoplasm disabled fat`).equal(0);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    expect(findAnimal('$A').canSurvive(), `Neoplasm disabled fat`).equal(false);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn).equal(2);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(findAnimal('$A'), 'Neoplasm killed $A').null;
  });

  it('Places at bottom', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: deploy
players:
  - continent: $A
    hand: 10 neoplasm
  - continent: $B fat fat fat
`);
    const {selectGame, selectPlayer, selectCard, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged(`Can't deploy Neoplasm to yourself`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A', false));
    }, serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B', false));
    expect(selectTrait(User1, 0, 0).type).equal('TraitNeoplasm');
  });

  it('Kills angler', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: deploy
players:
  - continent: $A neoplasm angler, $B wait
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameEndTurnRequest());
    expect(findAnimal('$A')).null;
  });

  it('Disable defenses', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn wait, $B swim neoplasm
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(findAnimal('$A').id).equal('$A');
    expect(findAnimal('$B'), '$B is dead').not.ok;
  });

  it('Drops disabling after loss', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn wait, $B pira neoplasm tail
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitNeoplasm));
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(1);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(0);
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitPiracy, '$A'));
    expect(findAnimal('$A').getFood(), '$A.getFood()').equal(0);
    expect(findAnimal('$B').getFood(), '$B.getFood()').equal(1);
  });

  it('Kills animal with linked traits', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn wait, $B comm$C neoplasm comm$D tail, $C, $D
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B')).null;
  });

  it('Kills instantly', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn wait, $B pira neoplasm tail
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss));
    expect(findAnimal('$A').getFood()).equal(1);
    expect(findAnimal('$B')).null;
  });

  it(`#BUG +${tt.TraitMetamorphose} +${tt.TraitRecombination}: after dropping out, recalculate food`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn neoplasm para meta, $B carn neoplasm para recomb$C, $C fat neoplasm fat, $W wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(findAnimal('$A').foodSize).equal(3);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitMetamorphose, tt.TraitNeoplasm));
    expect(findAnimal('$A').foodSize).equal(4);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(findAnimal('$B').foodSize).equal(3);
    clientStore0.dispatch(traitActivateRequest('$B', tt.TraitRecombination, tt.TraitNeoplasm, tt.TraitFatTissue));
    expect(findAnimal('$B').hasTrait(tt.TraitNeoplasm)).undefined;
    expect(findAnimal('$B').foodSize).equal(4);
  });

  it(`#BUG +${tt.TraitRecombination} +${tt.TraitCooperation}: 
if animal dies after using recombination, coop left alone`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: 
    - $A recomb$B carn neo coop$B swim
    - $B swim amb int carn sharp neo shy
    - $W wait
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitRecombination, tt.TraitSwimming, tt.TraitNeoplasm));
    expect(findAnimal('$A'), '$A dead').not.ok;
    expect(findAnimal('$B').hasTrait(tt.TraitRecombination)).undefined;
    expect(findAnimal('$B').hasTrait(tt.TraitCooperation)).undefined;
  })

  it(`#BUG +${tt.TraitRstrategy}: r-strategy gets disabled by neoplasm`, () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $A rstrat neo swim sharp +, $W wait +
`);
    const {selectGame, findPlayerByIndex, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(findAnimal('$A').hasTrait(tt.TraitRstrategy)).not.ok;

    clientStore0.dispatch(gameEndTurnRequest());

    expect(findAnimal('$A'), '$A is alive').ok;
    expect(findAnimal('$W'), '$W is alive').ok;
    expect(findPlayerByIndex(0).continent).size(2);
  })
});