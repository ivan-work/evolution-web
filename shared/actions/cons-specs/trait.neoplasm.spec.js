import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitNeoplasm:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 15 camo
phase: deploy
players:
  - continent: $A neoplasm coop$B mass trem$B fat=true para, $B wait
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectAnimal(User0, 0).getWantedFood(), `Neoplasm is waiting`).equal(5);
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectAnimal(User0, 0).getWantedFood(), `Neoplasm disabled massive`).equal(4);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    expect(selectAnimal(User0, 1).getFood(), `Neoplasm doesn't disable Cooperation`).equal(1);
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

    expect(selectAnimal(User0, 0).getWantedFood(), `Neoplasm disabled fat`).equal(4);
    expect(selectAnimal(User0, 0).getFat(), `Neoplasm disabled fat`).equal(0);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectAnimal(User0, 0).canSurvive(), `Neoplasm disabled fat`).equal(false);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn).equal(2);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(selectAnimal(User0, 0).getWantedFood(), `Neoplasm disabled parasite`).equal(2);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn).equal(3);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);

    expect(selectAnimal(User0, 0).id, 'Neoplasm killed $A').equal('$B');
  });

  it('Places at bottom', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: deploy
players:
  - continent: $A
    hand: 10 neoplasm
  - continent: $B fat fat fat
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expectUnchanged(`Can't deploy Neoplasm to yourself`, () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A', false));
    }, serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B', false));
    expect(selectTrait(User1, 0, 0).type).equal('TraitNeoplasm');
  });

  it('Kills angler', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: deploy
players:
  - continent: $A neoplasm angler, $B wait
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectAnimal(User0, 0).id).equal('$B');
  });

  it('Disable defences', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn wait, $B swim neoplasm
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).id).equal('$A');
    expect(selectAnimal(User0, 1), '$B is dead').not.ok;
  });
});