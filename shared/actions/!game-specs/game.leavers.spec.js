import {Map, List} from 'immutable';

import {
  gameDeployTraitRequest
  , gameDeployAnimalRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , SOCKET_DISCONNECT_NOW
} from '../actions';

import {replaceGetRandom} from '../../utils/randomGenerator';

import {PHASE} from '../../../shared/models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('Game (LEAVERS):', function () {
  it('Deploy, User1 leaves', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    const gameId = ParseGame(`
phase: prepare
deck: 50 camo
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(User0.id);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.disconnect(SOCKET_DISCONNECT_NOW);
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    expect(selectGame().getIn(['status', 'turn']), 'turn').equal(0);
    expect(selectGame().getIn(['status', 'phase']), 'PHASE.DEPLOY').equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'currentPlayer').equal(User0.id);
    expect(selectGame().getPlayer(User0).continent).size(3);
    expect(selectGame().getPlayer(User1).continent).size(1);
    expect(selectGame().getPlayer(User2).continent).size(3);
  });

  it('User0 leaves before feeding starts', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    const gameId = ParseGame(`
phase: prepare
deck: 50 camo
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(User0.id);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(selectGame().getIn(['status', 'turn']), 'turn').equal(0);
    expect(selectGame().getIn(['status', 'phase']), 'PHASE.FEEDING').equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'currentPlayer').equal(User1.id);
  });

  it(`Handle game with leavers`, () => {
    const [
      {serverStore, ParseGame}
      , {clientStore0, User0}
      , {clientStore1, User1}
      , {clientStore2, User2}
      , {clientStore3, User3}
    ] = mockGame(4);
    const gameId = ParseGame(`
phase: feeding
food: 5
deck: 50 camo
players:
  - hand: 2 camo
    continent: $Q +, $W
  - hand: 2 camo
    continent: $L1 +, $K1
  - hand: 2 camo
    continent: $L2 +, $K2
  - hand: 2 camo
    continent: $A +, $S
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(User0.id);

    clientStore0.dispatch(traitTakeFoodRequest('$W'));

    clientStore1.disconnect(SOCKET_DISCONNECT_NOW);
    clientStore2.disconnect(SOCKET_DISCONNECT_NOW);

    expect(selectPlayer(User1).hand, 'empties hand after leave').size(0);
    expect(selectPlayer(User2).hand, 'empties hand after leave').size(0);

    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(User3.id);

    clientStore3.dispatch(traitTakeFoodRequest('$S'));

    expect(selectGame().getIn(['status', 'turn'])).equal(1);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'Turn 1: User3 first').equal(User3.id);

    expect(selectPlayer(User0).hand).size(5);
    expect(selectPlayer(User1).hand).size(0);
    expect(selectPlayer(User2).hand).size(0);
    expect(selectPlayer(User3).hand).size(5);

    replaceGetRandom(() => 6, () => {
      clientStore3.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(gameEndTurnRequest());
    });

    expect(selectGame().getIn(['status', 'turn'])).equal(1);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'Turn 1: User3 first').equal(User3.id);
    expect(selectGame().getFood(), `Game has 8 food`).equal(8);

    clientStore3.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));
    clientStore3.dispatch(traitTakeFoodRequest('$S'));
    clientStore0.dispatch(traitTakeFoodRequest('$W'));

    expect(selectGame().getIn(['status', 'turn'])).equal(2);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'Turn 2: User0 first').equal(User0.id);
  });
});