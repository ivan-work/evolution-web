import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
} from '../actions';

import {QuestionRecord, PHASE} from '../../models/game/GameModel';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe('TraitAnglerfish:', () => {
  it('Deploy', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 1
players:
  - hand: angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectAnimal0, selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectAnimal1, selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id));
    expect(selectAnimal(User0, 0).traits, `Server can see anglerfish`).size(1);
    expect(selectAnimal0(0).traits, `User0 can see anglerfish`).size(1);
    expect(selectAnimal1(0, User0).traits, `User1 can't see anglerfish`).size(0);
  });

  it('Cannot deploy as a trait', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: 1
players:
  - hand: angler
    continent: $A
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged('Cannot deploy as a trait', () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));
    }, serverStore, clientStore0)
  });

  it('Defend itself', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $A carn, $B angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).traits).size(1);
    expect(selectAnimal(User0, 0).id).equal('$B');
  });

  it('Questions', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 10
players:
  - continent: $Q carn tail camo graz, $W carn camo mass, $E carn tail mimi, $E2 tail
  - continent: $A angler +, $S angler +, $D angler +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));
    clientStore0.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitCarnivorous'));
    expect(selectAnimal(User0, 0)).ok;

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$E', 'TraitCarnivorous', '$D'));
    clientStore1.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$E2'));

    expect(selectAnimal(User0, 0)).ok;
    expect(selectAnimal(User0, 1)).ok;
    expect(selectAnimal(User0, 2)).ok;
    expect(selectAnimal(User0, 0).id).equal('$Q');
    expect(selectAnimal(User0, 1).id).equal('$W');
    expect(selectAnimal(User0, 2).id).equal('$E');
    expect(selectAnimal(User0, 3)).undefined;
    expect(selectAnimal(User1, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 1).getFood()).equal(1);
    expect(selectAnimal(User1, 2).getFood()).equal(2);
  });

  it('Tailloss shouldnt be able to lose Angler', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 10
players:
  - continent: $Q carn
  - continent: $A tail angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));
    expect(selectAnimal(User0, 0)).ok;
    expect(selectAnimal(User0, 0).getFood()).equal(1);
  });

  it('bug v043', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 10
players:
  - continent: $Q carn intel camo tail angler ink wait, $W angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$W'));

    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    clientStore0.dispatch(traitAnswerRequest('TraitInkCloud'));

    expect(selectAnimal(User0, 0)).ok;
    expect(selectAnimal(User0, 1)).ok;
    expect(selectAnimal(User0, 0).getFood()).equal(0);
    expect(selectAnimal(User0, 1).getFood()).equal(0);
  });

  it('bug v043 2', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 10
players:
  - continent: $Q carn intel tail angler ink wait, $W angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$W'));

    expect(selectGame().question.type).equal(QuestionRecord.INTELLECT);
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
  });

  it('bug Flight+Carn+Camo dies from Anglerfish', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 10
players:
  - continent: $Q fli carn camo, $W angler
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$W'));

    expect(selectGame().question).not.ok;
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));

    expect(selectAnimal(User0, 0).id).equal('$W');
  });
});