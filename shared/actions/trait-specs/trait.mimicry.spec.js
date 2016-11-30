import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitMimicry:', () => {
  it('$A > $B ($C camo)', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C camo
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B m> $C', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B m> $C m> $B', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C mimicry
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B QA m> $C', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C, $D
`);
    const {selectGame, selectQuestionId, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectGame().question).ok;
    expect(selectGame().question.get('id')).ok;
    expect(selectQuestionId()).ok;
    const questionId = selectQuestionId();
    expect(ClientGame0().question, 'ClientGame0().question').ok;
    expect(ClientGame1().question, 'ClientGame1().question').ok;
    expect(ClientGame0().question.get('id')).equal(null);
    expect(ClientGame1().question.get('id')).equal(questionId);
    clientStore1.dispatch(traitDefenceAnswerRequest(questionId, 'TraitMimicry', '$C'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });

  it('$A > $B m> $C m> $B', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C mimicry, $D
`);
    const {selectGame, selectQuestionId, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    clientStore1.dispatch(traitDefenceAnswerRequest(selectQuestionId(), 'TraitMimicry', '$C'));

    clientStore1.dispatch(traitDefenceAnswerRequest(selectQuestionId(), 'TraitMimicry', '$B'));

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });

  it('$A > $B (auto)> $C ($D)', async () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C, $D
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectAnimal(User0, 0).getFood()).equal(0);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$C');
    expect(selectAnimal(User1, 2).id).equal('$D');

    await new Promise(resolve => setTimeout(resolve, 1));

    expect(selectAnimal(User0, 0).getFood(), '').equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });
});