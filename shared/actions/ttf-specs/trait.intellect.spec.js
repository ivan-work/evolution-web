import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import * as tt from '../../models/game/evolution/traitTypes';

import {PHASE, QuestionRecord} from '../../models/game/GameModel';
import {TRAIT_ANIMAL_FLAG} from '../../models/game/evolution/constants';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors} from '../../selectors';

describe('TraitIntellect:', () => {
  it('Static: 1', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait
  - continent: $B + camo
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(findAnimal('$A').getFood(), 'Animal#A.getFood()').equal(2);
    expect(findAnimal('$B'), '$B is dead').null;
  });

  it('Static: 2', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait
  - continent: $B + burr camo
`);
    const {selectGame, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged('Static Defence: 2', () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    }, serverStore, clientStore0);
  });

  it('Static: 1, Possible: 1', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait
  - continent: $B + camo tail
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectGame().question, 'Defense Question').ok;
    expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Defense Question0').null;
    expect(clientStore1.getState().getIn(['game', 'question', 'id']), 'Defense Question1').ok;
    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitTailLoss'));

    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectPlayer(User1).continent, 'User1.continent').size(1);
  });

  it('Static: 0, Possible: 1', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait
  - continent: $B + run tail
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
      expect(selectGame().question, 'Intellect Question').ok;
      expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Intellect Question0').ok;
      expect(clientStore1.getState().getIn(['game', 'question', 'id']), 'Intellect Question1').null;
      clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));

      expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(2);
      expect(selectPlayer(User1).continent, 'User1.continent').size(0);
    });
  });

  it('Static: 0, Possible: 2', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait
  - continent: $B + run tail
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
      expect(selectGame().question, 'Intellect Question').ok;
      expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Intellect Question0').ok;
      expect(clientStore1.getState().getIn(['game', 'question', 'id']), 'Intellect Question1').null;
      clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitRunning'));
      expect(selectGame().question, 'Defense Question').ok;
      expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Defense Question0').null;
      expect(clientStore1.getState().getIn(['game', 'question', 'id']), 'Defense Question1').ok;
      clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitRunning'));
    });

    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectPlayer(User1).continent, 'User1.continent').size(1);
  });

  it('No bullshit', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $Q carn int
  - continent: $A tail mimi, $B
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));

    expectUnchanged('Cannot cancel Intellect', () => {
      clientStore0.dispatch(traitAnswerRequest(null, null));
      clientStore0.dispatch(traitAnswerRequest('TraitIntellect', null));
    }, serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitMimicry'));
    expectUnchanged('Cannot cancel Intellect', () => {
      clientStore1.dispatch(traitAnswerRequest('TraitMimicry', '$B'));
    }, serverStore, clientStore0, clientStore1);
  });

  it('Intellect ignore Poison', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait, $B pois
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitPoisonous'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 0).hasFlag(TRAIT_ANIMAL_FLAG.POISONED)).equal(false);
  });

  it('Intellect ignore Running', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait, $B run
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
      clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitRunning'));
    });
    expect(selectAnimal(User0, 0).getFood()).equal(2);
  });

  it('Intellect may not ignore Running', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait, $B run
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
      clientStore0.dispatch(traitAnswerRequest('TraitIntellect', true));
    });
    expect(selectGame().question, 'selectGame().question').null;
    expect(findAnimal('$B').getFood()).equal(0);
  });

  it('BUG: Intellect > IC + swimming', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 10
players:
  - continent: $Q carn int wait, $W swim ink
`);
    const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$W'));
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));

    expect(findAnimal('$Q').getFood()).equal(0);
    expect(findAnimal('$W')).ok;

    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$W'));

    expect(findAnimal('$Q').getFood()).equal(2);
  });

  it('BUG: Intellect should ignore Shell', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait, $B shell
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitShell'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1)).undefined;
  });

  it('BUG: Intellect should ignore carn + tailloss', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn int wait, $B carn tail
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1)).undefined;
  });

  it('Intellect value resets', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
phase: feeding
players:
  - continent: $A carn int wait +, $B mimi +, $C tail +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitMimicry'));

    expect(selectAnimal(User0, 0).getFood()).equal(3);
    expect(selectAnimal(User0, 2)).undefined;

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$C'));
    expect(selectGame().question).ok;
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 1)).undefined;
  });

  it('Intellect not on CD when Nothing', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
phase: feeding
players:
  - continent: $A carn int wait, $B ink +, $C tail +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.INTELLECT);
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', true));
    clientStore0.dispatch(traitAnswerRequest('TraitInkCloud'));
    expect(selectGame().question).null;

    expect(selectAnimal(User0, 0).getFood()).equal(0);
    expect(selectAnimal(User0, 2)).ok;
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$C'));

    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.INTELLECT);
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User0, 2)).undefined;
  });

  it('Intellect on CD with attacking passive', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 1 camo
phase: feeding
players:
  - continent: $A carn int wait, $B mimi flight, $C swim
`);
    const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectGame().question).not.ok;
    expect(findAnimal('$B')).not.ok;
    expect(findAnimal('$C')).ok;
  });
});