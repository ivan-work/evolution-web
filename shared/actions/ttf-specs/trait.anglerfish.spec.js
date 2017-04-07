import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , gameDeployAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe('TraitAnglerfish:', () => {
  it('Deploy', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
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
    expect(selectAnimal(User0, 1).id).equal('$W');
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$E', 'TraitCarnivorous', '$D'));
    clientStore1.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$E2'));

    //expect(selectAnimal(User0, 0));
    //expect(selectAnimal(User0, 1));
    //expect(selectAnimal(User0, 2));
    //expect(selectAnimal(User0, 3)).ok;
    //expect(selectAnimal(User1, 0).getFatAndFood()).equal(2);
    //expect(selectAnimal(User1, 1).getFatAndFood()).equal(2);
    //expect(selectAnimal(User1, 2).getFatAndFood()).equal(2);
  });
});