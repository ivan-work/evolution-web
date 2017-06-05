import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {testShiftTime} from '../../utils/reduxTimeout'
import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitMimicry:', () => {
  it('$A > $B ($C camo)', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn
  - continent: $B mimicry, $C camo
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B ($C) TIMEOUT', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn wait
  - continent: $B mimicry, $C
settings:
  timeTraitResponse: 100
  timeTurn: 100
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    serverStore.dispatch(testShiftTime(100));

    expect(findAnimal('$A').getFoodAndFat()).equal(2);
    expect(findAnimal('$B')).ok;
    expect(findAnimal('$C')).null;
  });

  it('$A > $B m> $C', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn
  - continent: $B mimicry, $C
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B m> $C m> $B', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn
  - continent: $B mimicry, $C mimicry
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B QA m> $C', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn
  - continent: $B mimicry, $C, $D
`);
    const {selectGame, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectGame().question).ok;
    expect(selectGame().question.id).ok;
    const questionId = selectGame().question.id;
    expect(ClientGame0().question, 'ClientGame0().question').ok;
    expect(ClientGame1().question, 'ClientGame1().question').ok;
    expect(ClientGame0().question.get('id'), 'User0 shouldnt know questionId').equal(null);
    expect(ClientGame1().question.get('id')).equal(questionId);
    clientStore1.dispatch(traitAnswerRequest('TraitMimicry', '$C'));
    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });

  it('$A > $B m> $C m> $B', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn graz
  - continent: $B mimicry, $C mimicry, $D
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    clientStore1.dispatch(traitAnswerRequest('TraitMimicry', '$C'));

    //console.log(selectGame().status)
    //console.log(selectGame().cooldowns)

    clientStore1.dispatch(traitAnswerRequest('TraitMimicry', '$B'));

    expect(selectPlayer(User1).continent).size(2);
    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });

  it('$A > $B (auto)> $C ($D)', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: feeding
food: 10
players:
  - continent: $A carn
  - continent: $B mimicry, $C, $D
settings:
  timeTraitResponse: 100
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(0);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$C');
    expect(selectAnimal(User1, 2).id).equal('$D');

    serverStore.dispatch(testShiftTime(100));

    expect(selectAnimal(User0, 0).getFoodAndFat(), '').equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });

  it('$A > $B (mimi)> end', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 10
deck: 20 camo
players:
  - continent: $A carn, $B mimi carn, $C, $D
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$C'));

    expect(selectPlayer(User0).continent).size(3);
    expect(selectAnimal(User0, 0).id).equal('$A');
    expect(selectAnimal(User0, 0).getFoodAndFat()).equal(2);
    expect(selectAnimal(User0, 1).id).equal('$B');
    expect(selectAnimal(User0, 2).id).equal('$D');

    expect(selectGame().status.round, 'round changed').equal(1);
  });
});