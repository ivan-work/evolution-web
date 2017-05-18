import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , traitTakeShellRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitShell:', () => {
  it('Works + food', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 2
players:
  - continent: $A carn comm$D wait, $B carn, $C shell tail piracy, $D shell + fat
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().status.round).equal(0);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$C'));
    clientStore0.dispatch(traitAnswerRequest('TraitShell'));
    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(0);
    expect(selectAnimal(User0, 2).id, 'Animal#C.id').equal('$C');
    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('$C cant eat', () =>
        clientStore0.dispatch(traitTakeFoodRequest('$C'))
      , serverStore, clientStore0);

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$C'))
    expectUnchanged('$B cant attack $C', () =>
      clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$C'))
      , serverStore, clientStore0);

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$D'));
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 3).id, 'Animal#D.id').equal('$D');

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expectUnchanged('$C cant eat', () =>
        clientStore0.dispatch(traitActivateRequest('$C', 'TraitPiracy', '$A'))
      , serverStore, clientStore0);

    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'Animal#C.getFood()').equal(0);
    expect(selectAnimal(User0, 3).getFood(), 'Animal#D.getFood()').equal(1);
  });

  it('Places itself at game', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 5 shell
phase: feeding
food: 
players:
  - continent: $A shell, $B shell +, $C +
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.turn, 'turn deploy').equal(1);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn).equal(1);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(selectGame().getContinent().shells).size(1);

    expectUnchanged('$B cant take shell', () => {
      clientStore0.dispatch(traitTakeShellRequest('$B', selectGame().getContinent().shells.first().id));
    }, serverStore, clientStore0);

    clientStore0.dispatch(traitTakeShellRequest('$C', selectGame().getContinent().shells.first().id));

    expect(selectAnimal(User0, 0).traits).size(1);
    expect(selectAnimal(User0, 1).traits).size(1);
  });
});